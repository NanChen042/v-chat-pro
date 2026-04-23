<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { getSessionsApi } from '@/api/chat';
import { useSocket } from '@/utils/socket';

const router = useRouter();
const userStore = useUserStore();
const { on } = useSocket();

const showPopover = ref(false);
const loading = ref(false);
const actions = [
  { text: '发起群聊', icon: 'chat-o' },
  { text: '添加朋友', icon: 'user-add-o' },
  { text: '扫一扫', icon: 'scan' },
  { text: '收付款', icon: 'paid' },
];

const onSelect = (action: any) => {
  if (action.text === '添加朋友') {
    router.push('/contact/search');
  }
};

onMounted(() => {
  // 初始加载由 App.vue 统一触发，此处仅确保进入时数据存在
  if (userStore.sessions.length === 0) {
    userStore.fetchSessions();
  }
  userStore.fetchPendingCount();
});

const getAvatarColor = (id: number) => {
  const colors = ['#5fb1e5', '#7ed321', '#f5a623', '#bd10e0', '#f8e71c'];
  return colors[id % colors.length];
};

const formatTime = (time: string) => {
  if (!time) return '';
  const date = new Date(time);
  const now = new Date();
  if (date.toDateString() === now.toDateString()) {
    return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
  }
  return `${date.getMonth() + 1}/${date.getDate()}`;
};
</script>

<template>
  <div class="flex flex-col h-screen bg-[#f7f7f7]">
    <!-- 顶部导航栏 -->
    <van-nav-bar fixed placeholder title="VChat" class="wechat-nav">
      <template #right>
        <div class="flex gap-4">
          <van-icon name="search" size="20" class="text-black" />
          <van-popover v-model:show="showPopover" placement="bottom-end" theme="dark" :actions="actions" @select="onSelect">
            <template #reference>
              <van-icon name="add-o" size="20" class="text-black" />
            </template>
          </van-popover>
        </div>
      </template>
    </van-nav-bar>

    <!-- 搜索栏占位 -->
    <div class="px-3 py-2 bg-[#f7f7f7]">
      <div class="bg-white rounded-md p-1.5 flex items-center justify-center gap-1 text-gray-400 text-sm">
        <van-icon name="search" />
        <span>搜索</span>
      </div>
    </div>

    <!-- 消息列表 -->
    <div class="flex-1 overflow-y-auto">
      <van-pull-refresh v-model="loading" @refresh="userStore.fetchSessions">
        <div v-if="userStore.sessions.length === 0 && !loading" class="py-20 text-center text-gray-400 text-sm">
          暂无聊天消息
        </div>
        <div v-for="item in userStore.sessions" :key="item.user.id" class="flex items-center gap-3 px-4 py-3 bg-white active:bg-gray-100 border-b-[0.5px] border-gray-100 last:border-0 cursor-pointer" @click="router.push(`/chat/${item.user.id}`)">
          <!-- 头像 -->
          <div class="relative flex-shrink-0">
            <div class="w-12 h-12 rounded-md overflow-hidden flex items-center justify-center font-bold text-white text-xl shadow-sm" :style="{ backgroundColor: getAvatarColor(item.user.id) }">
              {{ item.user.username[0].toUpperCase() }}
            </div>
            <!-- 未读红点 -->
            <div v-if="item.unreadCount > 0" class="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 bg-[#fa5151] rounded-full flex items-center justify-center text-white text-[11px] border-[1.5px] border-white font-medium">
              {{ item.unreadCount > 99 ? '...' : item.unreadCount }}
            </div>
          </div>

          <!-- 文字内容 -->
          <div class="flex-1 min-w-0">
            <div class="flex justify-between items-center mb-0.5">
              <span class="text-[17px] font-medium text-black truncate">{{ item.user.username }}</span>
              <span class="text-[11px] text-gray-400">{{ formatTime(item.updatedAt) }}</span>
            </div>
            <div class="text-[14px] text-gray-400 truncate">
              {{ item.lastMessage }}
            </div>
          </div>
        </div>
      </van-pull-refresh>
    </div>

    <!-- 底部导航 -->
    <van-tabbar route active-color="#07c160" inactive-color="#000" fixed placeholder border>
      <van-tabbar-item to="/" icon="chat-o" :badge="userStore.totalUnreadCount || ''">VChat</van-tabbar-item>
      <van-tabbar-item to="/contact" icon="friends-o" :badge="userStore.pendingFriendCount || ''">通讯录</van-tabbar-item>
      <van-tabbar-item icon="browsing-history-o">发现</van-tabbar-item>
      <van-tabbar-item to="/me" icon="user-o">我</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<style scoped>
.wechat-nav :deep(.van-nav-bar__title) {
  font-weight: 500;
  font-size: 17px;
}

.wechat-nav :deep(.van-nav-bar__content) {
  background-color: #f7f7f7;
}

:deep(.van-pull-refresh) {
  min-height: calc(100vh - 150px);
}
</style>
