<script setup lang="ts">
import { reactive, ref } from 'vue'
import DetailHeader from '@/components/Layout/DetailHeader/DetailHeader.vue'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import { copy } from '@/utils/string'

// 响应式数据
const info = reactive({
  title: "子网掩码工具",
})

// 输入和输出
const inputType = ref('ip-cidr') // ip-cidr, subnet-mask
const ipCidr = ref('192.168.1.1/24')
const subnetMask = ref('255.255.255.0')

// 计算结果
const result = reactive({
  networkAddress: '',
  broadcastAddress: '',
  subnetMask: '',
  cidr: '',
  ipRange: '',
  totalHosts: 0,
  usableHosts: 0,
  wildcardMask: ''
})

// 错误信息
const errorMessage = ref('')

// 切换输入类型
const switchInputType = (type: string) => {
  inputType.value = type
}

// IP地址验证
const validateIp = (ip: string): boolean => {
  const ipRegex = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
  return ipRegex.test(ip)
}

// 子网掩码验证
const validateSubnetMask = (mask: string): boolean => {
  const validMasks = [
    '255.0.0.0', '255.128.0.0', '255.192.0.0', '255.224.0.0',
    '255.240.0.0', '255.248.0.0', '255.252.0.0', '255.254.0.0',
    '255.255.0.0', '255.255.128.0', '255.255.192.0', '255.255.224.0',
    '255.255.240.0', '255.255.248.0', '255.255.252.0', '255.255.254.0',
    '255.255.255.0', '255.255.255.128', '255.255.255.192', '255.255.255.224',
    '255.255.255.240', '255.255.255.248', '255.255.255.252', '255.255.255.254',
    '255.255.255.255'
  ]
  return validMasks.includes(mask)
}

// CIDR验证
const validateCidr = (cidr: string): boolean => {
  const cidrRegex = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\/(3[0-2]|[1-2]?[0-9])$/
  return cidrRegex.test(cidr)
}

// CIDR转子网掩码
const cidrToSubnetMask = (cidr: number): string => {
  const mask = (0xffffffff << (32 - cidr)) >>> 0
  return [
    (mask >> 24) & 0xff,
    (mask >> 16) & 0xff,
    (mask >> 8) & 0xff,
    mask & 0xff
  ].join('.')
}

// 子网掩码转CIDR
const subnetMaskToCidr = (mask: string): number => {
  const parts = mask.split('.').map(Number)
  const binary = parts.map(part => part.toString(2).padStart(8, '0')).join('')
  return binary.indexOf('0') === -1 ? 32 : binary.indexOf('0')
}

// IP字符串转数值
const ipToNumber = (ip: string): number => {
  return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0)
}

// 数值转IP字符串
const numberToIp = (num: number): string => {
  return [
    (num >> 24) & 0xff,
    (num >> 16) & 0xff,
    (num >> 8) & 0xff,
    num & 0xff
  ].join('.')
}

// 计算子网信息
const calculateSubnet = () => {
  errorMessage.value = ''
  
  try {
    let ip: string
    let cidr: number
    let mask: string
    
    if (inputType.value === 'ip-cidr') {
      if (!validateCidr(ipCidr.value)) {
        throw new Error('请输入有效的CIDR格式（如：192.168.1.1/24）')
      }
      
      const [ipPart, cidrPart] = ipCidr.value.split('/')
      ip = ipPart
      cidr = parseInt(cidrPart)
      mask = cidrToSubnetMask(cidr)
      subnetMask.value = mask
    } else {
      if (!validateIp(ipCidr.value.split('/')[0])) {
        throw new Error('请输入有效的IP地址')
      }
      
      if (!validateSubnetMask(subnetMask.value)) {
        throw new Error('请输入有效的子网掩码')
      }
      
      ip = ipCidr.value.split('/')[0]
      cidr = subnetMaskToCidr(subnetMask.value)
      mask = subnetMask.value
      ipCidr.value = `${ip}/${cidr}`
    }
    
    // 计算网络地址
    const ipNum = ipToNumber(ip)
    const maskNum = ipToNumber(mask)
    const networkNum = ipNum & maskNum
    const networkAddress = numberToIp(networkNum)
    
    // 计算广播地址
    const broadcastNum = networkNum | (~maskNum >>> 0)
    const broadcastAddress = numberToIp(broadcastNum)
    
    // 计算可用IP范围
    const firstHost = numberToIp(networkNum + 1)
    const lastHost = numberToIp(broadcastNum - 1)
    const ipRange = cidr === 32 ? ip : `${firstHost} - ${lastHost}`
    
    // 计算主机数量
    const totalHosts = Math.pow(2, 32 - cidr)
    const usableHosts = cidr === 32 || cidr === 31 ? totalHosts : totalHosts - 2
    
    // 计算通配符掩码
    const wildcardNum = ~maskNum >>> 0
    const wildcardMask = numberToIp(wildcardNum)
    
    // 更新结果
    result.networkAddress = networkAddress
    result.broadcastAddress = broadcastAddress
    result.subnetMask = mask
    result.cidr = `/${cidr}`
    result.ipRange = ipRange
    result.totalHosts = totalHosts
    result.usableHosts = usableHosts
    result.wildcardMask = wildcardMask
    
  } catch (e) {
    errorMessage.value = e instanceof Error ? e.message : '计算错误'
  }
}

