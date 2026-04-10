<template>
  <div class="relative p-6">
    <!-- github 角标 -->
    <!-- <github-corner class="absolute top-0 right-0 z-1 border-0" /> -->

    <el-card shadow="never" class="mt-2">
      <div class="flex flex-wrap">
        <!-- 左侧问候语区域 -->
        <div class="flex-1 flex items-start">
          <div style="width: 80px; height: 80px; overflow: hidden; border-radius: 50%">
            <img :src="userStore.userInfo.cover + '?imageView2/1/w/80/h/80'" class="w80px h80px rounded-full"
              style="width: 100%; height: 100%; object-fit: cover; object-position: center" />
          </div>
          <div class="ml-5">
            <p class="text-base font-semibold text-[--el-text-color-primary] leading-tight">
              {{ greetings }}
            </p>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: "Dashboard",
  inheritAttrs: false,
});

import { useUserStore } from "@/store/modules/user";



const userStore = useUserStore();

// 当前时间（用于计算问候语）
const currentDate = new Date();

// 问候语：根据当前小时返回不同问候语
const greetings = computed(() => {
  const hours = currentDate.getHours();
  const nickname = userStore.userInfo.nickname;
  if (hours >= 6 && hours < 8) {
    return "晨起披衣出草堂，轩窗已自喜微凉🌅！";
  } else if (hours >= 8 && hours < 12) {
    return `上午好，${nickname}！`;
  } else if (hours >= 12 && hours < 18) {
    return `下午好，${nickname}！`;
  } else if (hours >= 18 && hours < 24) {
    return `晚上好，${nickname}！`;
  } else {
    return "偷偷向银河要了一把碎星，只等你闭上眼睛撒入你的梦中，晚安🌛！";
  }
});

// 组件挂载后加载访客统计数据和通知公告数据
onMounted(() => {
});
</script>

<style lang="scss" scoped>
// 暂无自定义样式</style>
