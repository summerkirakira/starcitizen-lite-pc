<script lang="ts">
import LocalizationPage from './LocalizationPage.vue'
import SettingsPage from './SettingsPage.vue'
import HangarPage from './HangarPage.vue'
import PhoneAppPage from './PhoneAppPage.vue'
import LoginPage from './LoginPage.vue'
import BuybackPage from './BuybackPage.vue'
import BugReportPage from './BugReportPage.vue'
import UtilitiesPage from './UtilitiesPage.vue'
import { KeepAlive } from 'vue'
import { useNotification, useMessage } from 'naive-ui'
import { getRefugeSettings, setRefugeSettings } from '../../electron/uitils/settings'
import UserProfile from './UserProfile.vue'
import { applyUserSettings, rsiForceLogin } from '../../electron/uitils/signin'
import Store from 'electron-store'

const store = new Store()


const routes: any = {
  '/': LocalizationPage,
  '/settings': SettingsPage,
  '/hangar': HangarPage,
  '/app': PhoneAppPage,
  '/login': LoginPage,
  '/user-profile': UserProfile,
  '/buyback': BuybackPage,
  '/bug-report': BugReportPage,
  '/utilities': UtilitiesPage
}
export default {
  data() {
    const notification = useNotification()
    const message = useMessage()
    return {
      currentPath: window.location.hash,
      notification,
      message
    }
  },
  computed: {
    currentView() {
      return routes[this.currentPath.slice(1) || '/'] || LocalizationPage
    }
  },
  mounted() {

    const recently_update = store.get('recently_update', null)
    if (recently_update !== null) {
      this.notification.success({
        title: '更新成功',
        content: `星河避难所已更新到版本: ${recently_update}`
      })
      store.set('recently_update', null)
    }

    const refugeSettings = getRefugeSettings()
    window.addEventListener('hashchange', () => {
		  this.currentPath = window.location.hash
		})
    if (refugeSettings.currentUser != null) {
      window.RsiApi.checkAccountStatus().then((res) => {
        console.log(res)
      if (res) {
        const refugeSettings = getRefugeSettings()
        this.message.success(
          `登录成功~欢迎回来，${refugeSettings.currentUser.handle}`,
          { duration: 5000 }
        )
      } else {
        rsiForceLogin(refugeSettings.currentUser.email, refugeSettings.currentUser.password).then((res) => {
          if (res.errors != null) {
            this.notification.error({
              title: '登录失败',
              content: '请重新登录'
            })
            const refugeSettings = getRefugeSettings()
            refugeSettings.currentUser = null
            setRefugeSettings(refugeSettings)
            return
          }
          const refugeSettings = getRefugeSettings()
          refugeSettings.currentUser.rsi_token = window.webSettings.rsi_token
          setRefugeSettings(refugeSettings)
          applyUserSettings()
          this.message.success(
            `重新登录成功...欢迎回来，${refugeSettings.currentUser.handle}(${refugeSettings.currentUser.id})`,
            { duration: 5000 }
          )
        }).catch((err) => {
          this.notification.error({
            title: '自动登录失败',
            content: `请重新登录 (${err.message}})`
          })
          const refugeSettings = getRefugeSettings()
          refugeSettings.currentUser = null
          setRefugeSettings(refugeSettings)
        })
      }
    }).catch((err) => {
      this.notification.error({
        title: '自动登录失败',
        content: `请重新登录 (${err.message}})`
      })
      const refugeSettings = getRefugeSettings()
      refugeSettings.currentUser = null
      setRefugeSettings(refugeSettings)
    })
    }
  }
}

</script>
<template>
    <div class="container">
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