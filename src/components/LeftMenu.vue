<template>
    <n-menu :options="menuOptions" @update:value="handleUpdateValue" class="left-menu" value="install-localization"/>
</template>
  
  <script lang="ts">
  import { h, Component } from 'vue'
  import { NIcon } from 'naive-ui'
  import type { MenuOption } from 'naive-ui'
  import { NMenu } from 'naive-ui'
  import {
    BookOutline as BookIcon,
    PersonOutline as PersonIcon,
    WineOutline as WineIcon,
    TextOutline as TextIcon,
    SparklesOutline as SparklesIcon,
    RocketOutline as RocketIcon,
    SettingsOutline as SettingsIcon,
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
            href: '#/localization',
          },
          '我的机库'
        ),
      key: 'my-hangar',
      disabled: true,
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
          '设置'
        ),
      key: 'my-settings',
      disabled: true,
      icon: renderIcon(SettingsIcon)
    },
  ]
  
  export default {
    emits: ['leftMenuClicked'],
    methods: {
        handleUpdateValue(clickValue: string[]) {
            this.$emit('leftMenuClicked', clickValue)
        }
    },
    components: {
      NMenu
    },
    setup() {
        return {
                menuOptions: menuOptions
            }
        },
    }
  </script>
<style>
  .left-menu {
    width: 200px;
  }
</style>