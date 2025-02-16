<template>
  <n-spin :show="loading">
    <div v-if="render">
      <v-chart
        ref="chart"
        class="chart"
        :option="option"
        :updateOptions="{ notMerge: true }"
      />
    </div>
    <n-empty v-else class="empty" :description="$t('noData')" />
  </n-spin>
</template>

<script>
import Selector from "./Selector.vue";
import VChart, { THEME_KEY } from "vue-echarts";
import { NSpin, NEmpty } from "naive-ui";

export default {
  components: {
    VChart,
    NSpin,
    NEmpty,
    Selector,
  },
  provide: {
    [THEME_KEY]: "light",
  },
  props: {
    tableData: {
      type: Array,
      default: [],
    },
    dataType: {
      type: String,
      default: "total",
    },
    country: {
      type: String,
      default: "all",
    },
    isLocal: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      option: {},
      render: true,
      loading: true,
    };
  },
  mounted() {
    this.register();
  },
  watch: {
    dataType() {
      this.updateChart();
    },
    tableData() {
      this.register();
    },
  },
  computed: {
    mapFile() {
      return "Global";
    },
  },
  methods: {
    register() {
      this.loading = true;
      fetch(`/maps/${this.mapFile.toLowerCase()}.json`)
        .then((response) => response.json())
        .then((mapJson) => {
          let offset = null;
          this.updateChart();
        });
    },
    updateChart() {
      if (!this.tableData || !(this.dataType in this.tableData[0])) {
        this.loading = false;
        this.render = false;
        return;
      }
      const mapData = this.tableData.map((e) => ({
        name: e.locationName,
        value: e[this.dataType],
      }));

      this.loadBarOption(mapData);
      this.render = true;
      this.loading = false;
    },
    loadBarOption(mapData) {
      const barData = mapData
        .sort(function (a, b) {
          return a.value - b.value;
        })
        .slice(-30);

      // this.option feeds into the echart component
      // series data maps to all bars
      this.option = {
        xAxis: {
          type: "value",
        },
        yAxis: {
          type: "category",
          axisLabel: {
            rotate: 0,
          },
          data: barData.map(function (item) {
            return item.name;
          }),
        },
        tooltip: {
          trigger: "item",
          showDelay: 0,
          transitionDuration: 0.2,
          formatter: function (params) {
            var value = (params.value + "").split(".");
            value = value[0].replace(/(\d{1,3})(?=(?:\d{3})+(?!\d))/g, "$1,");
            return params.seriesName + "<br/>" + params.name + ": " + value;
          },
        },
        toolbox: {
          show: true,
          left: "right",
          top: "top",
          feature: {
            dataView: { readOnly: false },
            saveAsImage: {},
          },
        },
        animationDurationUpdate: 300,
        series: {
          type: "bar",
          id: "cases",
          name: this.$t(`type.${this.dataType}`),
          data: barData.map(function (item) {
            return item.value;
          }),
          universalTransition: true,
          itemStyle: {
            color: function (params) {
              return "#5da0fd";
            },
          },
        },
      };
    },
  },
};
</script>

<style scoped>
.chart {
  height: 600px;
}

.center {
  text-align: center;
}
</style>
