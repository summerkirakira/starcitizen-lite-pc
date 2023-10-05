<script lang="ts">
import { NButton, NDropdown } from 'naive-ui'
import { Announcement } from '../../electron/network/CirnoAPIProperty'
import { RefugeSettings } from '../../electron/settings/refuge_settings'
import { getRefugeSettings, setRefugeSettings } from '../../electron/uitils/settings'
import Store  from 'electron-store'
import path from 'path'
import { CirnoApi } from '../../electron/network/CirnoAPIService'

const store = new Store()

declare class Label {
    label: string
    key: string
}

export default {
    components: {
        NButton, NDropdown
    },
    data() {

        const refugeSettings: RefugeSettings = store.get('refuge_settings', null) as RefugeSettings

        const gameLocationOptions: Label[] = []
        let gameLocationButtonText = "选择游戏路径"

        if (refugeSettings.gameSettings != null) {
            gameLocationButtonText = refugeSettings.gameSettings.currentGamePath
            refugeSettings.gameSettings.otherGamePaths.forEach((path: string) => {
                gameLocationOptions.push({
                    label: path,
                    key: path
                })
            })
        } else {
            console.log("refuge_settings is null")
        }

        gameLocationOptions.push(
            {
                label: "选择游戏路径",
                key: "choose_game_path"
            }
        )
        return {
            startGameBottom: 'primary',
            installLocalizationButton: 'info',
            options: gameLocationOptions,
            gameLocationButtonText: gameLocationButtonText,
            users: []
        }
    },
    methods: {
        handleSelect(value: string) {
            if (value === "choose_game_path") {
                window.chooseFile({name: "111", extensions: []}).then((res: string[] | undefined) => {
                if (res != undefined) {
                    const gamePath = path.dirname(path.dirname(res[0]))
                    const refugeSettings = getRefugeSettings()
                    if (refugeSettings.gameSettings != null) {
                        refugeSettings.gameSettings.currentGamePath = gamePath
                    }
                    refugeSettings.gameSettings?.otherGamePaths.unshift(gamePath)
                    setRefugeSettings(refugeSettings)
                    this.gameLocationButtonText = gamePath
                    this.options.unshift({
                        label: gamePath,
                        key: res[0]
                    })
                }
            })
            } else {
                const refugeSettings = getRefugeSettings()
                if (refugeSettings.gameSettings != null) {
                    refugeSettings.gameSettings.currentGamePath = value
                }
                setRefugeSettings(refugeSettings)
                this.gameLocationButtonText = value
            }
        },
        handleLocalizationClick() {
            const refugeSettings = getRefugeSettings()
            if (refugeSettings.gameSettings == null) {
                return
            }
            window.fileManager.getZipFile("https://github.com/summerkirakira/Starcitizen-lite/releases/download/v2.2.0/refuge.2.2.0.apk", refugeSettings.gameSettings.currentGamePath).then(()=>{
                console.log("download success")
            }).catch((err: any) => {
                console.log(err)
            })
        }
    }
}
</script>

<template>
    <div class="localization-container">
        <h1>Here is LocalizationPage</h1>

        <div id="game-location-selector">
            <n-dropdown :options="options" @select="handleSelect">
            <n-button>{{ gameLocationButtonText }}</n-button>
        </n-dropdown>
        </div>
        <div id="buttons-container">
            <n-popselect v-model:value="value" :options="options" trigger="click">
                <n-button id="install-localization-button" size="large" :type="installLocalizationButton" @click="handleLocalizationClick">安装汉化</n-button>
            </n-popselect>
            <n-button id="start-game-button" size="large" :type="startGameBottom" :disabled="true">启动游戏</n-button>
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