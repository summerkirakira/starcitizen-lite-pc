<script lang="ts">
import { NButton, NDropdown, useNotification } from 'naive-ui'
import { RefugeSettings } from '../../electron/settings/refuge_settings'
import Store  from 'electron-store'
import path from 'path'
import { installLocalization, validateFolder } from '../../electron/uitils/files'
import { getRefugeSettings, setRefugeSettings } from '../../electron/uitils/settings'
import fs from 'fs'
import { updateLocalizationSettings, uninstallLocalization } from '../../electron/uitils/files'
import { LocalizationInfo } from '../../electron/network/CirnoAPIProperty'
import { startGame } from '../../electron/uitils/start-game'

const store = new Store()

declare class Label {
    label: string
    key: string
}

export default {
    components: {
        NButton, NDropdown
    },
    setup() {
        const notification = useNotification()
        return {
            notification,
            value: ""
        }
    },
    data() {

        const refugeSettings: RefugeSettings = store.get('refuge_settings', null) as RefugeSettings

        const gameLocationOptions: Label[] = []
        let gameLocationButtonText = "选择游戏路径"
        // console.log(refugeSettings)
        let isInstalled = false
        let isNeedUpdate = false
        let installButtonText = "安装汉化"

        if (refugeSettings.gameSettings != null) {
            if (refugeSettings.gameSettings.currentGamePath != null) {
                gameLocationButtonText = refugeSettings.gameSettings.currentGamePath
            }
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
            isInstalled: isInstalled,
            isNeedUpdate: isNeedUpdate,
            installButtonText: installButtonText,
            users: [],
            isLocalizationButtonLoading: false
        }
    },
    methods: {
        handleSelect(value: string) {
            if (value === "choose_game_path") {
                window.chooseFile({name: "StarCitizen", extensions: ['exe']}).then((res: string[] | undefined) => {
                if (res != undefined) {
                    const gamePath = path.dirname(path.dirname(res[0]))
                    for (const item of this.options) {
                        if (item.key === gamePath) {
                            return
                        }
                    }
                    const refugeSettings = getRefugeSettings()
                    if (refugeSettings.gameSettings != null) {
                        refugeSettings.gameSettings.currentGamePath = gamePath
                    }
                    refugeSettings.gameSettings?.otherGamePaths.unshift(gamePath)
                    setRefugeSettings(refugeSettings)
                    this.gameLocationButtonText = gamePath
                    this.options.unshift({
                        label: gamePath,
                        key: gamePath
                    })
                }
            })
            } else {
                if (fs.existsSync(path.join(path.join(value, 'Bin64'), 'StarCitizen.exe')) == false) {
                    this.options = this.options.filter((item: Label) => {
                        return item.key != value
                    })
                    this.gameLocationButtonText = "选择游戏路径"
                    this.notification.error({
                        title: '错误',
                        content: '游戏路径不存在, 已自动移除该路径'
                    })
                    const refugeSettings = getRefugeSettings()
                    if (refugeSettings.gameSettings != null) {
                        refugeSettings.gameSettings.otherGamePaths = this.options
                        .filter((item: Label) => {
                            return item.key != "choose_game_path"
                        })
                        .map((item: Label) => {
                            return item.key
                        })
                        setRefugeSettings(refugeSettings)
                    }
                    return
                }
                const refugeSettings = getRefugeSettings()
                if (refugeSettings.gameSettings != null) {
                    refugeSettings.gameSettings.currentGamePath = value
                }
                setRefugeSettings(refugeSettings)
                this.gameLocationButtonText = value
            }
            this.updateLocalizationInfo()
            this.checkUpdate()
        },
        handleLocalizationClick() {

            const refugeSettings = getRefugeSettings()
            if (refugeSettings.gameSettings == null) {
                return
            }
            if (this.isInstalled && !this.isNeedUpdate) {
                this.isLocalizationButtonLoading = true
                uninstallLocalization().then(() => {
                    this.notification.success({
                        title: '成功',
                        content: '汉化卸载成功'
                    })
                    this.isLocalizationButtonLoading = false
                    this.isInstalled = false
                    this.installButtonText = "安装汉化"
                    updateLocalizationSettings()
                }).catch((err: any) => {
                    this.isLocalizationButtonLoading = false
                    console.log(err)
                    this.notification.error({
                        title: '错误',
                        content: err.message,
                    })
                })
            } else {
                this.isLocalizationButtonLoading = true
                installLocalization(null).then(()=>
                        {
                            this.isLocalizationButtonLoading = false
                            this.notification.success({
                                title: '成功',
                                content: '汉化安装成功'
                            })
                            this.isInstalled = true
                            this.installButtonText = "卸载汉化"
                            this.isNeedUpdate = false
                        }
                    ).catch((err: Error) => {
                        this.isLocalizationButtonLoading = false
                        console.log(err)
                        this.notification.error({
                            title: '错误',
                            content: err.message,
                        })
                    })
            }
            
        },
        updateLocalizationInfo() {
            let refugeSettings = getRefugeSettings()
            if (refugeSettings.gameSettings == null) {
                return
            }
            if (refugeSettings.gameSettings.currentGamePath == null) {
                return
            }
            updateLocalizationSettings()
            refugeSettings = getRefugeSettings()
            if (refugeSettings.localizationSettings != null) {
                const missingFiles = validateFolder(path.join(refugeSettings.gameSettings.currentGamePath, refugeSettings.localizationSettings.path), refugeSettings.localizationSettings.hashes)
                console.log(missingFiles)
                if (missingFiles.length == 0) {
                    this.isInstalled = true
                    if (!this.isNeedUpdate) {
                        this.installButtonText = "卸载汉化"
                    }
                } else {
                    this.notification.error({
                        title: '错误',
                        content: '汉化文件缺失, 请重新安装汉化'
                    })
                    this.isInstalled = false
                    this.installButtonText = "安装汉化"
                }
                
            } else {
                this.isInstalled = false
                this.installButtonText = "安装汉化"
            }
        },
        checkUpdate() {
            const refugeSettings = getRefugeSettings()
            if (refugeSettings.localizationSettings == null) {
                return
            }
            window.CirnoApi.getLocalizationInfo({
                localization_id: refugeSettings.localizationSettings.localizaitonId
            }).then((localizationInfo: LocalizationInfo) => {
                if (localizationInfo.localization_version > refugeSettings.localizationSettings.version) {
                    this.notification.info({
                        title: '提示',
                        content: '汉化有更新, 请更新汉化'
                    })
                    this.isNeedUpdate = true
                    this.installButtonText = "更新汉化"
                }
            }).catch((err: any) => {
                console.log(err)
            })
        },
        handleStartGameClick() {
            const refugeSettings = getRefugeSettings()
            if (refugeSettings.gameSettings == null || refugeSettings.gameSettings.currentGamePath == null) {
                this.notification.error({
                    title: '错误',
                    content: '请先选择游戏路径'
                })
                return
            }
            if (refugeSettings.currentUser === null) {
                this.notification.error({
                    title: '未登录',
                    content: '请先登录后再启动游戏'
                })
                return
            }
            
            try {
                startGame()
            } catch (err) {
                this.notification.error({
                    title: '游戏意外退出',
                    content: err.message
                })
            }
            


            // window.RsiApi.rsiLauncherSignin().then((res) => {
            //     console.log(res)
            // }).catch((err) => {
            //     console.log(err)
            // })

            // window.RsiApi.getClaims().then((claims) => {
            //     console.log(claims.data)
            // }).catch((err) => {
            //     console.log(err)
            // })
            // const gameLauncher = new GameLauncher()
            // const startOpts = {}
            // gameLauncher.start(startOpts)
            // window.CirnoApi.getRecaptchaToken().then((tokenResponse) => {
            //     window.RsiApi.login("", "", tokenResponse.captcha_list[0].token, true).then(
            //         (res) => {
            //             console.log(res)
            //         }
            //     )
            // })
        }
    },
    mounted() {
        this.updateLocalizationInfo()
        this.checkUpdate()
    }
}
</script>

