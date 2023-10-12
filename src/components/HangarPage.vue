<script lang="ts">
import {
    NSpace,
    NDataTable,
    NTag
} from 'naive-ui'
import { parseHtmlToHangarItem, getStoredHangarItems, refreshHangarItems } from '../../electron/network/hangar-parser/HangarParser'
import { HangarItem } from '../../electron/network/hangar-parser/HangarParser'
import { getHangarItemPrice, getHangarUpgradePrice, translateHangarItemName } from '../../electron/uitils/hangar-util'
import { h } from 'vue'
import moment from 'moment'
import { useNotification, useLoadingBar } from 'naive-ui'
import { getRefugeSettings } from '../../electron/uitils/settings'

interface HangarItemTableData {
    id: number,
    title: string,
    num: number,
    price: number,
    current_price: number,
    save: number,
    status: string[],
    date: Date,
    rowClassName?: string
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
        })
    }

    let save = 0
    if (currentPrice > item.price) {
        save = currentPrice - item.price
    }


    return {
        id: item.id,
        title: translateHangarItemName(item.title),
        num: 1,
        price: item.price,
        current_price: currentPrice,
        save: save,
        status: status,
        date: item.date
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
            }
        } else {
            map.set(key, convertHangarItemToTableData(item))
        }
    }
    for (const item of map.values()) {
        result.push(item)
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
        return {
            rowProps: (row: HangarItemTableData) => {
                return {
                    // onClick: () => {
                    //     console.log(row)
                    // },
                    // onMouseenter: () => {
                    //     console.log(row)
                    // }
                }
            },
            notification,
            loadingBar
        }
    },
    components: {
        NSpace,
        NDataTable
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
        // console.log(this.table_data[0])
        this.loadingBar.start()
        refreshHangarItemTable().then((table_data) => {
            this.table_data = table_data
            this.notification.success({
                title: '刷新机库成功',
                content: '机库列表已更新'
            })
            this.loadingBar.finish()
        }).catch((err) => {
            this.notification.error({
                title: '刷新机库失败',
                content: '请检查网络连接'
            })
            this.loadingBar.error()
        })
    },
    methods: {
        async handleRefreshBtnClicked() {
            this.table_data = await refreshHangarItemTable()
        }
        
    },
    data() {
        return {
            columns: [
                {
                    title: '名称',
                    key: 'title',
                    width: '20%',
                    className: 'title',
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
                    }
                },
                {
                    title: '数量',
                    key: 'num',
                    width: '8%'
                },
                {
                    title: '状态',
                    key: 'status',
                    width: '25%',
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
                                NTag,
                                {
                                    style: {
                                        marginRight: '6px'
                                    },
                                        type: tag_type,
                                        bordered: false
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
                    width: '10%',
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
                    width: '10%',
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
                    width: '10%',
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
            ],
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
</style>