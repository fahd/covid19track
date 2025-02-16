<template>
  <div>
    <div class="header">
      <div class="header-title">
        <h2>{{ overrideTitle ?? "COVID-19 Worldwide Cases" }}</h2>
      </div>
      <div class="header-subtitle">
        <p class="subtitle">
          COVID-19 Data available via Open Disease Data API @
          <a
            class="api-link"
            id="apiLink"
            href="https://disease.sh/"
            target="_blank"
            >disease.sh</a
          ><br />
          Data reflects latest up to date reported information.
        </p>
      </div>
      <div class="country-select">
        <n-select
          :value="modelValue"
          @update:value="changeCountry"
          filterable
          placeholder="Select Country"
          :options="countryList"
          :theme-overrides="themeOverrides"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { NSelect } from "naive-ui";
export default {
  name: "Header",
  props: {
    overrideTitle: {
      type: String,
      default: null,
    },
    countryList: {
      type: Array,
      default: [],
    },
    modelValue: {
      type: String,
      default: "all",
    },
  },
  data() {
    return {
      themeOverrides: {
        common: {
          primaryColor: "#000",
        },
        Select: {
          borderRadius: "0",
          border: "none",
          background: "transparent",
          boxShadow: "none",
          padding: "0",
          fontSize: "16px",
          hoverBorderColor: "#ff0000", // Custom hover border color
          focusBorderColor: "#00ff00",
        },
      },
    };
  },
  methods: {
    changeCountry(e) {
      this.$emit("update:modelValue", e);
    },
  },
  components: {
    NSelect,
  },
};
</script>

<style scoped>
.country-select {
  display: flex;
  justify-content: center;
  background: none;
  border: none !important;
  width: 100%;
  font-size: 36px;
  margin: 1em 0;
}

.header {
  padding: 20px 10px;
  text-align: left;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.header-title h2 {
  font-size: 48px;
  color: #333;
  text-align: center;
  margin-bottom: 10px;
}

.header-title h3 {
  opacity: 0.5;
  font-size: 25px;
  margin-top: 0;
}

.header-title {
  line-height: initial;
}

.subtitle {
  text-align: center;
  line-height: initial;
}

.header-subtitle {
  color: #666;
  font-size: 16px;
}

.api-link {
  color: #666 !important;
}

@media only screen and (max-width: 768px) {
  .header {
    padding: 20px 10px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }
}

.country-select .n-select ::v-deep(.n-base-selection) {
  border: none !important;
  background: transparent !important;
  padding: 0 !important;
}
</style>
