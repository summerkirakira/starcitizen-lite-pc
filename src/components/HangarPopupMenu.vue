<script lang="ts">
import { 
    NPopover,
    NImage,
    NEllipsis
 } from 'naive-ui';
import { HangarItemTableData } from './HangarPage.vue';

export default {
    setup() {
       
    },
    components: {
        NPopover,
        NImage,
        NEllipsis
    },
    props: {
        hangarItem: {
            type: Object as () => HangarItemTableData,
            required: true
        }
    }
}

</script>

<template>
    <n-popover trigger="hover" style="max-height: 600px; max-width: 450px;" placement="left-start" scrollable>
        <template #trigger>
            <div>
                <p>{{ hangarItem.title }}</p>
            </div>
        </template>
        <div class="container-box">
            <div class="title-box">
                <n-image :src="hangarItem.image" style="border-radius: 5px;" :alt="hangarItem.title" height="100" preview-disabled/>
                <div style="max-height: 100px;">
                    <n-ellipsis :line-clamp="1" style="font-size: 20px; padding: 0%; margin: 0px; min-width: 300px;">{{ hangarItem.title }}</n-ellipsis>
                    <n-ellipsis :line-clamp="2" style="font-size: 15px; padding: 0%;">{{ hangarItem.english_title }}</n-ellipsis>
                </div>
            </div>
            <div class="line" v-if="hangarItem.raw.contains.length > 0">
                <p style="font-size: 20px; padding-top: 8px; padding-bottom: 0px; margin: 0px;">内容</p>
            </div>
            <div class="content-box">
                <li v-for="item in hangarItem.raw.contains" :key="item.title" style="font-size: 15px; padding: 0%; margin: 0px;">
                    <div style="display: grid; gap: 0; grid-template-columns: 1fr 1fr;border-radius: 5px; padding-top: 8px;">
                        <n-image :src="item.image" style="padding: 0%; margin: 0%; border-radius: 5px;" :alt="item.title" height="100" preview-disabled/>
                        <div class="contain-details">
                            <n-ellipsis :line-clamp="1" class="contain-detail-item">{{ item.title }}</n-ellipsis>
                            <n-ellipsis :line-clamp="1" class="contain-detail-item">{{ item.type }}</n-ellipsis>
                            <n-ellipsis :line-clamp="1" class="contain-detail-item">{{ item.manufacturer }}</n-ellipsis>
                            <n-ellipsis :line-clamp="1" class="contain-detail-item" v-if="item.currentPrice != null && item.currentPrice != 0">{{ `$${item.currentPrice / 100.0}` }}</n-ellipsis>
                        </div>
                    </div>
                </li>
            </div>
            <div class="line" v-if="hangarItem.raw.also_contains.length > 0">
                <p style="font-size: 20px; padding-top: 8px; padding-bottom: 8px; margin: 0px;">包含</p>
            </div>
            <div class="content-box">
                <li v-for="item in hangarItem.raw.also_contains" style="font-size: 15px; padding: 0%; margin: 0px;">
                    <p style="font-size: 15px; padding: 0%; margin: 0px;">{{ item }}</p>
                </li>
            </div>
        </div>
        
    </n-popover>
</template>

<style scoped>
    .title-box {
        display: grid;
        grid-template-columns: 1fr 3fr;
        max-width: 500px;
        gap: 30px;
        border-radius: 10px;
    }
    li {
        list-style: none;
    }
    .contain-details {
        display: flex;
        flex-direction: column;
        height: 100px; /* 设置容器高度 */
        width: 250px;
    }
    .contain-detail-item {
        flex: 1; /* 设置每个子元素的高度 */
        font-size: 15px;
        padding: 0%;
        margin: 0px;
    }
</style>