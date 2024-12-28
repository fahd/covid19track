<template>
  <div v-if="render" class="main-content fade-in">
    <div class="left">
      <Sidebar
        :country-list="overviewDataByCountry"
        @country-selected="handleCountrySelected"
      />
    </div>
    <div class='right'>
      <div class="main-page">
      <Header 
        :override-title="branding?.mainTitle" 
        :country-list="countryList" 
        v-model="selectedCountry" 
      />
      <StateMap
        v-if="selectedCountry == 'USA' && stateData.length > 0"
        :state-data="stateData"
        :state-totals="stateTotals"
        :loading="!stateData.length"
      />
      <MainNumbers
        :loading="!loaded.overviewData"
        :overview-data="overviewData"
        :all-time-series="loaded.timeSeries ? timeSeries : null"
      />
      <TableMapSection
      section-type="map"
      :country="selectedCountry"
      :loading="!loaded.globalTableData"
      :global-table-data="globalTableData"
    />
      <hr class="divider"/>

    <TableMapSection
      :loading="!loaded.globalTableData"
      :global-table-data="globalTableData"
      :local-table-data="localTableData"
    />
    <hr class="divider"/>
    
        <ChartSection
          :loading="!loaded.timeSeries"
          :all-time-series="timeSeries"
          :is-daily="true"
        />
        <hr class="divider"/>
        <ChartSection :loading="!loaded.timeSeries" :all-time-series="timeSeries" />
        <div class="footer">
          <div class="disclaimer">
            These datasets are retrieved available from disease.sh, a publicly available API for up-to-date COVID-19 data.
          </div>
      </div>
      </div>
      
    </div>
      
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Header from "./components/Header.vue";
import MainNumbers from "./components/MainNumbers.vue";
import StateMap from "./components/StateMap.vue";
import ChartSection from "./components/ChartSection.vue";
import TableMapSection from "./components/TableMapSection.vue";
import Sidebar from "./components/Sidebar.vue";
import {
  getAllCountryData,
  getOverviewData,
  getOverviewDataAllCountries,
  getTimeSeries,
  getCountryList,
  combineVaccineData,
  getStateData
} from "./utils/api";


interface DataTypes {
  render: boolean,
  overviewData: DataItem | null,
  timeSeries: Timeseries | null,
  globalTableData: DataItem[] | null,
  localTableData: DataItem[] | null,
  countryList: CountryListItem[],
  selectedCountry: string,
  errorMsg: string | null,
  loaded: {
    overviewData: boolean,
    timeSeries: boolean,
    globalTableData: boolean,
  },
}

export default defineComponent({
  name: "App",
  components: {
    Header,
    MainNumbers,
    StateMap,
    ChartSection,
    TableMapSection,
    Sidebar
  },
  data(): DataTypes {
    return {
      render: true,
      overviewData: null,
      timeSeries: null,
      globalTableData: null,
      localTableData: null,
      countryList: [],
      stateData: [],
      stateTotals: [],
      selectedCountry: "USA",
      errorMsg: null,
      loaded: {
        overviewData: false,
        timeSeries: false,
        globalTableData: false,
      },
      excludedCountries: ["Popular", "Global", "All Countries and regions"],
      overviewDataByCountry: [], 
    };
  },
  async mounted() {
    try {
      this.updateStatesData(false)
      this.countryList = getCountryList([], this.$t);
      this.updateCountryData();
      this.globalTableData = await getAllCountryData();
      this.loaded.globalTableData = true;
      this.countryList = getCountryList(this.globalTableData, this.$t);
      await combineVaccineData(this.globalTableData);
    } catch (error) {
      this.handleError(error.toString());
    }
  },
  watch: {
    selectedCountry() {
      this.updateCountryData();
      if (this.selectedCountry === 'USA'){
        this.updateStatesData(false)
      }
      else {
        this.updateStatesData(true)
      }
      
    },
    filteredCountryList: {
      immediate: true,
      handler(newList) {
        if (newList.length > 0) {
          this.fetchOverviewDataForCountries(newList);
        }
      },
    }
  },
  computed: {
    filteredCountryList() {
      
      return this.countryList.filter(
        (country) => !this.excludedCountries.includes(country.label)
      );
    },
  },
  methods: {
    handleCountrySelected(countryName) {
    
      this.selectedCountry = countryName;

      
      
    },
    async updateStatesData(empty) {
      if (empty){
        this.stateData = []
        this.stateTotals = []
      }
      else {
        try {
          const result = await getStateData()
          this.stateData = result.data;
          this.stateTotals = result.totals;
        } catch (error) {
          this.handleError(error.toString());
        }
      }
    },
    async updateCountryData() {
      try {
        localStorage.setItem("lastCountry", this.selectedCountry);
        if (this.selectedCountry !== 'USA'){
          this.stateData = []
        }
        this.localTableData = null;
        this.loaded.overviewData = false;
        this.loaded.timeSeries = false;
        this.overviewData = await getOverviewData(this.selectedCountry);
        this.loaded.overviewData = true;
        this.timeSeries = await getTimeSeries(this.selectedCountry);
        this.loaded.timeSeries = true;
        await combineVaccineData(undefined, this.selectedCountry, this.overviewData);
      } catch (error) {
        this.handleError(error.toString());
      }
    },
    async fetchOverviewDataForCountries(countries) {
      const countryNames = countries.map((country) => country.label); 
      try {

        const results = await getOverviewDataAllCountries(countryNames);
        if (results.length > 2){
          this.overviewDataByCountry = results;
        }
      } catch (error) {
        console.error("Failed to fetch overview data for countries:", error);
      }
    },
    handleError(error: string) {
      this.errorMsg = error;
    },
    forceReload() {
      this.render = false;
      this.$nextTick(() => {
        this.render = true;
        window.scrollTo({ top: 0 });
      });
    },
  },
});
</script>

<style>
.alink {
  text-align: center;
  font-size: 1.1em;
  text-decoration: none;
}

.main-content {
  /* display: flex; */
}

.left {
  height: 100vh;
  top: 0px;
  transform: translateX(0%);
  width: 256px;
  position: fixed;
  background: #fff;
  z-index: 1000;
}

.right {
  padding-left: 256px;
  display: flex;
  max-width: 100%;
  flex: 1 0 auto;
}

.main-page {
  flex: 1 1 auto;
  max-width: 80%;
  margin: 0 auto;
  position: relative;
  box-sizing: border-box;
  padding: 10px;
}

@media (max-width: 768px) {
    .main-page {
      max-width: 100%;
    }
}

.footer {
  display: flex;
  justify-content: center;
}

.disclaimer {
  margin: 0.5em 0;
  font-size:18px;
  max-width: 500px;
  line-height: initial;
  text-align: center;
  color: #666;
}


/* 1. Hide Sidebar on Small Screens (Up to 768px) */
@media (max-width: 768px) {
    .left {
        display: none;
    }
    .right {
      padding-left: 0px;
    }
}


/* 
@media (min-width: 769px) and (max-width: 992px) {
    .sidebar {
        width: 150px; /* Adjust width for medium devices
    }
}


 @media (min-width: 993px) {
    .sidebar {
        display: block;
        width: 300px; /* Original width or your choice 
    }
}*/ 
</style>
