<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { useSocket } from '@/utils/socket';
import { getChatHistoryApi, markAsReadApi } from '@/api/chat';
import request from '@/utils/request';
import { showFailToast } from 'vant';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const { on, emit } = useSocket();

const targetId = parseInt(route.params.id as string);
const targetUser = ref<any>(null);
const messages = ref<any[]>([]);
const inputText = ref('');
const messageListRef = ref<HTMLElement | null>(null);
const loading = ref(false);

const scrollToBottom = async () => {
    await nextTick();
    if (messageListRef.value) {
        messageListRef.value.scrollTop = messageListRef.value.scrollHeight;
    }
};

const fetchRecipientInfo = async () => {
    try {
        const res = await request({
            url: '/user/info',
            method: 'get',
            params: { id: targetId }
        });
        targetUser.value = res;
    } catch (err) {
        console.error('Failed to fetch recipient info', err);
    }
};

const fetchHistory = async () => {
    if (!userStore.user?.id) return;
    loading.value = true;
    try {
        const res = await getChatHistoryApi(userStore.user.id, targetId);
        messages.value = res || [];
        scrollToBottom();
    } catch (err) {
        console.error('Failed to fetch history', err);
    } finally {
        loading.value = false;
    }
};

const handleSendMessage = () => {
    if (!inputText.value.trim() || !userStore.user?.id) return;

    const msgData = {
        senderId: userStore.user.id,
        receiverId: targetId,
        content: inputText.value.trim(),
    };

    // 通过 WebSocket 发送 (配合后端 ChatGateway 的 @SubscribeMessage('sendMessage'))
    emit('sendMessage', msgData);

    inputText.value = '';
};

// 监听新消息
on('message', (msg: any) => {
    // 只处理与当前聊天目标相关的消息
    if ((msg.senderId === targetId && msg.receiverId === userStore.user?.id) ||
        (msg.senderId === userStore.user?.id && msg.receiverId === targetId)) {
        messages.value.push(msg);
        scrollToBottom();
    }
});

// 监听错误
on('error', (err: any) => {
    showFailToast(err.message || '发送失败');
});

const handleMarkAsRead = async () => {
    if (!userStore.user?.id) return;
    try {
        await markAsReadApi(userStore.user.id, targetId);
        // 成功标记后刷新全局会话状态，以消除徽标
        userStore.fetchSessions();
    } catch (err) {
        console.error('Failed to mark as read', err);
    }
};

onMounted(() => {
    fetchRecipientInfo();
    fetchHistory();
    handleMarkAsRead();
});

const getAvatarColor = (id: number) => {
    const colors = ['#5fb1e5', '#7ed321', '#f5a623', '#bd10e0', '#f8e71c'];
    return colors[id % colors.length];
};
</script>

<template>
    <div class="flex flex-col h-screen bg-[#f7f7f7]">
        <!-- 顶部导航 -->
        <van-nav-bar fixed placeholder left-arrow @click-left="router.back()" class="chat-nav">
            <template #title>
                <span class="font-medium text-[17px]">{{ targetUser?.username || '正在连接...' }}</span>
            </template>
            <template #right>
                <van-icon name="ellipsis" size="20" color="#000" />
            </template>
        </van-nav-bar>

        <!-- 聊天区域 -->
        <div ref="messageListRef" class="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-10">
            <div v-if="loading && messages.length === 0" class="flex justify-center py-10">
                <van-loading size="24px" />
            </div>

            <div v-for="(msg, index) in messages" :key="index" :class="['flex', msg.senderId === userStore.user?.id ? 'justify-end' : 'justify-start']">
                <!-- 对方头像 -->
                <div v-if="msg.senderId !== userStore.user?.id" :style="{ backgroundColor: getAvatarColor(msg.senderId) }" class="w-10 h-10 rounded-md flex items-center justify-center text-white font-bold mr-2 flex-shrink-0">
                    {{ targetUser?.username?.charAt(0).toUpperCase() || '?' }}
                </div>

                <!-- 消息气泡 -->
                <div :class="['max-w-[70%] px-3 py-2.5 rounded-lg text-[15px] break-words shadow-sm',
                    msg.senderId === userStore.user?.id ? 'bg-[#95ec69] text-black relative bubble-right' : 'bg-white text-black relative bubble-left']">
                    {{ msg.content }}
                </div>

                <!-- 自己头像 -->
                <div v-if="msg.senderId === userStore.user?.id" :style="{ backgroundColor: getAvatarColor(msg.senderId) }" class="w-10 h-10 rounded-md flex items-center justify-center text-white font-bold ml-2 flex-shrink-0">
                    {{ userStore.user?.username?.charAt(0).toUpperCase() }}
                </div>
            </div>
        </div>

        <!-- 底部输入框 -->
        <div class="bg-[#f7f7f7] border-t border-gray-200 px-3 py-2 flex items-end space-x-2 safe-area-bottom">
            <van-icon name="audio" size="26" class="mb-1 text-gray-700" />
            <div class="flex-1 bg-white rounded min-h-[36px] max-h-[100px] overflow-y-auto px-2 py-1.5 border border-gray-100">
                <textarea v-model="inputText" class="w-full bg-transparent border-none outline-none resize-none text-[15px] leading-5" rows="1" @keyup.enter="handleSendMessage"></textarea>
            </div>
            <van-icon name="smile-o" size="26" class="mb-1 text-gray-700" />
            <van-icon v-if="!inputText" name="add-o" size="26" class="mb-1 text-gray-700" />
            <van-button v-else size="small" type="primary" color="#07c160" class="mb-1 px-4" @click="handleSendMessage">发送</van-button>
        </div>
    </div>
</template>

<style scoped>
.chat-nav :deep(.van-nav-bar__content) {
    background-color: #f7f7f7;
}

.bubble-left::before {
    content: '';
    position: absolute;
    top: 14px;
    left: -6px;
    width: 0;
    height: 0;
    border-top: 6px solid transparent;
    border-bottom: 6px solid transparent;
    border-right: 6px solid white;
}

.bubble-right::before {
    content: '';
    position: absolute;
    top: 14px;
    right: -6px;
    width: 0;
    height: 0;
    border-top: 6px solid transparent;
    border-bottom: 6px solid transparent;
    border-left: 6px solid #95ec69;
}

.safe-area-bottom {
    padding-bottom: calc(0.5rem + env(safe-area-inset-bottom));
}
</style>