<template>
    <div class="localization-container">
        <iframe id="localization-webview" src="https://image.biaoju.site/star-refuge/docs/install-localization/"/>

        <div id="game-location-selector">
            <n-dropdown :options="options" @select="handleSelect">
                <n-button>{{ gameLocationButtonText }}</n-button>
            </n-dropdown>
        </div>
        <n-button id="install-localization-button" :loading="isLocalizationButtonLoading" size="large" type="info" @click="handleLocalizationClick">{{ installButtonText }}</n-button>
        <n-button id="start-game-button" size="large" type="primary" @click="handleStartGameClick">启动游戏</n-button>
        
    </div>
</template>

<style>
    #localization-container {
        width: 100%;
        height: 100%;
        position: absolute;
    }
    #start-game-button {
        right: 50px;
        bottom: 45px;
        position: absolute;
    }
    #install-localization-button {
        right: 170px;
        bottom: 45px;
        position: absolute;
    }
    #game-location-selector {
        left: 200px;
        bottom: 50px;
        position: absolute;
    }
    #localization-webview {
        width: 100%;
        height: calc(100% - 130px);
        margin-bottom: 200px;
        border: none; /* 去除iframe边框 */
    }
</style>../../electron/network/buyback-parser/buybackParser../../electron/network/buyback-parser/BuybackParser