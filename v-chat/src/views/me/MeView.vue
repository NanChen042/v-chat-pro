<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';

import { onMounted } from 'vue';

const router = useRouter();
const userStore = useUserStore();

onMounted(() => {
    if (userStore.sessions.length === 0) {
        userStore.fetchSessions();
    }
    userStore.fetchPendingCount();
});

const handleLogout = () => {
    showConfirmDialog({
        title: '提示',
        message: '确定要退出当前账号吗？',
        confirmButtonText: '退出',
        cancelButtonText: '取消',
        confirmButtonColor: '#ee0a24'
    }).then(() => {
        userStore.logout();
        showSuccessToast('已安全退出');
        router.push('/auth/login');
    }).catch(() => {
        // 用户点击取消，不执行任何操作
    });
};

const getAvatarColor = (id: number) => {
    const colors = ['bg-orange-400', 'bg-blue-400', 'bg-green-400', 'bg-purple-400', 'bg-pink-400'];
    return colors[id % colors.length];
};
</script>

<template>
    <div class="min-h-screen bg-[#f7f7f7] pb-20">
        <!-- 个人信息头部 -->
        <div class="bg-white px-6 pt-16 pb-8 flex items-center mb-6">
            <div :class="[getAvatarColor(userStore.userInfo?.id || 0), 'w-16 h-16 rounded-lg flex items-center justify-center text-white text-2xl font-bold mr-4 shadow-sm']">
                {{ userStore.userInfo?.username.charAt(0).toUpperCase() }}
            </div>
            <div class="flex-1">
                <div class="text-xl font-semibold text-gray-900">{{ userStore.userInfo?.username }}</div>
                <div class="text-sm text-gray-400 mt-1">VChat号：{{ userStore.userInfo?.username }}</div>
            </div>
        </div>

        <div class="mt-8 px-4">
            <van-button block round type="default" @click="handleLogout" class="text-red-500 font-medium">
                退出登录
            </van-button>
        </div>

        <!-- 底部导航 -->
        <van-tabbar route active-color="#07c160" inactive-color="#000">
            <van-tabbar-item to="/" icon="chat-o" :badge="userStore.totalUnreadCount || ''">VChat</van-tabbar-item>
            <van-tabbar-item to="/contact" icon="friends-o" :badge="userStore.pendingFriendCount || ''">通讯录</van-tabbar-item>
            <van-tabbar-item icon="guide-o">发现</van-tabbar-item>
            <van-tabbar-item to="/me" icon="user-o">我</van-tabbar-item>
        </van-tabbar>
    </div>
</template>

<style scoped>
:deep(.van-cell__left-icon) {
    font-size: 20px;
    margin-right: 12px;
}
</style>
