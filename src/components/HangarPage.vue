<script lang="ts">
import {
    NSpace,
    NDataTable,
    NTag,
    NImage,
    NPopconfirm,
    NModal,
    NAutoComplete,
    NCard,
    NInput
} from 'naive-ui'
import { getStoredHangarItems, refreshHangarItems } from '../../electron/network/hangar-parser/HangarParser'
import { HangarItem } from '../../electron/network/hangar-parser/HangarParser'
import { getHangarItemPrice, getHangarUpgradePrice, translateHangarItemName, translateHangerItemType } from '../../electron/uitils/hangar-util'
import { h, ref, computed } from 'vue'
import moment from 'moment'
import { useNotification, useLoadingBar, useMessage } from 'naive-ui'
import { getRefugeSettings, setRefugeSettings } from '../../electron/uitils/settings'
import { addUserToDatabase } from '../../electron/uitils/settings'
import { NButton, NIcon } from 'naive-ui'
import { RefreshOutline as RefreshIcon } from '@vicons/ionicons5'
import HangarPopupMenu from './HangarPopupMenu.vue'

export interface HangarItemTableData {
    id: number,
    title: string,
    english_title: string,
    image: string,
    num: number,
    price: number,
    current_price: number,
    save: number,
    status: string[],
    date: Date,
    rowClassName?: string,
    raw: HangarItem,
    id_list: number[]
}

function renderDataTableTitle(row: HangarItemTableData) {
    return h(
        HangarPopupMenu,
        {
            hangarItem: row
        }
    )
}

function convertHangarItemToTableData(item: HangarItem): HangarItemTableData {
    const status: string[] = []
    if (item.can_gift) {
        status.push('可礼物')
    }
    if (item.can_reclaim) {
        status.push('可回收')
    }
    if (item.is_upgrade) {
        status.push('可升级')
    }
    if (item.status === 'Gifted') {
        status.push('已赠送')
    }
    let currentPrice = 0

    if (item.is_upgrade) {
        currentPrice += getHangarUpgradePrice(item.title)
    } else {
        item.contains.forEach((contain) => {
            currentPrice += getHangarItemPrice(contain.title)
            contain.currentPrice = getHangarItemPrice(contain.title)
        })
    }

    let save = 0
    if (currentPrice > item.price) {
        save = currentPrice - item.price
    }

    let image = item.image

    if (image.startsWith('/')) {
        image = 'https://robertsspaceindustries.com' + image
        item.image = image
    }

    item.contains.forEach((contain) => {
        if (contain.image.startsWith('/')) {
            contain.image = 'https://robertsspaceindustries.com' + contain.image
        }
        contain.title = translateHangarItemName(contain.title)
        contain.type = translateHangerItemType(contain.type)
    })

    const translated_also_contains: string[] = []

    item.also_contains.forEach((also_contain) => {
        translated_also_contains.push(translateHangarItemName(also_contain))
    })
    item.also_contains = translated_also_contains


    return {
        id: item.id,
        title: translateHangarItemName(item.title),
        english_title: item.title,
        image: image,
        num: 1,
        price: item.price,
        current_price: currentPrice,
        save: save,
        status: status,
        date: item.date,
        raw: item,
        id_list: [item.id]
    }
}

function convertHangarItemsToTableData(items: HangarItem[]): HangarItemTableData[] {
    const result: HangarItemTableData[] = []
    const map = new Map<string, HangarItemTableData>()
    for (const item of items) {
        let key = item.title
        item.contains.forEach((contain) => {
            key += contain.title
        })
        item.also_contains.forEach((also_contain) => {
            key += also_contain
        })
        key += item.status
        if (map.has(key)) {
            const old_item = map.get(key)
            if (old_item) {
                old_item.num += 1
                old_item.id_list.push(item.id)
            }
        } else {
            map.set(key, convertHangarItemToTableData(item))
        }
    }
    for (const item of map.values()) {
        result.push(item)
    }
    let hangar_value = 0
    result.forEach((item) => {
        hangar_value += item.current_price * item.num
    })
    const refuge_settings = getRefugeSettings()
    if (refuge_settings.currentUser != null) {
        refuge_settings.currentUser.hangar_value = hangar_value
        addUserToDatabase(refuge_settings.currentUser)
        setRefugeSettings(refuge_settings)
    }
    return result
}

