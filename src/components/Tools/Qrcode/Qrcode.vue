<script setup lang="ts">
import { reactive,ref } from 'vue'
import DetailHeader from '@/components/Layout/DetailHeader/DetailHeader.vue'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import QRCodeVue3 from 'qrcode-vue3'
import { Delete, Download, Plus } from '@element-plus/icons-vue'
import { ElMessage, type UploadFile } from 'element-plus'
const info = reactive({
  title: "二维码生成",
  content: 'www.52iis.com',
  width: 200,
  height: 200,
  size: '200',
  sizeSelect: '',
  margin: 1,
  fileList: <string[]>[],
  fileUrl: '',
  preColor: '#000',
  bgColor: '#fff',
  qrKey: 1,
  errorCorrectionLevel: 'Q',
})

const uploadLogo = ref()
const qrCodeRef = ref()

//上传达到上限触发
const handleExceed = () => {
  ElMessage({
    message: '上传数量已达上限，请清除后重新上传',
    type: 'warning',
  })
}

//设置尺寸
const setQRSize = () => {
  info.width = parseInt(info.size)
  info.height = parseInt(info.size)
}

const handleChange = (file: UploadFile) => {
  info.fileList.push(file.url as string)
  info.fileUrl = info.fileList[0] ?? ''
}

const handleRemove = (file: UploadFile) => {
  info.fileList = uploadLogo.value.handleRemove(file)
}


//生成二维码
const gen = () => {
  //设置尺寸
  setQRSize()
  info.qrKey += 1
}

//下载二维码
const downloadQRCode = () => {
  if (!qrCodeRef.value) return
  
  try {
    // 获取二维码图像数据
    const imgElement = qrCodeRef.value.$el.querySelector('img')
    if (!imgElement) {
      ElMessage.error('无法获取二维码图像')
      return
    }
    
    // 创建下载链接
    const link = document.createElement('a')
    link.href = imgElement.src
    link.download = `qrcode-${Date.now()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    ElMessage.success('二维码下载成功')
  } catch (error) {
    console.error('下载二维码失败:', error)
    ElMessage.error('二维码下载失败')
  }
}
</script>

<template>
  <div class="flex flex-col flex-1 mt-3 mr-3 ml-4">
    <DetailHeader :title="info.title"></DetailHeader>

    <div class="flex justify-between p-4 w-full bg-white rounded-2xl">
      <div class="w-4/6">
        <div class="flex mb-3">
          <div class="mr-2 w-16"><el-text>内容</el-text></div>
          <el-input v-model="info.content" type="textarea" rows="3" class="w-full" placeholder="可在此输入文字或网址"></el-input>
        </div>
        <div class="flex mb-3">
          <div class="mr-2 w-16"><el-text>尺寸</el-text></div>
          <el-input v-model="info.size" class="">
            <template #append>
                <el-select v-model="info.size" class="size-select">
                  <el-option label="常规 200px" value="200" />
                  <el-option label="常规 300px" value="300" />
                  <el-option label="适中 350px" value="350" />
                  <el-option label="较大 500px" value="500" />
                  <!-- 分割线 start -->
                  <div class="flex justify-center w-full bg-gray-200">
                    <div class="h-[1px] bg-gray-200 w-4/5"></div>
                  </div>
                  <!-- 分割线 end -->
                  <el-option label="超大 1000px" value="1000" />
                  <el-option label="超大 1200px" value="1200" />
                </el-select>
            </template>
          </el-input>
        </div>
        <div class="flex mb-3">
          <div class="w-16">
            <el-text>纠错级别</el-text>
          </div>
          <el-select v-model="info.errorCorrectionLevel" class="corr-select">
            <el-option label="L 可遮挡 7%" value="L" />
            <el-option label="M 可遮挡 15%" value="M" />
            <el-option label="Q 可遮挡 25%" value="Q" />
            <el-option label="H 可遮挡 30%" value="H" />
          </el-select>
        </div>
        <div class="flex mb-3">
          <div class="w-16"><el-text>边距</el-text></div>
          <el-input-number v-model="info.margin" :step="1" :min="0"/>
        </div>
        <div class="flex mb-3">
          <div class="w-16"><el-text>颜色</el-text></div>
          <!-- <div class="flex flex-col items-center p-1 mr-2 w-16 bg-gray-100 rounded-md">
            <el-text>前景色</el-text>
            <el-color-picker v-model="info.preColor" />
          </div> -->
          <div class="flex flex-col items-center p-1 w-16 bg-gray-100 rounded-md">
            <el-text>背景色</el-text>
            <el-color-picker v-model="info.bgColor" />
          </div>
        </div>
        <div class="flex mb-3">
          <div class="w-16"><el-text>logo</el-text></div>
          <el-upload 
            ref="uploadLogo"
            action="#" 
            :auto-upload="false" 
            :limit="1" 
            list-type="picture-card" 
            accept=".png,.ico,.jpg,.jpeg"
            :on-change="handleChange"
            :on-exceed="handleExceed">
            <el-icon><Plus /></el-icon>
            <template #file="{ file }">
              <div class="w-full border-2 border-blue-400">
                <img class="el-upload-list__item-thumbnail" :src="file.url" alt="" />
                <span class="el-upload-list__item-actions">
                  <span
                    class="el-upload-list__item-delete"
                    @click="handleRemove(file)"
                  >
                    <el-icon><Delete /></el-icon>
                  </span>
                </span>
              </div>
            </template>
          </el-upload>
        </div>
        <div class="flex gap-3 mb-3">
          <div class="w-16"></div>
          <el-button type="primary" @click="gen">生成二维码</el-button>
          <el-button type="default" @click="downloadQRCode">
            <el-icon><Download /></el-icon>
            下载二维码
          </el-button>
        </div>
      </div>
      <div class="w-[200px] h-[200px]">
        <QRCodeVue3
          ref="qrCodeRef"
          :key="info.qrKey"
          :width="info.width"
          :height="info.height"
          :value="info.content"
          :margin="info.margin"
          :qrOptions="{ typeNumber: 0, errorCorrectionLevel: info.errorCorrectionLevel }"
          :imageOptions="{ hideBackgroundDots: true, imageSize: 0.4, margin: 0 }"
          :image="info.fileList[0]"
          :dotsOptions="{
            type: 'square',
            color: '#000000'
          }"
          :backgroundOptions="{ color: info.bgColor }"
          :cornersSquareOptions="{ type: 'square', color: '#000000' }"
          :cornersDotOptions="{ type: 'square', color: '#000000' }"
          fileExt="png"
          myclass="my-qur"
          imgclass="img-qr"
        />
      </div>
    </div>

    <!-- desc -->
    <ToolDetail title="描述">
      <el-text>
        根据内容生成二维码，自定义尺寸，纠错级别，颜色等带logo二维码
      </el-text> 
    </ToolDetail>

  </div>
</template>

<style scoped>
.my-button{
  background-color:red;
}
.size-select{
  @apply w-36
}
.corr-select{
  @apply w-36
}
</style>