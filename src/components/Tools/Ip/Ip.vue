<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useToolsStore } from '@/store/modules/tools'
import { isIp } from '@/utils/verify'
import { ElMessage } from 'element-plus'
import DetailHeader from '@/components/Layout/DetailHeader/DetailHeader.vue'
import { ipProviders } from '@/api/ip'

const info = reactive({
  title: "IP查询",
})

//store
const toolsStore = useToolsStore()
const params = reactive({
  ip: '',
})

// 数据源选择
const selectedSource = ref('ipinfo') // 默认使用IPinfo.io
const dataSources = ipProviders
//查询
const loading = ref(false)

// 获取用户的公网IP地址
const getPublicIp = async () => {
  try {
    const response = await fetch('https://api.ipify.org?format=json')
    if (response.ok) {
      const data = await response.json()
      params.ip = data.ip
    }
  } catch (error) {
    console.log('获取公网IP失败:', error)
  }
}
const search = async (type: string) => {
  try {
    //通过点击获取ip信息
    if (type == 'click') {
      //验证是否ip地址
      if (!isIp(params.ip)) {
        ElMessage({
          message: "无效的ip地址",
          type: "warning",
          duration: 1500
        })
        return
      }
    }
    // 显示加载状态
    loading.value = true
    //获取信息
    await toolsStore.getIp(params, selectedSource.value)
    ElMessage({
      message: "查询成功",
      type: "success",
      duration: 1500
    })
  } catch (error: any) {
    console.log(error)
    ElMessage({
      message: error.message || "查询失败",
      type: "error",
      duration: 1500
    })
  } finally {
    // 隐藏加载状态
    loading.value = false
  }
}

onMounted(async () => {
  await getPublicIp()
  search('')
})
</script>

<template>
  <div class="flex flex-col flex-1 mt-3">
    <DetailHeader :title="info.title"></DetailHeader>

    <div class="p-4 bg-white rounded-2xl">
      <div class="flex flex-col gap-3 items-start mb-4 md:flex-row md:items-center">
        <div class="w-full md:w-60">
          <el-input v-model="params.ip" placeholder="输入IP地址" size="large"></el-input>
        </div>
        <div class="w-full md:w-48">
          <el-select v-model="selectedSource" placeholder="选择数据源" size="large" style="width: 100%">
            <el-option
              v-for="item in dataSources"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </div>
        <div class="w-full md:w-auto">
          <el-button type="primary" @click="search('click')" :loading="loading" size="large">查询</el-button>
        </div>
      </div>
      <div class="bg-gray-100 rounded-2xl overflow-hidden">
        <div class="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4">
          <h3 class="text-xl font-bold">您的IP信息</h3>
        </div>
        <div class="p-4 space-y-3">
          <div class="bg-white rounded-lg p-3 flex items-center">
            <div class="w-24 font-medium text-gray-700">使用数据源:</div>
            <div class="flex-1 text-gray-900">{{ dataSources.find(item => item.value === selectedSource)?.label || '未知' }}</div>
          </div>
          <div class="bg-white rounded-lg p-3 flex items-center">
            <div class="w-24 font-medium text-gray-700">IP地址:</div>
            <div class="flex-1 text-gray-900">{{ toolsStore.ipData.ip || '未知' }}</div>
          </div>
          <div class="bg-white rounded-lg p-3 flex items-center">
            <div class="w-24 font-medium text-gray-700">地理位置:</div>
            <div class="flex-1 text-gray-900">{{ toolsStore.ipData.pos || '未知' }}</div>
          </div>
          <div class="bg-white rounded-lg p-3 flex items-center">
            <div class="w-24 font-medium text-gray-700">运营商:</div>
            <div class="flex-1 text-gray-900">{{ toolsStore.ipData.isp || '未知' }}</div>
          </div>
          <div v-if="toolsStore.ipData.city" class="bg-white rounded-lg p-3 flex items-center">
            <div class="w-24 font-medium text-gray-700">城市:</div>
            <div class="flex-1 text-gray-900">{{ toolsStore.ipData.city }}</div>
          </div>
          <div v-if="toolsStore.ipData.region" class="bg-white rounded-lg p-3 flex items-center">
            <div class="w-24 font-medium text-gray-700">地区:</div>
            <div class="flex-1 text-gray-900">{{ toolsStore.ipData.region }}</div>
          </div>
          <div v-if="toolsStore.ipData.country" class="bg-white rounded-lg p-3 flex items-center">
            <div class="w-24 font-medium text-gray-700">国家:</div>
            <div class="flex-1 text-gray-900">{{ toolsStore.ipData.country }}</div>
          </div>
          <div v-if="toolsStore.ipData.timezone" class="bg-white rounded-lg p-3 flex items-center">
            <div class="w-24 font-medium text-gray-700">时区:</div>
            <div class="flex-1 text-gray-900">{{ toolsStore.ipData.timezone }}</div>
          </div>
          <div v-if="toolsStore.ipData.asn" class="bg-white rounded-lg p-3 flex items-center">
            <div class="w-24 font-medium text-gray-700">ASN:</div>
            <div class="flex-1 text-gray-900">{{ toolsStore.ipData.asn }}</div>
          </div>
          <div v-if="toolsStore.ipData.organization" class="bg-white rounded-lg p-3 flex items-center">
            <div class="w-24 font-medium text-gray-700">组织:</div>
            <div class="flex-1 text-gray-900">{{ toolsStore.ipData.organization }}</div>
          </div>
          <div v-if="toolsStore.ipData.latitude && toolsStore.ipData.longitude" class="bg-white rounded-lg p-3 flex items-center">
            <div class="w-24 font-medium text-gray-700">经纬度:</div>
            <div class="flex-1 text-gray-900">{{ toolsStore.ipData.latitude }}, {{ toolsStore.ipData.longitude }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>