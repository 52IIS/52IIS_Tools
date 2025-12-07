<script setup lang="ts">
import {  ref } from 'vue';
const appDesc = ref(import.meta.env.VITE_APP_DESC || '')
</script>

<template>
  <div class="z-10 p-5 w-full text-center rounded-2xl">
    <el-text>{{ appDesc }}  © 2025 <a href="https://github.com/52IIS/52IIS_Tools" target="_blank" class="text-blue-700">52IIS Tools</a></el-text>
  </div>
</template>

<style scoped>

</style>