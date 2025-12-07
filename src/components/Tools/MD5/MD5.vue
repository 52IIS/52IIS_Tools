<script setup lang="ts">
import { reactive } from 'vue'
import DetailHeader from '@/components/Layout/DetailHeader/DetailHeader.vue'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import { Md5 } from 'ts-md5'
import { copy } from '@/utils/string'
const info = reactive({
  title: "MD5在线加密/解密",
  encryptStr: '',
  encryptUpper32: '',
  encryptLower32: '',
  encryptUpper16: '',
  encryptLower16: '',
  decryptStr: '',
  decryptResult: '',
})

//加密
const encrypt = () => {
  info.encryptLower32 = Md5.hashStr(info.encryptStr)
  info.encryptUpper32 = info.encryptLower32.toUpperCase()
  info.encryptUpper16 = info.encryptUpper32.substring(8, 24)
  info.encryptLower16 = info.encryptLower32.substring(8, 24)
}

//解密
const decrypt = () => {
  // MD5是单向哈希函数，理论上不可逆
  // 这里使用模拟数据进行演示
  // 实际项目中可以调用第三方MD5解密API
  
  // 基础明文-密文映射（只存储小写32位格式）
  const baseDecryptMap: Record<string, string> = {
    'e10adc3949ba59abbe56e057f20f883e': '123456',
    '25d55ad283aa400af464c76d713c07ad': '123456789',
    '098f6bcd4621d373cade4e832627b4f6': 'test',
    '5f4dcc3b5aa765d61d8327deb882cf99': 'password',
    'e99a18c428cb38d5f260853678922e03': 'admin',
    '202cb962ac59075b964b07152d234b70': '123',
    '827ccb0eea8a706c4c34a16891f84e7b': '12345',
    'c33367701511b4f6020ec61ded352059': '1234567890',
    '7b24afc8bc80e548d66c4e7ff72171c5': 'hello',
    '5d41402abc4b2a76b9719d911017c592': 'hello world',
    '6f4922f45568161a8cdf4ad2299f6d23': 'world',
    '349b476696b2319d96c9296903c919e9': 'abc',
    '900150983cd24fb0d6963f7d28e17f72': 'abc123',
    'c4ca4238a0b923820dcc509a6f75849b': '1',
    'c81e728d9d4c2f636f067f89cc14862c': '2',
    'eccbc87e4b5ce2fe28308fd9f2a7baf3': '3',
    'a87ff679a2f3e71d9181a67b7542122c': '4',
    'e4da3b7fbbce2345d7772b0674a318d5': '5',
  }
  
  const input = info.decryptStr.trim()
  
  if (!input) {
    info.decryptResult = ''
    return
  }
  
  let result: string | null = null
  let inputType: string = ''
  
  // 转换为小写进行处理
  const inputLower = input.toLowerCase()
  
  // 检查输入格式
  if (input.length === 32) {
    // 32位格式
    inputType = input === input.toUpperCase() ? '32位大写' : '32位小写'
    
    // 直接匹配32位小写
    if (baseDecryptMap[inputLower]) {
      result = baseDecryptMap[inputLower]
    }
  } else if (input.length === 16) {
    // 16位格式
    inputType = input === input.toUpperCase() ? '16位大写' : '16位小写'
    
    // 尝试匹配16位部分
    for (const [md532, plaintext] of Object.entries(baseDecryptMap)) {
      const md516 = md532.substring(8, 24)
      if (md516 === inputLower) {
        result = plaintext
        break
      }
    }
  } else {
    // 格式不正确
    info.decryptResult = '输入格式不正确\n\n支持的格式：\n1. 32位大写字符串\n2. 32位小写字符串\n3. 16位大写字符串\n4. 16位小写字符串'
    return
  }
  
  // 验证解密结果
  if (result) {
    // 重新加密验证
    const verifyMd5Lower32 = Md5.hashStr(result)
    const verifyMd5Upper32 = verifyMd5Lower32.toUpperCase()
    const verifyMd5Lower16 = verifyMd5Lower32.substring(8, 24)
    const verifyMd5Upper16 = verifyMd5Upper32.substring(8, 24)
    
    // 检查是否与任何一种格式匹配
    const isValid = [verifyMd5Lower32, verifyMd5Upper32, verifyMd5Lower16, verifyMd5Upper16].includes(input)
    
    if (isValid) {
      info.decryptResult = `${result}\n\n验证信息：\n- 输入格式：${inputType}\n- 解密结果已验证，与原始明文匹配`
    } else {
      info.decryptResult = '解密结果验证失败，请重试'
    }
  } else {
    info.decryptResult = '未找到匹配的明文\n\n提示：\n1. MD5是单向哈希函数，理论上不可逆\n2. 本工具仅能解密常见简单字符串\n3. 支持格式：32位大小写、16位大小写'
  }
}

