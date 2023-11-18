<script lang="ts">
import { 
    NDivider,
    NGrid,
    NGridItem,
    NCard,
    NButton,
    NSpace,
    NModal,
    NSelect,
    NScrollbar
} from 'naive-ui';

import { useNotification, useLoadingBar, useMessage } from 'naive-ui'


export default {
    setup() {
        const notification = useNotification()
        const loadingBar = useLoadingBar()
        const message = useMessage()
        return {
            notification,
            loadingBar,
            message
        }
    },
    methods: {
        handleJumpBtnClicked(url: string) {
            window.openRsiWeb(url)
            // window.shareData(window.fileManager)
        },
        handleExternalBtnClicked(url: string) {
            if (url === 'https://ccugame.app') {
                window.openExternal('https://ccugame.app')
                return
            }
            window.openRsiWeb(url)
            // window.shareData(window.fileManager)
        },
        handleGameToolsBtnClicked(key: string) {
            switch(key) {
                case 'get_game_direct_link':
                    this.isGamedirectLinkModalVisible = true
                    this.selectChannelOptions = []
                    this.getGameDirectLink()
                    break
            }
        },
        getGameDirectLink() {
            this.isSelectChannelLoading = true
            window.RsiApi.getLibrary().then((res) => {
                console.log(res)
                const channels = res.data.games[0].channels
                channels.forEach((channel) => {
                    if (channel.name !== null) {
                        this.selectChannelOptions.push({
                            label: `${channel.name} (${channel.versionLabel})`,
                            value: channel.id
                    })
                    }
                })
                this.isSelectChannelLoading = false
            })
        },
        copyGameDirectToClipboard() {
            const key = this.selectedChannel
            this.isSelectChannelBtnLoading = true
            window.RsiApi.getReleaseInfo(key, window.webSettings.claims, 'SC', 'prod').then((res) => {
                const directLink = `${res.data.p4kBase.url}?${res.data.p4kBase.signatures}`
                window.fileManager.writeToClipboard(directLink)
                this.isSelectChannelBtnLoading = false
                this.isGamedirectLinkModalVisible = false
                this.notification.success({
                    title: '复制成功',
                    content: '游戏直链已复制到剪贴板中, 在浏览器或者下载工具中粘贴即可下载, 下载完成后请把下载后的文件改名为data.p4k放入LIVE或PTU文件夹中'
                })
            })
        }
    },
    components: {
      NDivider,
      NGrid,
      NGridItem,
      NCard,
      NButton,
      NSpace,
      NModal,
      NSelect,
      NScrollbar
    },
    data() {
        return {
            rsiShortcuts: [
                {
                    url: 'https://robertsspaceindustries.com/account/pledges',
                    label: '我的机库'
                },
                {
                    url: 'https://robertsspaceindustries.com/account/buy-back-pledges',
                    label: '我的回购'
                },
                {
                    url: 'https://robertsspaceindustries.com/pledge',
                    label: '官方商店'
                },
                {
                    url: 'https://robertsspaceindustries.com/account/settings',
                    label: '我的设置'
                },
                {
                    url: 'https://robertsspaceindustries.com/account/profile',
                    label: '我的资料'
                },
                {
                    url: 'https://robertsspaceindustries.com/pledge/redeem-code',
                    label: '邀请码兑换'
                },
                {
                    url: 'https://robertsspaceindustries.com/account/referral-program',
                    label: '邀请奖励'
                },
                {
                    url: 'https://robertsspaceindustries.com/account/billing',
                    label: '我的账单'
                },
                {
                    url: 'https://robertsspaceindustries.com/account/organization',
                    label: '我的舰队'
                },
                {
                    url: 'https://robertsspaceindustries.com/account/concierge',
                    label: '礼宾服务'
                },
                {
                    url: 'https://robertsspaceindustries.com/account/subscribers',
                    label: '订阅服务'
                },
                {
                    url: 'https://robertsspaceindustries.com/spectrum/community/SC',
                    label: '光谱论坛'
                },
                {
                    url: 'https://robertsspaceindustries.com/roadmap/progress-tracker/teams',
                    label: '开发路线图'
                },
                // {
                //     url: 'https://robertsspaceindustries.com/starmap',
                //     label: '星图'
                // },
                {
                    url: 'https://robertsspaceindustries.com/download',
                    label: '游戏下载'
                }
            ],
            gameTools: [
                {
                    label: '获取游戏直链',
                    key: 'get_game_direct_link'
                }
            ],
            externalWebsites: [
                {
                    label: 'CCU Game (机库管理工具)',
                    url: 'https://ccugame.app'
                },
                {
                    label: 'Erkul (舰船配装查询)',
                    url: 'https://www.erkul.games/live/calculator'
                },
                {
                    label: 'SC Trading (跑商路线查询)',
                    url: 'https://sc-trading.kamille.ovh/trading/'
                },
                {
                    label: 'UEX (跑商路线查询)',
                    url: 'https://uexcorp.space/trade'
                },
                {
                    label: '星际公民中文维基',
                    url: 'https://citizenwiki.cn'
                },
                {
                    label: '星际公民英文维基',
                    url: 'https://starcitizen.tools'
                }
            ],
            isGamedirectLinkModalVisible: false,
            selectedChannel: '',
            isSelectChannelLoading: true,
            selectChannelOptions: [

            ],
            isSelectChannelBtnLoading: false
        }
    }
}

