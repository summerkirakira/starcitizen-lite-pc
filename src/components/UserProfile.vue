<script lang="ts">
export default {
    setup() {
        return {
            
        }
    },
    mounted() {
        setInterval(() => {
            window.location.hash = '#/login'
        }, 1000)
    }
}
</script>
<template>
    <h1>Here is User Profile Page</h1>
</template>