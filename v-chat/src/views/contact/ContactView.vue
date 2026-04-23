<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getFriendListApi } from '@/api/friend';
import { useUserStore } from '@/stores/user';

const router = useRouter();
const userStore = useUserStore();

const friends = ref<any[]>([]);
const loading = ref(false);

const fetchFriends = async () => {
    if (!userStore.user?.id) return;
    loading.value = true;
    try {
        const res = await getFriendListApi(userStore.user.id);
        friends.value = res || [];
    } catch (err) {
        console.error('Failed to fetch friends', err);
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    fetchFriends();
    if (userStore.sessions.length === 0) {
        userStore.fetchSessions();
    }
    userStore.fetchPendingCount();
});

const getAvatarColor = (id: number) => {
    const colors = ['#5fb1e5', '#7ed321', '#f5a623', '#bd10e0', '#f8e71c'];
    return colors[id % colors.length];
};
</script>

<template>
    <div class="min-h-screen bg-[#f7f7f7] pb-20">
        <!-- 顶部导航 -->
        <van-nav-bar title="通讯录" fixed placeholder border>
            <template #right>
                <van-icon name="user-add-o" size="22" class="text-gray-800" @click="router.push('/contact/search')" />
            </template>
        </van-nav-bar>

        <!-- 搜索框区域 -->
        <div class="bg-[#f7f7f7] px-4 py-2">
            <div class="bg-white rounded-md flex items-center justify-center py-2 space-x-2 text-gray-400 text-sm" @click="router.push('/contact/search')">
                <van-icon name="search" />
                <span>搜索</span>
            </div>
        </div>

        <!-- 功能菜单 -->
        <van-cell-group inset class="m-0! mb-2">
            <van-cell is-link @click="router.push('/contact/pending')">
                <template #icon>
                    <div class="w-9 h-9 bg-[#fa9d3b] rounded flex items-center justify-center mr-3">
                        <van-icon name="friends-o" color="white" size="20" />
                    </div>
                </template>
                <template #title>
                    <div class="flex items-center">
                        <span class="mr-2">新的朋友</span>
                        <van-badge :content="userStore.pendingFriendCount" v-if="userStore.pendingFriendCount > 0" />
                    </div>
                </template>
            </van-cell>
            <van-cell title="仅聊天的朋友" is-link>
                <template #icon>
                    <div class="w-9 h-9 bg-[#2ba245] rounded flex items-center justify-center mr-3">
                        <van-icon name="chat-o" color="white" size="20" />
                    </div>
                </template>
            </van-cell>
            <van-cell title="群聊" is-link>
                <template #icon>
                    <div class="w-9 h-9 bg-[#4a90e2] rounded flex items-center justify-center mr-3">
                        <van-icon name="cluster-o" color="white" size="20" />
                    </div>
                </template>
            </van-cell>
            <van-cell title="标签" is-link>
                <template #icon>
                    <div class="w-9 h-9 bg-[#576b95] rounded flex items-center justify-center mr-3">
                        <van-icon name="label-o" color="white" size="20" />
                    </div>
                </template>
            </van-cell>
            <van-cell title="公众号" is-link>
                <template #icon>
                    <div class="w-9 h-9 bg-[#07c160] rounded flex items-center justify-center mr-3">
                        <van-icon name="service-o" color="white" size="20" />
                    </div>
                </template>
            </van-cell>
        </van-cell-group>

        <!-- 好友列表 -->
        <div class="px-4 py-2 text-xs text-gray-500 bg-[#f7f7f7]">我的好友</div>
        <van-cell-group inset class="m-0!">
            <div v-if="friends.length === 0 && !loading" class="py-10 text-center text-gray-400 text-sm bg-white">
                暂无好友，去搜索添加吧
            </div>
            <van-cell v-for="friend in friends" :key="friend.id" :title="friend.username" is-link center class="py-3" @click="router.push(`/chat/${friend.id}`)">
                <template #icon>
                    <div :class="[getAvatarColor(friend.id), 'w-10 h-10 rounded flex items-center justify-center text-white font-bold mr-3 scale-95']" :style="{ backgroundColor: getAvatarColor(friend.id) }">
                        {{ friend.username.charAt(0).toUpperCase() }}
                    </div>
                </template>
            </van-cell>
        </van-cell-group>

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
:deep(.van-nav-bar) {
    background-color: #f7f7f7;
}

:deep(.van-nav-bar__title) {
    font-weight: 500;
}

:deep(.van-cell:after) {
    left: 48px;
}
</style>
