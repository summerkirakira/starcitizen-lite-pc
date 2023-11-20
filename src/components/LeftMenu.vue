<template>
    <n-menu ref="leftMenu" :options="menuOptions" :on-update:value="showNotInplementedNotificaiton" class="left-menu" default-value="install-localization"/>
</template>
  
  <script lang="ts">
  import { h, Component } from 'vue'
  import { NIcon, NAvatar } from 'naive-ui'
  import type { MenuOption } from 'naive-ui'
  import { NMenu } from 'naive-ui'
  import {
    PersonOutline as PersonIcon,
    TextOutline as TextIcon,
    SparklesOutline as SparklesIcon,
    RocketOutline as RocketIcon,
    SettingsOutline as SettingsIcon,
    BuildOutline as BuildIcon,
    PhonePortraitOutline as PhoneIcon,
    ChatboxEllipsesOutline as ChatboxIcon
  } from '@vicons/ionicons5'
import { useNotification } from 'naive-ui'
  
  function renderIcon (icon: Component) {
    // if (icon === PersonIcon) {
    //   const refugeSettings = getRefugeSettings()
    //     if (refugeSettings.currentUser != null) {
    //       return renderAvatar('https://robertsspaceindustries.com/' + refugeSettings.currentUser.profile_image)
    //     }
    // }

    return () => h(NIcon, null, { default: () => h(icon) })
  }

  function renderAvatar (url: string) {
    return () => h(NAvatar, {
      src: url,
      round: true,
      size: 'large',
    })
  }
  
  const menuOptions: MenuOption[] = [
  {
      label: () =>
        h(
          'a',
          {
            href: '#/user-profile',
          },
          '账号信息'
        ),
      key: 'user-profile',
      disabled: false,
      icon: renderIcon(PersonIcon)
    },
    {
    key: 'divider-1',
    type: 'divider',
    props: {
      style: {
        marginLeft: '32px'
      }
    }
  },
    {
      label: () =>
        h(
          'a',
          {
            href: '#/localization',
          },
          '安装汉化'
        ),
      key: 'install-localization',
      icon: renderIcon(TextIcon)
    },
    {
      label: () =>
        h(
          'a',
          {
            href: '#/hangar',
          },
          '我的机库'
        ),
      key: 'my-hangar',
      disabled: false,
      icon: renderIcon(RocketIcon)
    },
    {
      label: () =>
        h(
          'a',
          {
            href: '#/buyback',
          },
          '我的回购'
        ),
      key: 'my-buyback',
      disabled: false,
      icon: renderIcon(SparklesIcon)
    },
    {
      label: () =>
        h(
          'a',
          {
            href: '#/utilities',
          },
          '实用工具'
        ),
      key: 'my-tools',
      disabled: false,
      icon: renderIcon(BuildIcon)
    },
    {
      label: () =>
        h(
          'a',
          {
            href: '#/settings',
          },
          '设置'
        ),
      key: 'my-settings',
      disabled: false,
      icon: renderIcon(SettingsIcon)
    },
    {
      label: () =>
        h(
          'a',
          {
            href: '#/app',
          },
          '手机端App'
        ),
      key: 'my-apps',
      disabled: false,
      icon: renderIcon(PhoneIcon)
    },
    {
      label: () =>
        h(
          'a',
          {
            href: '#/bug-report',
          },
          '问题反馈'
        ),
      key: 'my-bug-report',
      disabled: false,
      icon: renderIcon(ChatboxIcon)
    },
  ]
  
  export default {
    emits: ['leftMenuClicked'],
    methods: {
        handleUpdateValue(clickValue: string[]) {
            this.selectOpition = clickValue
        },
        showNotInplementedNotificaiton(key: string, option: MenuOption) {
          // if (key === 'my-settings')
          //   this.notification.warning({
          //       title: '当前功能还在开发中哦',
          //       content: '请耐心等待避难所PC更新'
          //   })
        }
    },
    components: {
      NMenu
    },
    mounted() {
        
    },
    setup() {
      const notification = useNotification()
        return {
                menuOptions: menuOptions,
                selectOpition: 'install-localization',
                notification
            }
        },
    }
  </script>
<style>
  .left-menu {
    width: 200px;
  }
</style>