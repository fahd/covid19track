<template>
  <div class="sidebar">
    <div class="card caseload">By Cases</div>

    <div v-if="!countryList.length">      
      <div class="loading-card" v-for="index in 10" :key="index">
        <div class="loading-bar loading-title"></div>
        <div class="loading-bar loading-subtitle"></div>
        <div class="loading-bar loading-subtitle"></div>
      </div>
    </div>

    
    <div v-else>
      <div
        class="card"
        v-for="(country, index) in countryList"
        :key="index"
        @click="selectCountry(country.country)"
      >
        <div class="country">
          <span class="label-country">{{ country.country }}</span>: 
          <span class="label-cases">
            <count-to :end-val="country.cases" :duration="1000" />
          </span>
        </div>
        <div class="card-stat country-recovered">
          Recovered: 
          <span class="label-recovered">
            <count-to :end-val="country.recovered" :duration="1000" />
          </span>
        </div>
        <div class="card-stat country-deaths">
          Deaths: 
          <span class="label-deaths">
            <count-to :end-val="country.deaths" :duration="1000" />
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { CountTo } from "vue3-count-to";

export default {
  props: {
    countryList: {
      type: Array,
      default: () => [],
    },
    onCountrySelect: {
      type: Function,
      required: true, 
    },
  },
  components: {
    CountTo,
  },
  methods: {
    selectCountry(countryName) {
      this.$emit("country-selected", countryName); 
    },
  },
};
</script>

<style scoped>
/* General Sidebar Styling */
.sidebar {
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  box-shadow: 0px 10px 20px -1px rgba(0, 0, 0, 0.02);
  background: white; /* Ensure the sidebar has a white background */
}

/* Card Styling */
.card {
  padding: 10px;
  transition: all 0.2s ease;
}

.card:hover {
  background: #f5f5f5;
  cursor: pointer;
}

.card-stat {
  line-height: initial;
  color: #666;
  font-size: 16px;
}

.caseload {
  font-size: 24px;
  font-weight: bold;

}

.country {
  font-size: 16px;
  margin: 0.5em 0;
  font-weight: 500;
  -webkit-font-smoothing: antialiased;
  font-family: "Helvetica Neue";
  color: #333;
}

.label-cases {
  color: #ff5151;
}

/* Loading Placeholders */
.loading-card {
  background: #ffffff; /* White background */
  padding: 10px;
  margin-bottom: 15px;
  border-radius: 5px;
  /* border: 1px solid #e0e0e0; Add a subtle border */
}

.loading-bar {
  height: 12px;
  margin-bottom: 8px;
  background: linear-gradient(90deg, #f0f0f0, #e0e0e0, #f0f0f0); /* Light shimmer effect */
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}

.loading-bar.loading-title {
  width: 70%; /* Title bar width */
  height: 16px;
}

.loading-bar.loading-subtitle {
  width: 50%; /* Subtitle bar width */
}

/* Shimmer Animation */
@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* 1. Hide Sidebar on Small Screens (Up to 768px) */
@media (max-width: 768px) {
    .sidebar {
        display: none;
    }
}

/* 2. Adjust Sidebar Width for Tablets (769px to 992px) */
@media (min-width: 769px) and (max-width: 992px) {
    .sidebar {
        width: 150px; /* Adjust width for medium devices */
    }
}

/* 3. Restore Sidebar for Larger Screens (Above 992px) */
@media (min-width: 993px) {
    .sidebar {
        display: block;
        width: 300px; /* Original width or your choice */
    }
}
</style>