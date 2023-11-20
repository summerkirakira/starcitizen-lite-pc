<script lang="ts">
import { NCard, NTabs, NTabPane, NRadio, TreeOption, NTree, NSwitch, NDivider, NScrollbar, NForm, NFormItemRow, NButton, NInput, useNotification, useMessage, NSpace } from 'naive-ui';

import { getRefugeSettings, setRefugeSettings } from '../../electron/uitils/settings'


export default {
    setup() {
        const notification = useNotification()
        const message = useMessage()
        return {
            notification,
            message
        }
    },

    data() {
        return {
            CPUInfo: {

            } as any,
            disableCores: false,
            checkedTree: [] as TreeOption[],
            enabledKeys: [],
        }
    },
    mounted() {
        
    },
    activated() {
        const refugeSettings = getRefugeSettings()
        this.disableCores = refugeSettings.gameSettings.disableCores
        window.ipcRenderer.invoke('get-cpu-info').then((res: any) => {
            this.getTreeOption(res)
        })
    },
    components: {
        NSpace,
        NCard,
        NTabs,
        NTabPane,
        NRadio,
        NTree,
        NSwitch,
        NDivider,
        NScrollbar,
    },
    methods: {
        updateCoresChecked(e: Event, index: number) {
            console.log(index)
            this.checkedCores[index] = (e.target as HTMLInputElement).value
            console.log(this.checkedCores)
            // this.$set(this.CPUInfo[index], 'enabled', this.checkedCores[index])
        },
        getTreeOption(res) {
            const refugeSettings = getRefugeSettings()
            if (refugeSettings.gameSettings.enabledCores.length != res.length) {
                refugeSettings.gameSettings.enabledCores = []
                for (let i = 0; i < res.length; i++) {
                    refugeSettings.gameSettings.enabledCores.push(true)
                }
                setRefugeSettings(refugeSettings)
            }
            const newCPUInfo = res
            this.checkedCores = []
            let isAllEnabled = true
            this.enabledKeys = []
            for (let i = 0; i < res.length; i++) {
                newCPUInfo[i].enabled = refugeSettings.gameSettings.enabledCores[i]
                if (!newCPUInfo[i].enabled) {
                    isAllEnabled = false
                } else {
                    this.enabledKeys.push(i)
                }
            }
            if (isAllEnabled) {
                this.enabledKeys.push('all')
            }
            this.CPUInfo = newCPUInfo
            this.checkedTree = [
                {
                    key: 'all',
                    label: '启用全部核心',
                    children: []
                }
            ]
            for (let i = 0; i < res.length; i++) {
                this.checkedTree[0].children.push({
                    key: i,
                    label: `核心${i + 1} # (${res[i].model})`
                })
            }
            console.log(this.checkedTree)
        },
        handleCheckedKeysChange(keys, option, meta) {
            if (meta.action === 'uncheck') {
                this.enabledKeys = this.enabledKeys.filter((item) => {
                    return item != meta.node.key && item != 'all'
                })
            } else {
                if (meta.node.key == 'all') {
                    this.enabledKeys = ['all']
                    for (let i = 0; i < this.CPUInfo.length; i++) {
                        this.enabledKeys.push(i)
                    }
                } else {
                    this.enabledKeys.push(meta.node.key)
                }
            }
            if (this.enabledKeys.length == this.CPUInfo.length) {
                this.enabledKeys.push('all')
            }
            this.saveTreeOption()
        },
        saveTreeOption() {
            const refugeSettings = getRefugeSettings()
            for (let i = 0; i < this.CPUInfo.length; i++) {
                refugeSettings.gameSettings.enabledCores[i] = false
            }
            this.enabledKeys.forEach((item) => {
                if (item != 'all') {
                    refugeSettings.gameSettings.enabledCores[item] = true
                }
            })
            // console.log(refugeSettings.gameSettings.enabledCores)
            setRefugeSettings(refugeSettings)
        }
    }
}

</script>


<template>
    
    <n-space style="margin-right: 20px;" vertical>
        <n-tabs
            animated
            pane-wrapper-style="margin: 0 -4px"
            pane-style="padding-left: 4px; padding-right: 4px; box-sizing: border-box;">
            <n-tab-pane name="game" tab="游戏启动选项" style="height: calc(100vh);">
                <n-space vertical>
                    <n-scrollbar style="height: calc(100vh); width: 100%;">
                    <n-space vertical style="height: calc(200vh)">
                        <n-space vertical align="start">
                            <span style="font-size: large;">禁用核心: </span>
                            <span style="font-size: small; opacity: 0.7; text-align: left;">
                                禁用小核或超线程似乎对游戏有着玄学加成，但请务必谨慎修改。关于如何根据CPU型号禁用核心，请参考
                                <a href="https://ngabbs.com/read.php?tid=38105160&_fu=41679034%2C1&rand=860" target="_blank">
                                    这个帖子
                                </a>。
                            </span>
                            <span style="font-size: small; opacity: 0.7; text-align: left;">
                                注意，禁用核心可能会导致游戏崩溃，如果出现崩溃，请尝试启用所有核心。
                            </span>
                        </n-space>
                        <n-tree
                            block-line
                            :data="checkedTree"
                            :checked-keys="enabledKeys"
                            @update:checked-keys="handleCheckedKeysChange"
                            checkable
                            expand-on-click
                            selectable
                        />
                    </n-space>
                    <n-divier />
                    </n-scrollbar>
                </n-space>
            </n-tab-pane>
            <n-tab-pane name="basic" tab="通用">
                
            </n-tab-pane>
        </n-tabs>
    </n-space>
</template>