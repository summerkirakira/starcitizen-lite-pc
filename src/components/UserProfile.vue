<script lang="ts">
import { getRefugeSettings, getUsersFromDatabase, removeDuplicateUserFromDatabase } from '../../electron/uitils/settings';
import { NAvatar, NDropdown, NButton, NCard, NSpace, NDivider } from 'naive-ui';
import { formatTime } from '../../electron/uitils/basic';
import { refreshBillingItems, getStoredBillingItems } from '../../electron/network/billing-parser/BillingParser';
import { getBillingsEchartOptions, getTimeBillingEchartOptions } from '../utils/echartsFormatter';

import * as echarts from 'echarts/core';
import { 
    TooltipComponent, 
    LegendComponent,
    TitleComponent,
    ToolboxComponent,
    GridComponent,
    DataZoomComponent
} from 'echarts/components';
import { PieChart, LineChart } from 'echarts/charts';
import { LabelLayout, UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';


export default {
    setup() {
        const refugeSettings = getRefugeSettings()
        if (refugeSettings.currentUser == null) {
            window.location.hash = '#/login'
            return
        }
        return {
            options: [],
            currentUser: refugeSettings.currentUser,
        }
    },
    data() {
        
    },
    mounted() {
        
    },
    activated() {
        const refugeSettings = getRefugeSettings()
        if (refugeSettings.currentUser == null) {
            window.location.hash = '#/login'
            return
        }
        removeDuplicateUserFromDatabase()
        const users = getUsersFromDatabase()
        this.options = []
        users.forEach((user) => {
            this.options.push({
                label: user.handle,
                key: user.id
            })
        })
        this.currentUser = refugeSettings.currentUser
        this.currentUserName = refugeSettings.currentUser.handle
        echarts.use([
            TooltipComponent,
            LegendComponent,
            PieChart,
            CanvasRenderer,
            LabelLayout,
            DataZoomComponent,
            TitleComponent,
            ToolboxComponent,
            GridComponent,
            LineChart,
            UniversalTransition
        ]);
        let chartDom = document.getElementById('spent_echarts_container');
        let billingChart = echarts.init(chartDom);
        let option = getBillingsEchartOptions(getStoredBillingItems());
        billingChart.setOption(option);

        let timeChartDom = document.getElementById('time_echarts_container');
        let timeChart = echarts.init(timeChartDom);
        let timeOption = getTimeBillingEchartOptions(getStoredBillingItems());
        timeChart.setOption(timeOption);
    },
    methods: {
        handleSelect() {
            console.log('handleSelect')
        },
        formatDate(time: Date): string {
            return formatTime(new Date(time))
        }
    },
    components: {
        NAvatar,
        NDropdown,
        NButton,
        NCard,
        NSpace,
        NDivider
    }
}
</script>
<template>
    <n-space id="container">

        <!-- <n-dropdown :options="options" @select="handleSelect">
            <n-button>{{ currentUserName }}</n-button>
        </n-dropdown> -->

        <n-card style="width: 400px;" hoverable>
            <!-- <template #header-extra>
            #header-extra
            </template> -->
            <div style="display: flex; gap: 0px;">
                <n-avatar
                round
                :size="80"
                fallback-src="https://cdn.robertsspaceindustries.com/static/images/account/avatar_default_big.jpg"
                :src="`https://robertsspaceindustries.com${currentUser.profile_image}`"/>
                <div>
                    <p style="font-size: 22px; padding-left: 20px; padding-top: 10px; margin: 0px; text-align: left;">{{ currentUser.handle }}</p>
                    <p style="font-size: 16px; padding-left: 20px; padding-top: 0px; margin: 0px; text-align: left;">{{ currentUser.name }}</p>
                </div>
            </div>
            <div>
                <n-divider />
                <div id="user-profile">
                    <n-space justify="space-between">
                        <p>注册时间</p>
                        <p>{{ this.formatDate(currentUser.register_time) }}</p>
                    </n-space>
                    <n-space justify="space-between">
                        <p>所属舰队</p>
                        <p>{{ currentUser.org_name }}</p>
                    </n-space>
                    <n-space justify="space-between">
                        <p>舰队等级</p>
                        <p>{{ currentUser.org_rank }}</p>
                    </n-space>
                    <n-divider />
                    <n-space justify="space-between">
                        <p>机库价值</p>
                        <p>{{ `${currentUser.hangar_value} USD` }}</p>
                    </n-space>
                    <n-space justify="space-between">
                        <p>信用点</p>
                        <p>{{ `${currentUser.total_spent} USD` }}</p>
                    </n-space>
                    <n-space justify="space-between">
                        <p>UEC</p>
                        <p>{{ `${currentUser.uec} UEC` }}</p>
                    </n-space>
                    <n-space justify="space-between">
                        <p>REC</p>
                        <p>{{ `${currentUser.rec} REC` }}</p>
                    </n-space>
                    <n-space justify="space-between">
                        <p>邀请码</p>
                        <p>{{ `${currentUser.referral_code}` }}</p>
                    </n-space>
                    <n-space justify="space-between">
                        <p>邀请人数</p>
                        <p>{{ `${currentUser.referral_count}人` }}</p>
                    </n-space>
                </div>
            </div>
            <template #action>
                <n-space justify="end">
                    <n-button strong secondary type="default" style="width: 100%;" @click="handleSelect">退出登录</n-button>
                    <n-button type="primary" style="width: 100%;" @click="handleSelect">切换账号</n-button>
                </n-space>
            </template>
        </n-card>
        <n-space vertical>
            <n-card title="账单统计" style="width: 500px;" hoverable>
                <div id="spent_echarts_container" style="width: 100%; height: 300px;" />
            </n-card>
            <n-card style="width: 500px;" hoverable>
                <div id="time_echarts_container" style="width: 100%; height: 273px;" />
            </n-card>
        </n-space>
        
    </n-space>
</template>
<style scoped>
#container {
    position: absolute;
    padding: 20px;
}
#user-profile {
    font-size: 13px;
}

#user-profile n-space {
    padding: 0px;
    margin: 0px;
    gap: 0px;
}

#user-profile n-space p {
    padding: 0px;
    margin: 0px;
    gap: 0px;
}
</style>