</script>

<template>
    <n-scrollbar style="height: calc(100vh);">
    <n-space vertical style="margin-right: 20px;">
        <n-divider>RSI官网索引</n-divider>
        <n-grid :x-gap="12" :y-gap="8" cols="2 500:7 500:7">
            <n-grid-item v-for="item in rsiShortcuts">
                <n-card bordered hoverable>
                    <n-space vertical>
                        <span style="font-size: 15px;">{{ item.label }}</span>
                        <n-button strong secondary size="small" type="primary" @click="handleJumpBtnClicked(item.url)">打开</n-button>
                    </n-space>
                </n-card>
            </n-grid-item>
        </n-grid>
        <n-divider>实用工具</n-divider>
        <n-grid :x-gap="12" :y-gap="8" cols="2 500:7 500:7">
            <n-grid-item v-for="item in gameTools">
                <n-card bordered hoverable>
                    <n-space vertical>
                        <span style="font-size: 15px;">{{ item.label }}</span>
                        <n-button strong secondary type="warning" size="small" @click="handleGameToolsBtnClicked(item.key)">复制</n-button>
                    </n-space>
                </n-card>
            </n-grid-item>
        </n-grid>
        <n-divider>工具站点整合</n-divider>
        <n-grid :x-gap="12" :y-gap="8" cols="2 500:6 500:6">
            <n-grid-item v-for="item in externalWebsites">
                <n-card bordered hoverable>
                    <n-space vertical>
                        <span style="font-size: 15px;">{{ item.label }}</span>
                        <n-button strong secondary size="small" type="info" @click="handleExternalBtnClicked(item.url)">打开</n-button>
                    </n-space>
                </n-card>
            </n-grid-item>
        </n-grid>
        <n-divider />
    </n-space>
</n-scrollbar>
    <n-modal v-model:show="isGamedirectLinkModalVisible">
    <n-card
      style="width: 600px"
      title="请选择要下载的游戏版本"
      :bordered="false"
      size="huge"
      role="dialog"
      aria-modal="true"
    >
    <n-select
        v-model:value="selectedChannel"
        filterable
        placeholder="选择游戏版本"
        :options="selectChannelOptions"
        :loading="isSelectChannelLoading"
        clearable
        remote
    />
      <template #action>
      <n-space justify="end">
        <n-button @click="isGamedirectLinkModalVisible=false">取消</n-button>
        <n-button type="primary" enabled="!isSelectChannelLoading" :loading="isSelectChannelBtnLoading" @click="copyGameDirectToClipboard()">确定</n-button>
      </n-space>
    </template>
    </n-card>
  </n-modal>

</template>

<style scoped>
    .rsi-card-tabs {
        height: 100%;
    }
    .login-input {
        width: 100%;
    }
</style>