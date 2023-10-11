<script lang="ts">
import LocalizationPage from './LocalizationPage.vue'
import SettingsPage from './SettingsPage.vue'
import HangarPage from './HangarPage.vue'
import PhoneAppPage from './PhoneAppPage.vue'
import LoginPage from './LoginPage.vue'
import { KeepAlive } from 'vue'
import { useNotification } from 'naive-ui'
import { getRefugeSettings } from '../../electron/uitils/settings'
import UserProfile from './UserProfile.vue'


const routes: any = {
  '/': LocalizationPage,
  '/settings': SettingsPage,
  '/hangar': HangarPage,
  '/app': PhoneAppPage,
  '/login': LoginPage,
  '/user-profile': UserProfile
}
export default {
  data() {
    const notification = useNotification()
    return {
      currentPath: window.location.hash,
      notification
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
    window.RsiApi.checkAccountStatus().then((res) => {
      if (res) {
        const refugeSettings = getRefugeSettings()
        this.notification.success({
          title: '登录成功',
          content: `欢迎回来，${refugeSettings.currentUser.handle}(${refugeSettings.currentUser.id})`
        })
      } else {
        this.notification.error({
          title: '登录失败',
          content: '请重新登录'
        })
      }
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