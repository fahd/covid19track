<template>
  <div>
    <div class="global-stats">
      <div
        class="global-stat"
        :class="{ 'loading-block': loading }"
        v-for="(item, idx) of display"
        :key="idx"
      >
        <div v-if="item" :class="[`type-${item.type}`]">
          <div class="number total">
            <count-to :end-val="item.total" :duration="1000" />
          </div>
          <div :class="['number-title', `type-${item.type}`]">
            {{ item.totalTitle ?? $t("Total") }}
            {{ item.type[0].toUpperCase() + item.type.slice(1) }}
          </div>
        </div>
      </div>
    </div>
    <div class="title">
      {{ isTableType ? $t("subtitles.table") : $t("subtitles.bar") }}
    </div>
    <n-spin :show="loading">
      <div class="block">
        <Selector :types="dataTypes" v-model="selectedType" />
        <div v-if="isTableType">
          <Table
            class="table"
            v-if="globalTableData"
            :data-type="selectedType"
            :table-data="tableData"
          />
        </div>
        <div v-else>
          <BarView
            class="table"
            v-if="globalTableData"
            :country="country"
            :data-type="selectedType"
            :table-data="tableData"
          />
        </div>
      </div>
    </n-spin>
  </div>
</template>

<script>
import Table from "./Table.vue";
import BarView from "./BarView.vue";
import Selector from "./Selector.vue";
import { NSpin } from "naive-ui";

export default {
  props: {
    sectionType: {
      type: String,
      default: "table",
    },
    globalTableData: {
      type: Object,
      default: null,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    country: {
      type: String,
      default: "all",
    },
  },
  data() {
    return {
      dataTypes: ["total", "daily", "rate"],
      selectedType: "total",
      locationTypes: ["global", "local"],
      selectedLocation: "global",
      display: [null, null, null, null],
    };
  },
  mounted() {
    if (!this.isTableType) {
      this.dataTypes = [
        "cases",
        "deaths",
        "todayCases",
        "todayDeaths",
        "todayRecovered",
        "recovered",
        "tests",
        "critical",
        "casesPerOneMillion",
        "deathsPerOneMillion",
        "testsPerOneMillion",
        "activePerOneMillion",
        "recoveredPerOneMillion",
        "criticalPerOneMillion",
        "population",
      ];
      this.selectedType = this.dataTypes[0];
    }
    if (this.overviewData) {
      this.loadDisplay();
    }
  },
  components: {
    Table,
    BarView,
    NSpin,
    Selector,
  },

  computed: {
    tableData() {
      return this.globalTableData;
    },
    isTableType() {
      return this.sectionType === "table";
    },
  },
  watch: {
    overviewData() {
      this.loadDisplay();
    },
  },
  methods: {
    loadDisplay() {
      const data = this.overviewData;

      const cases = {
        color: "blue",
        type: "cases",
        title: this.$t("today.cases"),
        today: data.todayCases,
        total: data.cases,
      };
      const deaths = {
        color: "red",
        type: "deaths",
        title: this.$t("today.deaths"),
        today: data.todayDeaths,
        total: data.deaths,
      };
      const recovered = {
        color: "green",
        type: "recovered",
        title: this.$t("today.recovered"),
        today: data.todayRecovered,
        total: data.recovered,
      };
      this.display = [cases, deaths, recovered];
    },
  },
};
</script>

<style scoped>
.block {
  min-height: 330px;
}
.table {
  padding-top: 10px;
}
</style>
