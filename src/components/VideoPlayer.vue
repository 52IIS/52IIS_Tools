<template>
  <div class="video-player">
    <video ref="videoRef" class="video" controls></video>
    <div class="controls-container">
      <!-- 录制控制按钮 -->
      <div class="recording-controls">
        <button 
          v-if="!isRecording" 
          class="record-btn start-record" 
          @click="startRecording"
          title="开始录制"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M10.5 3.5a2.5 2.5 0 0 1 5 0v9a2.5 2.5 0 0 1-5 0v-9z"/>
            <path d="M8 16A8 8 0 1 1 8 0a8 8 0 0 1 0 16zm7-8A7 7 0 1 0 1 8a7 7 0 0 0 14 0z"/>
          </svg>
          开始录制
        </button>
        <button 
          v-else 
          class="record-btn stop-record" 
          @click="stopRecording"
          title="结束录制"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M5.5 3.5A1.5 1.5 0 0 1 7 2h2a1.5 1.5 0 0 1 1.5 1.5v9A1.5 1.5 0 0 1 9 14H7a1.5 1.5 0 0 1-1.5-1.5v-9z"/>
            <path d="M8 16A8 8 0 1 1 8 0a8 8 0 0 1 0 16zm7-8A7 7 0 1 0 1 8a7 7 0 0 0 14 0z"/>
          </svg>
          结束录制
        </button>
        <button 
          v-if="recordedBlob" 
          class="record-btn download-record" 
          @click="downloadRecordedVideo"
          title="下载录制视频"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
            <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
          </svg>
          下载录制
        </button>
      </div>
      
      <!-- 原有的视频下载按钮 -->
      <div v-if="showDownload && currentVideo.url" class="download-container">
        <button class="download-btn" @click="downloadVideo">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
            <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
          </svg>
          下载视频
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import Hls from 'hls.js';
import type { VideoSource } from '@/types/video';

interface Props {
  source: VideoSource;
  showDownload?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showDownload: false
});

const videoRef = ref<HTMLVideoElement | null>(null);
const hls = ref<Hls | null>(null);
const currentVideo = ref<VideoSource>(props.source);

// 录制状态管理
const isRecording = ref(false);
const mediaRecorder = ref<MediaRecorder | null>(null);
const recordedChunks = ref<Blob[]>([]);
const recordedBlob = ref<Blob | null>(null);

// 监听视频源变化
watch(
  () => props.source,
  (newSource) => {
    currentVideo.value = newSource;
    loadVideo(newSource.url);
  },
  { deep: true }
);

// 加载视频
const loadVideo = (url: string) => {
  if (!videoRef.value) return;

  // 销毁之前的Hls实例
  if (hls.value) {
    hls.value.destroy();
    hls.value = null;
  }

  // 重置视频
  videoRef.value.src = '';
  videoRef.value.load();

  if (!url) return;

  // 检查浏览器是否支持HLS
  if (Hls.isSupported()) {
    try {
      hls.value = new Hls();
      hls.value.loadSource(url);
      hls.value.attachMedia(videoRef.value);
      hls.value.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log('视频加载成功');
      });
      hls.value.on(Hls.Events.ERROR, (event, data) => {
        console.error('视频加载错误:', data);
      });
    } catch (error) {
      console.error('创建HLS实例失败:', error);
    }
  } else if (videoRef.value.canPlayType('application/vnd.apple.mpegurl')) {
    // Safari等原生支持HLS的浏览器
    videoRef.value.src = url;
  } else {
    console.error('浏览器不支持HLS视频播放');
  }
};

// 下载视频
const downloadVideo = () => {
  if (!currentVideo.value.url) return;

  const link = document.createElement('a');
  link.href = currentVideo.value.url;
  link.download = `${currentVideo.value.name || 'video'}.m3u8`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// 组件挂载后加载视频
onMounted(() => {
  loadVideo(currentVideo.value.url);
});

// 开始录制
const startRecording = async () => {
  if (!videoRef.value || isRecording.value) return;

  try {
    // 创建MediaStream
    const stream = videoRef.value.captureStream();
    
    // 创建MediaRecorder
    mediaRecorder.value = new MediaRecorder(stream, {
      mimeType: 'video/webm; codecs=vp9'
    });

    // 清空之前的录制数据
    recordedChunks.value = [];
    recordedBlob.value = null;

    // 监听数据可用事件
    mediaRecorder.value.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.value.push(event.data);
      }
    };

    // 开始录制
    mediaRecorder.value.start();
    isRecording.value = true;
    console.log('开始录制');
  } catch (error) {
    console.error('录制失败:', error);
  }
};

// 结束录制
const stopRecording = () => {
  if (!mediaRecorder.value || !isRecording.value) return;

  try {
    // 结束录制
    mediaRecorder.value.stop();
    isRecording.value = false;
    
    // 监听录制结束事件
    mediaRecorder.value.onstop = () => {
      // 创建录制的Blob对象
      recordedBlob.value = new Blob(recordedChunks.value, {
        type: 'video/webm'
      });
      console.log('录制结束');
    };
  } catch (error) {
    console.error('结束录制失败:', error);
  }
};

// 下载录制的视频
const downloadRecordedVideo = () => {
  if (!recordedBlob.value) return;

  const url = URL.createObjectURL(recordedBlob.value);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${currentVideo.value.name || 'recorded'}_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.webm`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// 组件卸载前销毁资源
onBeforeUnmount(() => {
  if (hls.value) {
    hls.value.destroy();
  }
  
  // 确保录制已停止
  if (mediaRecorder.value && isRecording.value) {
    stopRecording();
  }
});
</script>

<style scoped>
.video-player {
  position: relative;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.video {
  width: 100%;
  height: auto;
  border-radius: 8px;
}

.controls-container {
  margin-top: 10px;
}

.recording-controls {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-bottom: 10px;
}

.record-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.start-record {
  background-color: #28a745;
  color: white;
}

.start-record:hover {
  background-color: #218838;
}

.stop-record {
  background-color: #dc3545;
  color: white;
}

.stop-record:hover {
  background-color: #c82333;
}

.download-record {
  background-color: #ffc107;
  color: black;
}

.download-record:hover {
  background-color: #e0a800;
}

.download-container {
  text-align: center;
}

.download-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 8px 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.download-btn:hover {
  background-color: #0056b3;
}
</style>