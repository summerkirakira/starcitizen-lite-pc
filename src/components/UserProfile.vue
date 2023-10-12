<script lang="ts">
import { getRefugeSettings, getUsersFromDatabase } from '../../electron/uitils/settings';

export default {
    setup() {
        return {
            options: [],
            currentUserName: ''
        }
    },
    mounted() {
        window.location.hash = '#/login'
        
        const refugeSettings = getRefugeSettings()
        console.log(refugeSettings)
        if (refugeSettings.currentUser == null) {
            window.location.hash = '#/login'
            return
        }
        const users = getUsersFromDatabase()
        this.options = []
        users.forEach((user) => {
            this.options.push({
                label: user.handle,
                key: user.id
            })
        })
        this.currentUserName = refugeSettings.currentUser.handle
        console.log(this.options)
    },
    methods: {
        handleSelect() {
            console.log('handleSelect')
        }
    }
}
</script>
<template>
    <div style="height: 100%; width: 100%;position: absolute;">
        <n-dropdown :options="options" @select="handleSelect">
            <n-button>{{ currentUserName }}</n-button>
        </n-dropdown>
    </div>
</template>
<style scoped>

</style>