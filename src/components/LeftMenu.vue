<template>
    <n-menu ref="leftMenu" :options="menuOptions" @update:value="handleUpdateValue" class="left-menu" default-value="install-localization"/>
</template>
  
  <script lang="ts">
  import { h, Component } from 'vue'
  import { NIcon } from 'naive-ui'
  import type { MenuOption } from 'naive-ui'
  import { NMenu } from 'naive-ui'
  import {
    PersonOutline as PersonIcon,
    TextOutline as TextIcon,
    SparklesOutline as SparklesIcon,
    RocketOutline as RocketIcon,
    SettingsOutline as SettingsIcon,
    BuildOutline as BuildIcon,
    PhonePortraitOutline as PhoneIcon
  } from '@vicons/ionicons5'
  
  function renderIcon (icon: Component) {
    return () => h(NIcon, null, { default: () => h(icon) })
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
            href: '#/localization',
          },
          '我的回购'
        ),
      key: 'my-buyback',
      disabled: true,
      icon: renderIcon(SparklesIcon)
    },
    {
      label: () =>
        h(
          'a',
          {
            href: '#/localization',
          },
          '实用工具'
        ),
      key: 'my-tools',
      disabled: true,
      icon: renderIcon(BuildIcon)
    },
    {
      label: () =>
        h(
          'a',
          {
            href: '#/localization',
          },
          '设置'
        ),
      key: 'my-settings',
      disabled: true,
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
  ]
  
  export default {
    emits: ['leftMenuClicked'],
    methods: {
        handleUpdateValue(clickValue: string[]) {
            this.selectOpition = clickValue
        }
    },
    components: {
      NMenu
    },
    mounted() {
        
    },
    setup() {
        return {
                menuOptions: menuOptions,
                selectOpition: 'install-localization'
            }
        },
    }
  </script>
<style>
  .left-menu {
    width: 200px;
  }
</style>