<script lang="ts">
import { NButton, NDropdown } from 'naive-ui'
import { useObservable } from '@vueuse/rxjs'
import { liveQuery } from 'dexie'
import { Options } from '@vicons/ionicons5'
import { Announcement } from '../../electron/network/CirnoAPIProperty'

export default {
    components: {
        NButton, NDropdown
    },
    data() {
        return {
            startGameBottom: 'primary',
            installLocalizationButton: 'info',
            options: [
                        {
                        label: "选择新的游戏目录",
                        key: "select_new_location",
                        disabled: false
                        }
                    ],
            users: []
            
        }
    },
    methods: {
        handleSelect(value: string) {
            console.log(value)
            window.CirnoApi.getAnnouncement().then((res: Announcement) => {
                console.log(res)
            })
            window.chooseFile().then((res: string[] | undefined) => {
                if (res != undefined) {
                    console.log(res)
                    this.options = [
                        {
                            label: res[0],
                            key: "select_new_location",
                            disabled: false 
                        }
                    ]
                }
            })
        },
    }
}
</script>

<template>
    <div class="localization-container">
        <h1>Here is LocalizationPage</h1>
        <n-dropdown :options="options" @select="handleSelect">
            <n-button id="game-location-selector">D:\Programs\RSI\StarCitizen\LIVE</n-button>
        </n-dropdown>
        <div id="buttons-container">
            <n-button id="install-localization-button" size="large" :type="installLocalizationButton">安装汉化</n-button>
            <n-button id="start-game-button" size="large" :type="startGameBottom">启动游戏</n-button>
        </div>
        
    </div>
</template>

<style>
    #localization-container {
        width: 100%;
        height: 100%;
        position: relative;
    }
    #buttons-container {
        right: 50px;
        bottom: 50px;
        position: absolute;
    }
    #install-localization-button {
        margin-right: 30px;
    }
    #game-location-selector {
        left: 350px;
        bottom: 50px;
        position: absolute;
    }
</style>