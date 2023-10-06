<script setup lang="ts">
import LeftMenu from './components/LeftMenu.vue'
import MainActivity from './components/MainActivity.vue'

import { NConfigProvider, GlobalThemeOverrides, NNotificationProvider } from 'naive-ui'

const themeOverrides: GlobalThemeOverrides = {
   common: {
      primaryColor: '#66ccff',
   }
}


</script>

<template>
  <n-config-provider :theme-overrides="themeOverrides" class="app-container">
    <n-notification-provider>
      <div class="main-body">
        <LeftMenu class="left-column" />
        <div class="right-column">
          <main-activity />
        </div>
      </div>
    </n-notification-provider>
  </n-config-provider>
</template>

<style>
.app-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  min-width: 800px;
  min-height: 600px;
}


.main-body {
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: 200px auto;
}

.left-colomn {
  height: 100%;
  background-color: #f0f0f0;
  width: 200px;
  float: left;
}

.right-colomn {
  height: 100%;
  background-color: #f0f0f0;
  float: right;
}

</style>
