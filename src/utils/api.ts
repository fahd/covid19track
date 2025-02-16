const apiUrl = "https://disease.sh/v3/covid-19/";
let allVaccineData: { [key: string]: Vaccine } | null = null;
import { states } from "./states";

async function request(endpoint: string): Promise<any> {
  try {
    const response = await fetch(apiUrl + endpoint);
    return response.json();
  } catch (e: unknown) {
    throw e;
  }
}

export async function combineVaccineData(
  allData?: DataItem[],
  country?: string,
  overview?: DataItem
) {
  const vaccine = await getVaccineData();
  if (!vaccine) return;
  if (country && overview) {
    combineVaccineCountryData(overview, vaccine[country]);
  }
  if (allData) {
    allData.forEach((e: DataItem) => {
      if (e.country) {
        combineVaccineCountryData(e, vaccine[e.country]);
      }
    });
  }
}

function combineVaccineCountryData(target: DataItem, vaccine: Vaccine) {
  if (!vaccine) return;

  target.vaccinated = vaccine.total;
  target.todayVaccinated = vaccine.daily;
}

async function getVaccineData() {
  let res = await request(
    "vaccine/coverage/countries?lastdays=1&fullData=true"
  );
  const resArray = [];
  res.forEach((e: VaccineReturnType) =>
    resArray.push([e.country, e.timeline[0]])
  );
  const worldRes = await request("vaccine/coverage?lastdays=1&fullData=true");
  resArray.push(["all", worldRes[0]]);
  allVaccineData = Object.fromEntries(resArray);
  return allVaccineData;
}

export async function getAllCountryData(): Promise<DataItem[]> {
  const countries = await request(`countries`);
  countries.forEach((e: DataItem) => {
    e.locationName = e.country;
  });
  return countries;
}

export async function getStateData(): Promise<DataItem[]> {
  const statesData = await request(`states`);
  const o: any = [];
  const states_: any = states;
  var min = Infinity;
  var max = -Infinity;
  var total = 0;
  statesData.forEach((e: any) => {
    const stateName = e.state;

    if (e.deaths >= 100) {
      min = Math.min(min, e.deaths);
    }

    max = Math.max(max, e.deaths);
    total += e.deaths;

    if (states.hasOwnProperty(stateName)) {
      const stateData = {
        ...e,
        lat: states_[stateName].lat,
        lng: states_[stateName].lng,
      };
      o.push(stateData);
    }
  });

  const data: any = {
    totals: {
      min,
      max,
      total,
    },
    data: o,
  };

  return data;
}

export async function getOverviewData(country: string): Promise<DataItem> {
  let result, outdated;
  if (country === "all") {
    result = await request(`all?yesterday=true`);
    outdated = true;
  } else {
    result = await request(`countries/${country}`);
    if (result.todayCases == 0) {
      result = await request(`countries/${country}?yesterday=true`);

      outdated = true;
    } else {
      outdated = false;
    }
  }
  return { ...result, outdated };
}

export async function getOverviewDataAllCountries(
  countries: string[]
): Promise<DataItem[]> {
  try {
    const requests = countries.map((country) =>
      request(`countries/${country}`).then((result) => {
        if (result.todayCases === 0) {
          return request(`countries/${country}?yesterday=true`).then(
            (yesterdayResult) => ({
              ...yesterdayResult,
              outdated: true,
            })
          );
        }
        return { ...result, outdated: false };
      })
    );

    const results = await Promise.all(requests);

    results.sort((a, b) => b.cases - a.cases);

    return results;
  } catch (error) {
    console.error("Error country data:", error);
    throw error;
  }
}

export async function getTimeSeries(country: string): Promise<Timeseries> {
  let res = await request(`historical/${country}?lastdays=all`);

  res = res.country ? res.timeline : res;
  let data = res as Timeseries;

  let gotNonZeroData = false;
  let gotZeroAfterNonZero = false;
  const datesToDelete = [];
  for (let i in data.recovered) {
    if (gotZeroAfterNonZero && !data.recovered[i]) {
      datesToDelete.push(i);
    } else if (data.recovered[i] && !gotNonZeroData) {
      gotNonZeroData = true;
    } else if (!data.recovered[i] && gotNonZeroData) {
      gotZeroAfterNonZero = true;
      datesToDelete.push(i);
    }
  }
  datesToDelete.forEach((e) => delete data.recovered[e]);

  data.active = { ...data.recovered };
  for (let i in data.cases) {
    if (!data.recovered[i] || !data.deaths[i]) continue;
    data.active[i] = data.cases[i] - data.deaths[i] - data.recovered[i];
  }

  const url =
    country === "all"
      ? "vaccine/coverage?lastdays=all"
      : `vaccine/coverage/countries/${country}?lastdays=all`;
  let vaccineRes = await request(url);
  vaccineRes = vaccineRes.country ? vaccineRes.timeline : vaccineRes;
  data.vaccinated = vaccineRes;

  for (const [key, timeSeries] of Object.entries(data)) {
    const dailyTimeSeries = {} as TimeseriesItem;
    const tsEntires = Object.entries(timeSeries as TimeseriesItem);
    let lastNumber = 0;
    for (const [key, value] of tsEntires) {
      let diff = value - lastNumber;
      dailyTimeSeries[key] = diff > 0 ? diff : 0;
      lastNumber = value;
    }
    data[key + "Daily"] = dailyTimeSeries;
  }
  return data;
}

export function getCountryList(
  allCountryData: any[],
  t: any
): CountryListItem[] {
  let array = [
    {
      label: t("dropdown.popular"),
      value: "divider0",
      disabled: true,
    },
    {
      label: t("dropdown.world"),
      value: "all",
    },
    {
      label: t("dropdown.us"),
      value: "USA",
    },
    {
      label: t("dropdown.all"),
      value: "divider1",
      disabled: true,
    },
  ] as CountryListItem[];

  if (allCountryData?.length > 0) {
    const popularCountries = array.map((i) => i.value);

    const countryList = allCountryData
      .filter((i) => !popularCountries.includes(i.country))
      .map((i) => ({ label: i.country, value: i.country }));

    array = [...array, ...countryList];
  } else {
    const loading = {
      label: "Country List Loading...",
      value: "divider2",
      disabled: true,
    };

    array.push(loading);
  }

  return array;
}
