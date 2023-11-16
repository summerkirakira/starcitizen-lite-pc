<script lang="ts">
import { 
    NPopover,
    NImage
 } from 'naive-ui';
import { HangarItemTableData } from './HangarPage.vue';

export default {
    setup() {
       
    },
    components: {
        NPopover,
        NImage
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
    <n-popover trigger="hover">
        <template #trigger>
            <div>
                <p>{{ hangarItem.title }}</p>
            </div>
        </template>
        <div class="title-box">
            <n-image :src="hangarItem.image" style="border-radius: 10px;" :alt="hangarItem.title" height="100" preview-disabled/>
            <div style="max-height: 100px;">
                <p style="font-size: 20px; width: 100%; padding: 0%; margin: 0px;">{{ hangarItem.title }}</p>
                <p style="font-size: 15px; width: 100%; padding: 0%;">{{ hangarItem.english_title }}</p>
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
    }
</style>