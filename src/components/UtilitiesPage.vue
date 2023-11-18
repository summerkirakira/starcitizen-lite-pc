<script lang="ts">
import { 
    NDivider,
    NGrid,
    NGridItem,
    NCard,
    NButton
} from 'naive-ui';


export default {
    methods: {
        handleJumpBtnClicked(url: string) {
            window.openRsiWeb(url)
            // window.shareData(window.fileManager)
        }
    },
    components: {
      NDivider,
      NGrid,
      NGridItem,
      NCard,
      NButton
    }
}

</script>

<template>
    <n-divider>RSI官网索引</n-divider>
    <n-grid :x-gap="12" :y-gap="8" cols="2 400:4 400:6">
        <n-grid-item>
            <n-card bordered>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span>RSI官网</span>
                    <n-button size="small" type="primary" @click="handleJumpBtnClicked('https://robertsspaceindustries.com/account/pledges')">打开</n-button>
                </div>
            </n-card>
        </n-grid-item>
        <n-grid-item>
            <n-card bordered>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span>RSI官网</span>
                    <n-button size="small" type="primary" round>打开</n-button>
                </div>
            </n-card>
        </n-grid-item>
        <n-grid-item>
            <n-card bordered>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span>RSI官网</span>
                    <n-button size="small" type="primary" round>打开</n-button>
                </div>
            </n-card>
        </n-grid-item>
        <n-grid-item>
            <n-card bordered>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span>RSI官网</span>
                    <n-button size="small" type="primary" round>打开</n-button>
                </div>
            </n-card>
        </n-grid-item>
        <n-grid-item>
            <n-card bordered>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span>RSI官网</span>
                    <n-button size="small" type="primary" round>打开</n-button>
                </div>
            </n-card>
        </n-grid-item>
        <n-grid-item>
            <n-card bordered>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span>RSI官网</span>
                    <n-button size="small" type="primary" round>打开</n-button>
                </div>
            </n-card>
        </n-grid-item>
        <n-grid-item>
            <n-card bordered>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span>RSI官网</span>
                    <n-button size="small" type="primary" round>打开</n-button>
                </div>
            </n-card>
        </n-grid-item>
        <n-grid-item>
            <n-card bordered>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span>RSI官网</span>
                    <n-button size="small" type="primary" round>打开</n-button>
                </div>
            </n-card>
        </n-grid-item>
    </n-grid>
</template>