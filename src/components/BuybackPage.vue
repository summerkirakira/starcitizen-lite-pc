<script lang="ts">
import {
    NSpace,
    NDataTable,
    NTag,
    dateEnGB,
    useNotification,
    useMessage,
    useLoadingBar
} from 'naive-ui'
import { getStoredBuybackItems, refreshBuybackItems, BuybackItem } from '../../electron/network/buyback-parser/BuybackParser'
import { getHangarItemPrice, getHangarUpgradePrice, translateHangarItemName } from '../../electron/uitils/hangar-util'
import { h } from 'vue'
import moment from 'moment'
import { getRefugeSettings } from '../../electron/uitils/settings'

interface BuybackItemTableData {
    id: number,
    title: string,
    num: number,
    current_price: number,
    date: Date,
    rowClassName?: string
}

function convertBuybackItemToTableData(item: BuybackItem): BuybackItemTableData {
    let currentPrice = 0

    item.title = item.title.replace('Standalone Ship -', '').replace('- upgraded', '').trim()

    if (item.isUpgrade) {
        currentPrice += getHangarUpgradePrice(item.title)
    } else {
        currentPrice = getHangarItemPrice(item.title)
    }

    return {
        id: item.id,
        title: translateHangarItemName(item.title),
        num: 1,
        current_price: currentPrice,
        date: item.date
    }
}

function convertBuybackItemsToTableData(items: BuybackItem[]): BuybackItemTableData[] {
    const result: BuybackItemTableData[] = []
    const map = new Map<string, BuybackItemTableData>()
    for (const item of items) {
        let key = item.title
        if (map.has(key)) {
            const old_item = map.get(key)
            if (old_item) {
                old_item.num += 1
            }
        } else {
            map.set(key, convertBuybackItemToTableData(item))
        }
    }
    for (const item of map.values()) {
        result.push(item)
    }
    return result
}

async function refreshBuybackItemTable(): Promise<BuybackItemTableData[]> {
    const hangar_items = await refreshBuybackItems()
    const table_data = convertBuybackItemsToTableData(hangar_items)
    return table_data
}

function getCachedHangarItemTable(): BuybackItemTableData[] {
    const hangar_items = getStoredBuybackItems()
    const table_data = convertBuybackItemsToTableData(hangar_items)
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
            rowProps: (row: BuybackItem) => {
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
            loadingBar,
            message
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
            return
        }
    },
    methods: {
        async handleRefreshBtnClicked() {
            this.table_data = await refreshBuybackItemTable()
        }
        
    },
    activated() {
        const refuge_settings = getRefugeSettings()
        if (refuge_settings.currentUser == null) {
            window.location.hash = '#/login'
            this.notification.error({
                title: '未登录',
                content: '登录后才能查看回购列表哦'
            })
            return
        }

        this.table_data = getCachedHangarItemTable()
        this.loadingBar.start()
        refreshBuybackItemTable().then((table_data) => {
            this.table_data = table_data
            this.message.success('回购列表已更新')
            this.loadingBar.finish()
        }).catch((err) => {
            this.notification.error({
                title: '刷新回购失败',
                content: '请检查网络连接'
            })
            this.loadingBar.error()
        })
    },
    data() {
        return {
            columns: [
                {
                    title: '名称',
                    key: 'title',
                    width: '20%',
                    className: 'title',
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
                    title: '价格',
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
            ] as any[],
            rowClassName (row: BuybackItemTableData) {
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
</style>../../electron/network/buyback-parser/buybackParser