<template>
  <div class="flex flex-col mt-3 flex-1">
    <DetailHeader :title="info.title"></DetailHeader>

    <div class="p-4 rounded-2xl bg-white">
      <div class="mb-3">
        <el-text type="info">支持M3U8直播/点播流在线播放与下载，适用于各类公开流媒体资源。</el-text>
      </div>
      <div class="input-row">
        <el-input v-model="videoUrl" placeholder="请输入M3U8视频地址"></el-input>
      </div>

      <div class="mt-4">
        <el-button type="primary" @click="loadVideo">加载视频</el-button>
        <el-button type="primary" @click="fillDemo">示例地址</el-button>
      </div>

      <div v-if="errorMsg" class="mt-3">
        <el-alert type="error" :message="errorMsg" show-icon :closable="false" />
      </div>

      <div class="mt-3 player-area">
        <VideoPlayer :source="currentVideo" showDownload />
      </div>
    </div>

    <!-- desc -->
    <ToolDetail title="使用说明">
      <el-text>
        <ul>
          <li>支持绝大多数公开M3U8流，部分加密或防盗链资源可能无法播放。</li>
          <li>如遇无法播放，请检查地址是否有效，或尝试更换浏览器。</li>
        </ul>
      </el-text>
    </ToolDetail>
  </div>
</template>
 
 <script setup lang="ts">
import { ref, reactive } from 'vue';
import DetailHeader from '@/components/Layout/DetailHeader/DetailHeader.vue';
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue';
import VideoPlayer from '@/components/VideoPlayer.vue';
import type { VideoSource } from '@/types/video';

const info = reactive({
  title: "🎬 视频播放与下载",
});

const videoUrl = ref('');
const errorMsg = ref('');
const currentVideo = ref<VideoSource>({
  id: '1',
  name: '测试视频',
  url: '',
});

const loadVideo = () => {
  errorMsg.value = '';
  currentVideo.value = {
    id: Date.now().toString(),
    name: `视频-${Date.now()}`,
    url: videoUrl.value,
  };
};

const fillDemo = () => {
  videoUrl.value = 'https://upyun.luckly-mjw.cn/Assets/media-source/example/media/index.m3u8';
};
</script>
 
 <style lang="less" scoped>
.input-row {
  display: flex;
  gap: 10px;
  margin-bottom: 18px;
}

.player-area {
  display: flex;
  justify-content: center;
}

.el-alert {
  margin-bottom: 0;
}

ul {
  padding-left: 20px;
  margin: 0;
  line-height: 1.7;
}
</style>