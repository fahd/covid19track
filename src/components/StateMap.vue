
<template>
	<div class="states">
	  <div class="states-details">Click on a bubble for more info</div>
	  <div v-if="stateData.length > 0">
		<div ref="mapContainer" style="height: 500px; width: 100%"></div>
	  </div>
	</div>
  </template>
  
  <script>
  import mapboxgl from "mapbox-gl";
  import 'mapbox-gl/dist/mapbox-gl.css';
  var cases = 0;

  export default {
	props: {
	  stateData: {
		type: Array,
		required: true,
	  },
	  stateTotals: {
		type: Array,
		required: true,
	  },
	},
	mounted() {
		if (this.stateData.length > 0){
			this.initializeMap();
		}
	},
	methods: {
		getColorByRange(value){
			if (value <= 15) return 'rgb(251 110 110)'; 
			if (value <= 30) return 'rgb(255 100 100)'; 
			if (value <= 45) return 'rgb(254 50 50)';  
			return 'rgb(219 0 0)'; 
		},
	  initializeMap() {
		mapboxgl.accessToken = process.env.MAPBOX_ACCESSTOKEN; 

		const map = new mapboxgl.Map({
		  container: this.$refs.mapContainer,
		  style: 'mapbox://styles/mapbox/light-v10',
		  center: [-96, 37.8], 
		  zoom: 3.5, 
		  attributionControl: false, 
		});

		const {min, max, total} = this.stateTotals;
		const minRadius = 5;
		const maxRadius = 60;

		map.boxZoom.disable(); 
		map.keyboard.disable(); 
		map.getCanvas().style.cursor = 'default';

		
		map.on('mouseenter', () => {
			map.getCanvas().style.cursor = 'default';
		});
	
		map.on('mouseleave', () => {
			map.getCanvas().style.cursor = 'default';
		});
		  
		  map.addControl(new mapboxgl.NavigationControl());

		  
		  this.stateData.forEach((state) => {
			const dimensions = this.calculateRadius(minRadius,maxRadius, max, state.deaths);
			
			const dimensions_text = `${dimensions}px`;
			cases += state.deaths;
			
			const maxDimensions = `${dimensions * 1.25}px`; 
			const markerElement = document.createElement('svg');
			markerElement.style.width = dimensions_text;
			markerElement.style.height = dimensions_text;
			markerElement.style.borderRadius = '50%';
			markerElement.style.backgroundColor = this.getColorByRange(dimensions)
			markerElement.style.opacity = '0.8';

			markerElement.style.setProperty('--initial-width', dimensions_text);
			markerElement.style.setProperty('--initial-height', dimensions_text);
			markerElement.style.setProperty('--max-width', maxDimensions);
			markerElement.style.setProperty('--max-height', maxDimensions);
			
			markerElement.classList.add('marker-grow-shrink');
			const randomDelay = Math.random() * 2 + 's';  
			markerElement.style.animationDelay = randomDelay;  

			const popup = new mapboxgl.Popup({ 
					offset: 0,
					className: 'custom-popup' 
			}).setHTML(`
				<p><strong>${state.state}</strong></p>
				<p>Cases: ${state.cases.toLocaleString()}</p>
				<p>Active: ${state.active.toLocaleString()}</p>
				<p>Deaths: ${state.deaths.toLocaleString()}</p>
			`)

			const marker = new mapboxgl.Marker(markerElement)
			  .setLngLat([state.lng, state.lat])
			  .setPopup(popup)
			  .addTo(map);
		})
	  },
  
	  
	  calculateRadius(minRadius, maxRadius, maxDeaths, stateDeaths) {
		// Formula for logarithmic scaling
		// \text{radius} = \text{minRadius} + \frac{\log(\text{stateDeaths} + 1)}{\log(\text{maxDeaths} + 1)} \times (\text{maxRadius} - \text{minRadius})

		return minRadius + Math.sqrt(stateDeaths / maxDeaths) * (maxRadius - minRadius);
	  },
	},
  };
  </script>
  
  <style scoped>
  #mapContainer {
	height: 500px;
	width: 100%;
  }

  .states {
	margin-bottom: 5em;
  }

  .states-details {
	text-align: center;
	color: #666;
	font-size: 16px;
  }
  </style>