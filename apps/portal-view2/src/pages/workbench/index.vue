<template>
    <div class="p-4">
      <div class="mb-4">
        <van-button type="primary" @click="startCamera">打开摄像头</van-button>
      </div>
  
      <!-- 摄像头预览区域 -->
      <div v-show="showCamera" class="mb-4">
        <video ref="videoRef" autoplay class="w-full max-w-[640px]"></video>
        <div class="mt-2">
          <van-button type="primary" @click="takePhoto">拍照</van-button>
        </div>
      </div>
  
      <!-- 照片显示区域 -->
      <div v-if="photoUrl" class="mt-4">
        <img :src="photoUrl" alt="captured" class="w-full max-w-[640px]" />
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue'
  
  const videoRef = ref<HTMLVideoElement>()
  const showCamera = ref(false)
  const photoUrl = ref('')
  let stream: MediaStream | null = null
  
  const startCamera = async () => {
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      })
      if (videoRef.value) {
        videoRef.value.srcObject = stream
        showCamera.value = true
      }
    }
    catch (error) {
      console.error('摄像头启动失败:', error)
    }
  }
  
  const takePhoto = () => {
    if (!videoRef.value)
      return
  
    const canvas = document.createElement('canvas')
    canvas.width = videoRef.value.videoWidth
    canvas.height = videoRef.value.videoHeight
    
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.drawImage(videoRef.value, 0, 0)
      photoUrl.value = canvas.toDataURL('image/png')
    }
  
    // 关闭摄像头
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      showCamera.value = false
    }
  }
  </script>
  
  <route lang="json5">
  {
    name: 'workbench',
    meta: {
      title: '工作台',
      i18n: 'menus.workbench'
    }
  }
  </route>