<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

const goHome = () => {
    router.replace('/');
};
</script>

<template>
    <div class="min-h-screen bg-[#f7f7f7] flex flex-col items-center justify-center px-6 text-center">
        <van-icon name="warning-o" size="80" color="#ccc" class="mb-6" />
        <h2 class="text-xl font-medium text-gray-700 mb-2">页面找不到了</h2>
        <p class="text-gray-400 mb-8 text-sm">该页面可能已被移动、删除或暂时不可用</p>

        <van-button type="primary" color="#07c160" round block class="max-w-[200px]" @click="goHome">
            返回首页
        </van-button>
    </div>
</template>
