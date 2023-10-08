<script lang="ts">
import LocalizationPage from './LocalizationPage.vue'
import SettingsPage from './SettingsPage.vue'
import HangarPage from './HangarPage.vue'
import PhoneAppPage from './PhoneAppPage.vue'
import LoginPage from './LoginPage.vue'
import { KeepAlive } from 'vue'


const routes: any = {
  '/': LocalizationPage,
  '/settings': SettingsPage,
  '/hangar': HangarPage,
  '/app': PhoneAppPage,
  '/login': LoginPage,
}
export default {
  data() {
    return {
      currentPath: window.location.hash
    }
  },
  computed: {
    currentView() {
      return routes[this.currentPath.slice(1) || '/'] || LocalizationPage
    }
  },
  mounted() {
    window.addEventListener('hashchange', () => {
		  this.currentPath = window.location.hash
		})
  }
}

</script>
<template>
    <div class="container">
        <!-- <a href="#/localization">Localization Page</a> |
        <a href="#/settings">Settings Page</a> |
        <a href="#/hangar">Hangar Page</a> -->
        <KeepAlive>
          <component :is="currentView" style="width: 100%; height: 100%;" />
        </KeepAlive>
        
    </div>
</template>

<style>
  .container {
    width: 100%;
    height: 100%;
  }
</style>