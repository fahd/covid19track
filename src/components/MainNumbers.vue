<template>
  <div class="main-numbers-container">
    
    <div class="global-stats">
      <div
        class="global-stat"
        :class="{ 'loading-block': loading }"
        v-for="(item, idx) of display"
        :key="idx">
        <div 
          v-if="item"
          :class="[`type-${item.type}`]"
        >
        <div class="number total"><count-to :end-val="item.total" :duration="1000" /></div>
        <div 
          :class="['number-title', `type-${item.type}`]"
          >{{ item.totalTitle ?? $t("Total") }} {{item.type[0].toUpperCase() + item.type.slice(1)}}</div>
        </div>
    </div>
  </div>
  <div>
    
  </div>
  <div class="title">
    
  </div>
  <div class="overview-wrapper">
    <div
      class="block overview"
      :class="{ 'loading-block': loading }"
      v-for="(item, idx) of display"
      :key="idx"
    >
    
      <div v-if="item" class="bg-container">  
          <div class="bg-chart" v-if="allTimeSeries">
            <Chart
              :time-series="allTimeSeries[item.type]"
              :data-type="item.type"
              type="minimum"
            ></Chart>
            <div :class="{ [item.color]: true, 'ov-item': true }">
              <div class="ov-title number"> {{ item.title }}</div>
              <div class="number" ref="num">
                <count-to :end-val="item.today" :duration="1000" />
              </div>
            </div>
          </div>
          <div v-else class="bg-loader">
            <span class="loader"></span>
          </div>
      </div>
      
      
    </div>
  </div>
</div>
</template>

<script>
import { ref, defineComponent } from "vue";
import Chart from "./Chart.vue";
import { CountTo } from "vue3-count-to";

export default defineComponent({
  name: "MainNumbers",
  props: {
    loading: {
      type: Boolean,
      default: false,
    },
    overviewData: {
      type: Object,
      required: true,
    },
    allTimeSeries: {
      type: Object,
      required: true,
    },
  },
  components: {
    Chart,
    CountTo,
  },
  data() {
    return {
      display: [null, null, null, null],
    };
  },
  mounted() {
    if (this.overviewData) {
      this.loadDisplay();
    }
  },
  watch: {
    overviewData() {
      this.loadDisplay();
    },
  },
  methods: {
    loadDisplay() {
      const data = this.overviewData
    
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
      const active = {
        color: "orange",
        type: "active",
        title: this.$t("today.critical"),
        today: data.critical,
        totalTitle: this.$t("today.active"),
        total: data.active,
      };
      this.display = [cases, deaths, recovered, active];
    },
  },
});
</script>

<style scoped>

.main-numbers-container {
  display:flex;
  flex-direction: column;
}

.number-title {
  text-align: center;
  margin-top: 0.25em;
}

.number {
  text-align: center;
}
 
.block {
  box-shadow: none;
}

.global-stats {
  justify-content: center;
  display: flex;
}
.global-stat {
  margin: 0 1em;
  font-size: 32px;
}

.type-cases {
  color: #0078ff
}

.type-deaths {
  color: #ff5151
}

.type-recovered {
  color: #28ca00
}

.type-active {
  color: #ff7300;
  display: none;
}
.overview-wrapper {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
}

.overview {
  display: flex;
  justify-content: space-between;
  width: 48%;
  margin-bottom: 1em;
  /* font-weight: bold; */
  font-size: 14px;
  overflow: hidden;
  height: 190px; 
}

.bg-chart {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 190px;
  box-shadow: 0px 10px 20px -1px rgba(0, 0, 0, 0.02);
}

.ov-title {
  font-size: 1em;
  margin-left: 0.25em;
  /* opacity: .6; */
}

.ov-item {
  position: absolute;
      bottom: 0;
    right: 0;
    left: 0;
  z-index: 100;
  display: flex;
    justify-content: center;
    flex-direction: row-reverse;
    background: #f5f5f5;
    border-radius: 0;
    box-shadow: none;
    opacity: 1;
}

.number-title {
  opacity: 0.6;
  line-height: 1.2em;
}

.number {
  font-size: 2em;
  padding-bottom: 10px;
}

.total {
  font-size: 1.3em;
  padding-bottom: 0;
}



.bg-chart::after {
  /* content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: linear-gradient(
    90deg,
    white,
    white,
    rgba(255, 255, 255, 0)
  ); */
}

.red {
  color: var(--red);
}
.black {
  color: var(--black);
}
.blue {
  color: var(--blue);
}
.orange {
  color: var(--orange);
}
.purple {
  color: var(--purple);
}
.green {
  color: var(--green);
}

.bg-loader {
  display: flex;
  height: 100%;
  width: 100%;
  align-items: center;
  justify-content: center;
  background: #fff;
}

.bg-container {
  display: flex;
  width: 100%;
  height: 100%;
}

.loader {
    width: 48px;
    height: 48px;
    border: 5px solid #d7d7d7;
    border-bottom-color: transparent;
    border-radius: 50%;
    display: inline-block;
    box-sizing: border-box;
    animation: rotation 1s linear infinite;
    }

    @keyframes rotation {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
    }
  @media (max-width: 992px) {
   .global-stats {
    flex-direction: column;
   }
   .global-stat {
    margin: 1em 0;
   }

   .overview {
    width: 100%;
   }
} 
</style>
