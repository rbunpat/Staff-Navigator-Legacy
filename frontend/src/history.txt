<script>
    import { onMount } from "svelte";
  
    let coordinates = "";
    let locations = [];
  
    onMount(() => {
      const dataUrl = "https://st.rbunpat.tech/data/json?limit=4"; // Replace with your API endpoint URL
      fetch(dataUrl)
        .then((response) => response.json())
        .then((data) => {
          locations = data;
          coordinates = `${data[0].latitude}, ${data[0].longitude}`;
          return data;
        });
    });

    export function refreshData() {
      const dataUrl = "https://st.rbunpat.tech/data/json?limit=4";
      fetch(dataUrl)
        .then((response) => response.json())
        .then((data) => {
          coordinates = `${data[0].latitude}, ${data[0].longitude}`;
          locations = data;
          return data;
        });
    }
  
</script>
<!-- <div class="flex flex-col flex-auto mt-52 sm:mt-0"> -->
<div class="text-sm font-bold mt-44 md:mt-16 lg:mt-0">
    <h1>
        Location History
    </h1>
</div>

<div>
  <div class="p-4 text-2xl underline">
    <a href="https://maps.google.com/?q={coordinates}" target="_blank">
        Current Coordinate : <br/> {coordinates}
    </a>
  </div>
  <div>
    <table class="md:text-2xl table-auto mt-5 rounded-lg border-separate border-spacing-4">
      <thead>
          <tr>
              <th>Latitude</th>
              <th>Longitude</th>
              <th>Timestamp (UTC)</th>
          </tr>
      </thead>
      <tbody>
          {#each locations as item}
              <tr>
                  <td>{item.latitude}</td>
                  <td>{item.longitude}</td>
                  <td>{item.timestamp}</td>
              </tr>
          {/each}
      </tbody>
  </table>
</div>
</div>



<div class="py-4">
  <button on:click={refreshData}>
      Refresh Data
  </button>
</div>
  
  <style>
  
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
  