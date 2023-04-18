<script>
  import Map from "./Map.svelte";
  import History from "./History.svelte";

  let showMap = true;

  function mapShow() {
    showMap = true;
    document.getElementById("mapButton").classList.add("text-white");
    document.getElementById("mapButton").classList.remove("text-green-400");
    document.getElementById("historyButton").classList.remove("text-white");
    document.getElementById("historyButton").classList.add("text-green-400");
  }

  function mapHide() {
    showMap = false;
    document.getElementById("mapButton").classList.remove("text-white");
    document.getElementById("mapButton").classList.add("text-green-400");
    document.getElementById("historyButton").classList.add("text-white");
    document.getElementById("historyButton").classList.remove("text-green-400");
  }

  function mapShowMobile() {
    showMap = true;
    document.getElementById("mapButtonMobile").classList.add("text-white");
    document.getElementById("mapButtonMobile").classList.remove("text-green-400");
    document.getElementById("historyButtonMobile").classList.remove("text-white");
    document.getElementById("historyButtonMobile").classList.add("text-green-400");
  }

  function mapHideMobile() {
    showMap = false;
    document.getElementById("mapButtonMobile").classList.remove("text-white");
    document.getElementById("mapButtonMobile").classList.add("text-green-400");
    document.getElementById("historyButtonMobile").classList.add("text-white");
    document.getElementById("historyButtonMobile").classList.remove("text-green-400");
  }

  function mobileMenuToggle() {
    document.getElementById("mobileMenu").classList.toggle("hidden");
  }

  function logout(){
    window.location.href = "logout";
  }

</script>

<header class="text-gray-400 bg-gray-900 body-font">

  <div class="container mx-auto flex md:hidden flex-wrap flex-row items-center">
    <a class="flex title-font font-medium items-center text-white m-4">
      <svg xmlns="http://www.w3.org/2000/svg" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" class="w-10 h-10 text-white p-2 bg-green-500 rounded-full fill-none" viewBox="0 0 24 24">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
      </svg>
      <span class="ml-3 text-xl text-white hover:text-green-400 transition-all">Staff-Navigator</span>
    </a>
    <div class="ml-auto flex flex-wrap items-center text-base justify-center">
      <button on:click={mobileMenuToggle} class="flex flex-row outline-none mobile-menu-button">
        <svg
          class="w-6 h-6 text-gray-500"
          fill="none"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
        <path d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>
      </button>
    </div>
  </div>
  <div id="mobileMenu" class="hidden md:hidden">
    <ul>
      <li><a on:click={mapShowMobile} class="block text-sm px-2 py-4 text-white hover:bg-green-500 transition-all font-semibold">Map</a></li>
      <li><a on:click={mapHideMobile} class="block text-sm px-2 py-4 text-white hover:bg-green-500 transition-all font-semibold">Location History</a></li>
      <li><a on:click={logout} class="block text-sm px-2 py-4 text-white hover:bg-green-500 transition-all font-semibold">Logout</a></li>
    </ul>
  </div>
  
  <div class="container mx-auto hidden md:flex flex-wrap p-5 flex-col md:flex-row items-center">
    <a class="flex title-font font-medium items-center text-white mb-4 md:mb-0">
      <svg xmlns="http://www.w3.org/2000/svg" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" class="w-10 h-10 text-white p-2 bg-green-500 rounded-full fill-none" viewBox="0 0 24 24">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
      </svg>
      <span class="ml-3 text-xl text-white hover:text-green-400 transition-all">Staff-Navigator</span>
    </a>
    <nav class="md:ml-auto flex flex-wrap items-center text-base justify-center">
      <a on:click={mapShow} class="mr-5 text-white hover:text-white hover:scale-110 transition-all cursor-pointer" id="mapButton">Map</a>
      <a on:click={mapHide} class="mr-5 text-green-400 hover:text-white hover:scale-110 transition-all cursor-pointer" id="historyButton">Location History</a>
    </nav>
    <a href="/logout" class="inline-flex items-center bg-gray-800 border-0 py-1 px-3 focus:outline-none hover:bg-gray-700 rounded text-base mt-4 md:mt-0">Logout
      <svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" class="w-4 h-4 ml-1" viewBox="0 0 24 24">
        <path d="M5 12h14M12 5l7 7-7 7"></path>
      </svg>
    </a>
    
    <!-- <button class="inline-flex items-center bg-gray-800 border-0 py-1 px-3 focus:outline-none hover:bg-gray-700 rounded text-base mt-4 md:mt-0">Logout
      <svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" class="w-4 h-4 ml-1" viewBox="0 0 24 24">
        <path d="M5 12h14M12 5l7 7-7 7"></path>
      </svg>
    </button> -->
  </div>
</header>

{#if showMap}
  <Map />
{:else}
  <History />
{/if}

<style>
  header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 999;
}

.container {
  width: 100%;
  max-width: none;
}

</style>