// 复制结果
const copyResult = (text: string) => {
  copy(text)
}

// 清空输入
const clearInput = () => {
  ipCidr.value = '192.168.1.1/24'
  subnetMask.value = '255.255.255.0'
  errorMessage.value = ''
  
  // 清空结果
  Object.keys(result).forEach(key => {
    result[key as keyof typeof result] = '' as any
  })
  result.totalHosts = 0
  result.usableHosts = 0
}

// 初始化计算
calculateSubnet()
</script>

<template>
  <div class="flex flex-col flex-1 mt-3">
    <DetailHeader :title="info.title"></DetailHeader>

    <div class="p-4 bg-white rounded-2xl">
      <!-- 输入类型切换 -->
      <div class="flex mb-4">
        <el-radio-group v-model="inputType" @change="calculateSubnet">
          <el-radio-button label="ip-cidr">CIDR格式</el-radio-button>
          <el-radio-button label="subnet-mask">子网掩码</el-radio-button>
        </el-radio-group>
      </div>
      
      <!-- 输入区域 -->
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <el-input
            v-model="ipCidr"
            placeholder="请输入CIDR格式（如：192.168.1.1/24）"
            @input="calculateSubnet"
          />
        </div>
        <div>
          <el-input
            v-model="subnetMask"
            placeholder="请输入子网掩码（如：255.255.255.0）"
            @input="calculateSubnet"
          />
        </div>
      </div>
      
      <!-- 错误信息 -->
      <div v-if="errorMessage" class="mt-2 text-red-500">
        {{ errorMessage }}
      </div>
      
      <!-- 操作按钮 -->
      <div class="mt-4">
        <el-button type="primary" @click="calculateSubnet">重新计算</el-button>
        <el-button @click="clearInput">清空</el-button>
      </div>
    </div>

    <!-- 结果展示区域 -->
    <div class="p-4 mt-3 bg-white rounded-2xl">
      <h3 class="mb-4 text-lg font-semibold">计算结果</h3>
      
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <el-descriptions border :column="1" size="small">
            <el-descriptions-item label="网络地址">
              <div class="flex items-center">
                <span>{{ result.networkAddress }}</span>
                <el-button 
                  type="text" 
                  size="small" 
                  @click="copyResult(result.networkAddress)"
                  class="ml-2"
                >
                  复制
                </el-button>
              </div>
            </el-descriptions-item>
            <el-descriptions-item label="广播地址">
              <div class="flex items-center">
                <span>{{ result.broadcastAddress }}</span>
                <el-button 
                  type="text" 
                  size="small" 
                  @click="copyResult(result.broadcastAddress)"
                  class="ml-2"
                >
                  复制
                </el-button>
              </div>
            </el-descriptions-item>
            <el-descriptions-item label="子网掩码">
              <div class="flex items-center">
                <span>{{ result.subnetMask }}</span>
                <el-button 
                  type="text" 
                  size="small" 
                  @click="copyResult(result.subnetMask)"
                  class="ml-2"
                >
                  复制
                </el-button>
              </div>
            </el-descriptions-item>
            <el-descriptions-item label="CIDR">
              <div class="flex items-center">
                <span>{{ result.cidr }}</span>
                <el-button 
                  type="text" 
                  size="small" 
                  @click="copyResult(result.cidr)"
                  class="ml-2"
                >
                  复制
                </el-button>
              </div>
            </el-descriptions-item>
          </el-descriptions>
        </div>
        <div>
          <el-descriptions border :column="1" size="small">
            <el-descriptions-item label="可用IP范围">
              <div class="flex items-center">
                <span>{{ result.ipRange }}</span>
                <el-button 
                  type="text" 
                  size="small" 
                  @click="copyResult(result.ipRange)"
                  class="ml-2"
                >
                  复制
                </el-button>
              </div>
            </el-descriptions-item>
            <el-descriptions-item label="总主机数">
              <span>{{ result.totalHosts }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="可用主机数">
              <span>{{ result.usableHosts }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="通配符掩码">
              <div class="flex items-center">
                <span>{{ result.wildcardMask }}</span>
                <el-button 
                  type="text" 
                  size="small" 
                  @click="copyResult(result.wildcardMask)"
                  class="ml-2"
                >
                  复制
                </el-button>
              </div>
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
    </div>

    <!-- 描述 -->
    <ToolDetail title="描述">
      <el-text>
        子网掩码工具，提供子网掩码转换和子网掩码计算功能。支持CIDR格式和子网掩码格式的输入，可以计算网络地址、广播地址、可用IP范围、主机数量等信息。
      </el-text>
    </ToolDetail>

    <!-- 使用说明 -->
    <ToolDetail title="使用说明">
      <ul class="pl-5 space-y-1 list-disc">
        <li>选择输入类型：CIDR格式或子网掩码格式</li>
        <li>输入IP地址和CIDR（如：192.168.1.1/24）或子网掩码（如：255.255.255.0）</li>
        <li>系统会自动计算并显示子网信息</li>
        <li>可以点击复制按钮复制各结果项</li>
      </ul>
    </ToolDetail>

  </div>
</template>

<style scoped>
/* 可以添加自定义样式 */
</style>