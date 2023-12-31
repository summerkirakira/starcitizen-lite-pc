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
import { useNotification, useMessage, NModal } from 'naive-ui'
import { getRefugeSettings, setRefugeSettings } from '../../electron/uitils/settings'
import UserProfile from './UserProfile.vue'
import { applyUserSettings, rsiForceLogin } from '../../electron/uitils/signin'
import Store from 'electron-store'
import {removeUserFromDatabase } from '../../electron/uitils/settings';


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
      message,
      showUpdateModal: false,
      updateContent: '',
    }
  },
  computed: {
    currentView() {
      return routes[this.currentPath.slice(1) || '/'] || LocalizationPage
    }
  },
  mounted() {

    window.CirnoApi.getAnnouncement().then((res) => {
      if (res !== null) {
        this.notification.info({
          title: res.title,
          content: res.content
        })
      }
    }).catch((err) => {
      console.log(err)
    })

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
          removeUserFromDatabase(refugeSettings.currentUser)
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

    let vm = this
    vm.ipcRenderer = window.ipcRenderer

    vm.ipcRenderer.on('updateAvailable', (event, info) => {
      console.log('updateAvailable', info)
      this.updateContent = `检测到新版本${info.version}, 是否立即升级？`
      this.showUpdateModal = true
    })

    vm.ipcRenderer.on('message', (event, data) => {
      console.log('message', data.msg)
    })
    vm.ipcRenderer.on('downloadProgress', (event, progressObj) => {
      console.log('downloadProgress', progressObj)
      // 可自定义下载渲染效果
    })
    vm.ipcRenderer.on('isUpdateNow', (event, versionInfo) => {
        // 自定义选择效果，效果自行编写
        this.notification.info({
          title: '更新提示',
          content: '下载完成，避难所将自动重启'
        })
        vm.ipcRenderer.send('updateNow')
    })
    vm.autoUpdate() // electron应用启动后主动触发检查更新函数
  },
  beforeDestroy() {
    // 移除ipcRenderer所有事件
    this.ipcRenderer.removeAllListeners()
  },
  methods: {
    autoUpdate () { // 用来触发更新函数
      this.ipcRenderer.send('checkForUpdate')
    },
    updateCheckedHandler() {
      this.showUpdateModal = false
      this.ipcRenderer.send('downloadNow')
      this.notification.info({
        title: '开始下载',
        content: '正在下载更新包, 请勿退出程序，下载完成后避难所将自动重启'
      })
    }
  },
  components: {
    NModal
  }
}

</script>
<template>
    <div class="container">
        <KeepAlive>
          <component :is="currentView" style="width: 100%; height: 100%;" />
        </KeepAlive>
        
    </div>
    <n-modal
      v-model:show="showUpdateModal"
      preset="dialog"
      title="更新提示"
      :content="updateContent"
      positive-text="确认"
      negative-text="取消"
      @positive-click="updateCheckedHandler"
      @negative-click="showUpdateModal = false"
    />
</template>

<style>
  .container {
    width: 100%;
    height: 100%;
  }
</style>