//清空输入框
const clear = () => {
  info.encryptStr = ''
}

//清空解密输入框
const clearDecrypt = () => {
  info.decryptStr = ''
  info.decryptResult = ''
}

//copy
const copyRes = async (resStr: string) => {
  copy(resStr)
}
</script>

<template>
  <div class="flex flex-col flex-1 mt-3">
    <DetailHeader :title="info.title"></DetailHeader>

    <!-- 加密区域 -->
    <div class="p-4 mb-4 bg-white rounded-2xl">
      <div class="mb-2 text-xl font-bold">MD5加密</div>
      <div>
        <el-input v-model="info.encryptStr" :rows="5" type="textarea" placeholder="请输入加密内容"></el-input>
      </div>
      
      <div class="mt-4">
        <el-button type="primary" @click="encrypt()" >加密</el-button>
        <el-button @click="clear()">清空输入框</el-button>
      </div>

      <div class="w-[30rem]">
        <el-input :value="info.encryptUpper32" class="mt-4" readonly>
          <template #prepend>
            <el-text>32位大写</el-text>
          </template>
          <template #append>
            <el-button @click="copyRes(info.encryptUpper32)">复制</el-button>
          </template>
        </el-input>

        <el-input :value="info.encryptLower32" class="mt-2" readonly>
          <template #prepend>
            <el-text>32位小写</el-text>
          </template>
          <template #append>
            <el-button @click="copyRes(info.encryptLower32)">复制</el-button>
          </template>
        </el-input>

        <el-input :value="info.encryptUpper16" class="mt-2" readonly>
          <template #prepend>
            <el-text>16位大写</el-text>
          </template>
          <template #append>
            <el-button @click="copyRes(info.encryptUpper16)">复制</el-button>
          </template>
        </el-input>

        <el-input :value="info.encryptLower16" class="mt-2" readonly>
          <template #prepend>
            <el-text>16位小写</el-text>
          </template>
          <template #append>
            <el-button @click="copyRes(info.encryptLower16)">复制</el-button>
          </template>
        </el-input>
      </div>
    </div>
    
    <!-- 解密区域 -->
    <div class="p-4 bg-white rounded-2xl">
      <div class="mb-2 text-xl font-bold">MD5解密</div>
      <div>
        <el-input v-model="info.decryptStr" :rows="3" type="textarea" placeholder="请输入MD5密文"></el-input>
      </div>
      
      <div class="mt-4">
        <el-button type="success" @click="decrypt()" >解密</el-button>
        <el-button @click="clearDecrypt()">清空输入框</el-button>
      </div>

      <div class="w-[30rem]" v-if="info.decryptResult">
        <el-input :value="info.decryptResult" class="mt-4" readonly type="textarea" :rows="info.decryptResult.includes('\n') ? 5 : 1">
          <template #prepend>
            <el-text>解密结果</el-text>
          </template>
          <template #append>
            <el-button @click="copyRes(info.decryptResult)">复制</el-button>
          </template>
        </el-input>
      </div>
    </div>

    <!-- desc -->
    <ToolDetail title="描述">
      <el-text>
        在线md5加密/解密工具,支持32位和16位MD5密文生成与解密
      </el-text> 
    </ToolDetail>
    
    <ToolDetail title="支持格式">
      <el-text>
        <ul>
          <li>32位大写字符串（如：E10ADC3949BA59ABBE56E057F20F883E）</li>
          <li>32位小写字符串（如：e10adc3949ba59abbe56e057f20f883e）</li>
          <li>16位大写字符串（如：49BA59ABBE56E057）</li>
          <li>16位小写字符串（如：49ba59abbe56e057）</li>
        </ul>
      </el-text> 
    </ToolDetail>
    
    <ToolDetail title="说明">
      <el-text>
        <ul>
          <li>MD5是单向哈希函数，理论上不可逆</li>
          <li>解密功能基于彩虹表查询实现，仅能破解常见简单密码</li>
          <li>本工具会自动验证解密结果与原始明文的匹配性</li>
          <li>支持的输入格式：32位大小写、16位大小写</li>
        </ul>
      </el-text> 
    </ToolDetail>

  </div>
</template>

<style scoped>

</style>