async function refreshHangarItemTable(): Promise<HangarItemTableData[]> {
    const hangar_items = await refreshHangarItems()
    const table_data = convertHangarItemsToTableData(hangar_items)
    return table_data
}

function getCachedHangarItemTable(): HangarItemTableData[] {
    const hangar_items = getStoredHangarItems()
    const table_data = convertHangarItemsToTableData(hangar_items)
    return table_data
}

function convertNumberToCurrency(num: number): string {
    return `$${num / 100.0}`
}


export default {
    setup() {
        const notification = useNotification()
        const loadingBar = useLoadingBar()
        const message = useMessage()
        return {
            rowProps: (row: HangarItemTableData) => {
                return {
                    // onMouseenter: () => {
                    //     console.log(row)
                    // }
                }
            },
            notification,
            loadingBar,
            message,
            showReclaimConfirm: ref(false),
            selectedReclaimItem: {} as HangarItemTableData,
            selectedReclaimItemTitle: "",
            clickedTagKey: "",
            showGiftConfirm: ref(false),
        }
    },
    components: {
        NSpace,
        NDataTable,
        NButton,
        NIcon,
        RefreshIcon,
        HangarPopupMenu,
        NPopconfirm,
        NModal,
        NAutoComplete,
        NCard,
        NInput
    },
    mounted() {
        const refugeSettings = getRefugeSettings()
        if (refugeSettings.currentUser == null) {
            window.location.hash = '#/login'
            return
        }
        this.table_data = getCachedHangarItemTable()
        this.handleRefreshBtnClicked()
    },
    methods: {
        handleRefreshBtnClicked() {
            this.loadingBar.start()
            refreshHangarItemTable().then((table_data) => {
                this.table_data = table_data
                this.message.success(
                    "机库刷新成功",
                    { duration: 5000 }
                )
                this.loadingBar.finish()
            }).catch((err) => {
                this.notification.error({
                    title: '刷新机库失败',
                    content: '请检查网络连接'
                })
                this.loadingBar.error()
            })
        },
        handleTagClick() {
            const tagKey = this.clickedTagKey
            const row = this.selectedReclaimItem
            const email = this.giftEmail
            const name = this.giftName
            const password = this.giftPassword
            const refuge_settings = getRefugeSettings()
            switch(tagKey){
                case '可升级':
                    break
                case '可回收':
                    window.RsiApi.reclaimPledges(row.id_list, refuge_settings.currentUser.password).then((responses) => {
                        let is_success = true
                        for(const response of responses) {
                            if (response.success === 0) {
                                response.msg = response.msg.replace('A pledge can only be reclaimed more than 24h after it is acquired: ', '机库中的物品在购买24小时后才能回收哦：剩余时间')
                                                .replace('hours', '小时').replace('minutes', '分钟').replace('left', '').trim()

                                this.notification.error({
                                    title: '回收失败',
                                    content: response.msg
                                })
                                is_success = false
                            }
                        }
                        if (is_success) {
                            this.notification.success({
                                title: `回收${responses.length}件机库物品成功`,
                                content: `已回收 ${row.title} x ${row.num} (价值 ${convertNumberToCurrency(row.price * row.num)})。机库刷新中...`
                            })
                            this.handleRefreshBtnClicked()
                        }
                    })
                    break
                case '可礼物':
                    if (password !== refuge_settings.currentUser.password) {
                        this.notification.error({
                            title: '密码错误',
                            content: '请检查密码是否正确'
                        })
                        return
                    }
                    window.RsiApi.giftPledge(row.id.toString(), refuge_settings.currentUser.password, email, name).then((response) => {
                        console.log(response)
                        if (response.success === 0) {
                            this.notification.error({
                                title: '赠送失败',
                                content: response.msg
                            })
                        } else {
                            this.notification.success({
                                title: '赠送成功',
                                content: `已向 ${email} 成功赠送一件 ${row.title} (价值 ${convertNumberToCurrency(row.price)})。等待接收中...`
                            })
                            this.handleRefreshBtnClicked()
                        }
                    })
                    break
                case '已赠送':
                    window.RsiApi.undoGiftPledge(row.id.toString()).then((response) => {
                        console.log(response)
                        if (response.success === 0) {
                            this.notification.error({
                                title: '撤销赠送失败',
                                content: response.msg
                            })
                        } else {
                            this.notification.success({
                                title: '撤销赠送成功',
                                content: `已撤销赠送一件 ${row.title} (价值 ${convertNumberToCurrency(row.price)})。机库刷新中...`
                            })
                            this.handleRefreshBtnClicked()
                        }
                    })
                    
            }
        }
        
    },
    data() {
        const me = this as any
        return {
            columns: [
                {
                    title: '图片',
                    key: 'image',
                    width: '12%',
                    render (row) {
                        let image = row.image
                        if (image.startsWith('/')) {
                            image = 'https://robertsspaceindustries.com' + image
                        }
                        // console.log(image)
                        return h(
                            'img',
                            {
                                src: image,
                                style: {
                                    width: '100%',
                                    height: '100%',
                                    borderRadius: '5px'
                                }
                            }
                        )
                    }
                },
                {
                    title: '名称',
                    key: 'title',
                    width: '26%',
                    filterOptions: [
                        {
                            label: '舰船',
                            value: '舰船'
                        },
                        {
                            label: '涂装',
                            value: '涂装'
                        },
                        {
                            label: '升级',
                            value: '升级'
                        },
                        {
                            label: '订阅',
                            value: '订阅'
                        }
                    ],
                    filter: (value, row) => {
                        switch(value) {
                            case '升级':
                                return row.english_title.includes('Upgrade')
                            case '舰船':
                                return (row.english_title.includes('Ship') && row.current_price > 0) || (row.current_price > row.price && !row.english_title.includes('Upgrade'))
                            case '涂装':
                                return row.english_title.includes('Paint')
                            case '订阅':
                                return row.price === 0 && row.status.includes('可礼物')
                        }
                    },
                    render (row) {
                        return renderDataTableTitle(row)
                    }
                },
                {
                    title: '数量',
                    key: 'num',
                    width: '6%'
                },
                {
                    title: '状态',
                    key: 'status',
                    width: '26%',
                    filterOptions: [
                        {
                            label: '可升级',
                            value: '可升级'
                        },
                        {
                            label: '可回收',
                            value: '可回收'
                        },
                        {
                            label: '可礼物',
                            value: '可礼物'
                        },
                        {
                            label: '已赠送',
                            value: '已赠送'
                        },
                        {
                            label: '其他',
                            value: '其他'
                        }
                    ],
                    filter (value, row) {
                        if (value === '其他') {
                            return row.status.length === 0
                        }
                        return row.status.includes(value)
                    },
                    render (row) {
                        const tags = row.status.map((tagKey) => {
                            let tag_type: string = ""
                            if (tagKey === '可礼物') {
                                tag_type = 'warning'
                            } else if (tagKey === '可回收') {
                                tag_type = 'success'
                            } else if (tagKey === '可升级') {
                                tag_type = 'info'
                            } else if (tagKey === '已赠送') {
                                tag_type = 'error'
                            }
                            return h(
                                NButton as any,
                                {
                                    style: {
                                        marginRight: '6px'
                                    },
                                    type: tag_type,
                                    strong: true,
                                    secondary: true,
                                    focusable: false,
                                    size: 'small',
                                    onClick: () => {
                                        me.selectedReclaimItem = row
                                        me.clickedTagKey = tagKey
                                        switch(tagKey) {
                                            case '可回收':
                                                me.selectedReclaimItemTitle = `${row.title} x ${row.num} (${'$'}${row.price * row.num / 100.0})`
                                                me.showReclaimConfirm = true
                                                break
                                            case '可礼物':
                                                me.showGiftConfirm = true
                                                break
                                            case '已赠送':
                                                me.handleTagClick()
                                        }


                                    }
                                },
                                    {
                                    default: () => tagKey
                                }
                            )
                            })
                        return tags
                    }
                },
                {
                    title: '原价',
                    key: 'price',
                    width: '8%',
                    defaultSortOrder: false,
                    sorter: {
                        compare: (a, b) => a.price - b.price,
                        multiple: 3
                    },
                    render (row) {
                        return h(
                            'span',
                            convertNumberToCurrency(row.price)
                        )
                    }
                    
                },
                {
                    title: '现价',
                    key: 'current_price',
                    width: '8%',
                    sorter: {
                        compare: (a, b) => a.current_price - b.current_price,
                        multiple: 3
                    },
                    render (row) {
                        return h(
                            'span',
                            convertNumberToCurrency(row.current_price)
                        )
                    }
                },
                {
                    title: '节约',
                    key: 'save',
                    width: '8%',
                    sorter: {
                        compare: (a, b) => a.save - b.save,
                        multiple: 3
                    },
                    render (row) {
                        return h(
                            'span',
                            convertNumberToCurrency(row.save)
                        )
                    }
                },
                {
                    title: '入库时间',
                    key: 'date',
                    width: '15%',
                    sorter: {
                        compare: (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
                        multiple: 3
                    },
                    render (row) {
                        return h(
                            'span',
                            moment(row.date).format('YYYY-MM-DD')
                        )
                    }
                    
                },
            ] as any,
            rowClassName (row: HangarItemTableData) {
                if (row.title.includes('Upgrade')) {
                    // console.log(row)
                    return 'upgrade'
                }
                return ''
            },
            table_data: [],
            giftName: '',
            giftPassword: '',
            giftEmail: '',
        }
    },
    computed: {
        emailAutoCompeleteOptions() {
            const prefix = this.giftEmail
            if (prefix.includes('@')) {
                return []
            }
            return ['@gmail.com', '@163.com', '@qq.com', '@126.com', '@outlook.com'].map((suffix) => {
                const prefix = this.giftEmail
                    return {
                        label: prefix + suffix,
                        value: prefix + suffix
                    }
                })
        }
    },
    activated() {
        const refuge_settings = getRefugeSettings()
        if (refuge_settings.currentUser == null) {
            window.location.hash = '#/login'
            this.notification.error({
                title: '未登录',
                content: '登录后才能查看机库列表哦'
            })
            return
        }
    }
}

</script>


<template>
    <div id="data-space">
        <n-data-table
        id="main-table"
        :bordered="false"
        :single-line="false"
        :columns="columns"
        :row-props="rowProps"
        :data="table_data"
        :row-class-name="rowClassName"
        flex-height
    />
        <n-button circle id="refresh-button" @click="handleRefreshBtnClicked">
            <template #icon>
                <n-icon><refresh-icon /></n-icon>
            </template>
        </n-button>
    </div>
    <n-modal
        v-model:show="showReclaimConfirm"
        preset="dialog"
        title="回收确认"
        :content="`确定要回收 ${ selectedReclaimItemTitle } 吗 ? \n警告！此操作无法回退！该机库物品将永远消失并返还与原价等额的信用点。`"
        positive-text="确认"
        negative-text="取消"
        @positive-click="handleTagClick"
        @negative-click="() => {console.log('cancel'); showReclaimConfirm = false;}">
    </n-modal>
    <n-modal v-model:show="showGiftConfirm">
    <n-card
      style="width: 600px"
      title="确认礼物信息"
      :bordered="false"
      size="huge"
      role="dialog"
      aria-modal="true"
    >
      <n-space vertical>
        <n-input v-model:value="giftName" type="text" placeholder="请输入接收人姓名" />
        <n-auto-complete
            v-model:value="giftEmail"
            :options="emailAutoCompeleteOptions"
            placeholder="请输入接收人邮箱"
            size="small"
        />
        <n-input
            type="password"
            v-model:value="giftPassword"
            show-password-on="mousedown"
            placeholder="请输入密码"
        />
        <n-space justify="end" horizon>
            <n-button size="small" @click="() => {console.log('cancel'); showGiftConfirm = false;}">取消</n-button>
            <n-button size="small" type="primary" @click="showGiftConfirm = false; handleTagClick()">确认</n-button>
        </n-space>
      </n-space>
    </n-card>
  </n-modal>
</template>

<style scoped>
#data-space {
    width: 100%;
    height: 100%;
}
#main-table {
    width: 100%;
    height: 100%;
    min-width: 100%;
}
:deep(.upgrade title) {
  color: rgba(7, 241, 104, 0.75) !important;
}
#refresh-button {
    position: fixed;
    bottom: 60px;
    right: 60px;
    z-index: 100;
}
</style>