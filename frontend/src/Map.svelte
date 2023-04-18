<script>
  import L from "leaflet";
  import "leaflet/dist/leaflet.css";

  import { onMount } from "svelte";

  let coordinates = "";
  let locations = [];
  let lastknownlocation = [];

  onMount(() => {
    const dataUrl = "https://st.rbunpat.tech/data/json?limit=4"; // Replace with your API endpoint URL
    fetch(dataUrl)
      .then((response) => response.json())
      .then((data) => {
        lastknownlocation = data[0];
        locations = data.slice(1);
        console.log(locations)
        coordinates = `${lastknownlocation.latitude}, ${lastknownlocation.longitude}`;
        const map = L.map("trackerMap").setView(
          [lastknownlocation.latitude, lastknownlocation.longitude],
          16
        );
        L.tileLayer(
          "https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=POAr2VLNGDJgkpERTyod",
          {
            attribution: "",
          }
        ).addTo(map);

        L.marker([lastknownlocation.latitude, lastknownlocation.longitude])
          .addTo(map)
          .bindPopup("Latest Tracker Location")
          .openPopup();

        locations.forEach((locations) => {
          L.marker([locations.latitude, locations.longitude])
            .addTo(map)
            .bindPopup(locations.timestamp);
        });

        map.attributionControl.setPrefix(
          '<a href="https://www.maptiler.com" style="position:absolute;left:10px;bottom:10px;z-index:999;"> <img src="https://api.maptiler.com/resources/logo.svg" alt="MapTiler logo" </a>'
        );
        // map.setView([data[3].latitude, data[3].longitude], 16);
        // return data;
      });
  
  });
  
</script>


<div class="relative w-full">
  <div class="h-40 md:h-0 md:pb-[71%]">
    <div id="trackerMap" class="relative inset-0" />
  </div>
</div>

<style>
  #trackerMap {
    width: 100%;
    height: 100%;
    padding-bottom: 100%;
    position: fixed;
  }
  /* .coordinate-label {
    text-align: center;
    font-size: 1.2rem;
    font-weight: bold;
    margin-bottom: 0.5rem;
  } */

  /* @media only screen and (min-width: 640px) {
    .coordinate-label {
      font-size: 1.5rem;
      margin-bottom: 1rem;
    }
  } */
</style>