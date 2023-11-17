<script lang="ts">
import {
    NSpace,
    NDataTable,
    NTag,
    NImage,
c
} from 'naive-ui'
import { getStoredHangarItems, refreshHangarItems } from '../../electron/network/hangar-parser/HangarParser'
import { HangarItem } from '../../electron/network/hangar-parser/HangarParser'
import { getHangarItemPrice, getHangarUpgradePrice, translateHangarItemName, translateHangerItemType } from '../../electron/uitils/hangar-util'
import { h } from 'vue'
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
            message
        }
    },
    components: {
        NSpace,
        NDataTable,
        NButton,
        NIcon,
        RefreshIcon,
        HangarPopupMenu
    },
    mounted() {
        const refugeSettings = getRefugeSettings()
        if (refugeSettings.currentUser == null) {
            window.location.hash = '#/login'
            this.notification.error({
                title: '未登录',
                content: '登录后才能查看机库列表哦'
            })
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
        }
        
    },
    data() {
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
                    width: '28%',
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
                        }
                    ],
                    filter (value, row) {
                        return ~row.address.indexOf(value)
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
                    width: '27%',
                    render (row) {
                        const tags = row.status.map((tagKey) => {
                            let tag_type: string = ""
                            if (tagKey === '可礼物') {
                                tag_type = 'warning'
                            } else if (tagKey === '可回收') {
                                tag_type = 'success'
                            } else if (tagKey === '可升级') {
                                tag_type = 'info'
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
                                        console.log(tagKey, row)
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
            table_data: []
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