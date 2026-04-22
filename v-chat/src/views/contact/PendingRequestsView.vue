<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getPendingRequestsApi, acceptFriendRequestApi, rejectFriendRequestApi } from '@/api/friend';
import { useUserStore } from '@/stores/user';
import { useSocket } from '@/utils/socket';
import { showSuccessToast } from 'vant';

const router = useRouter();
const userStore = useUserStore();

const requests = ref<any[]>([]);
const loading = ref(false);

const fetchRequests = async () => {
    if (!userStore.user?.id) return;
    loading.value = true;
    try {
        const res = await getPendingRequestsApi(userStore.user.id);
        requests.value = res || [];
    } catch (err) {
        // 拦截器处理
    } finally {
        loading.value = false;
    }
};

const handleAccept = async (requestId: number) => {
    if (!userStore.user?.id) return;
    try {
        await acceptFriendRequestApi({
            userId: userStore.user.id,
            requestId
        });
        showSuccessToast('已添加');

        // 发送第一条打招呼消息
        const { emit } = useSocket();
        emit('sendMessage', {
            senderId: userStore.user.id,
            receiverId: requests.value.find(r => r.id === requestId)?.requesterId,
            content: '我通过了你的朋友验证请求，现在我们可以开始聊天了'
        });

        fetchRequests(); // 刷新列表
        userStore.fetchPendingCount(); // 更新全局徽标
    } catch (err) {
        // 拦截器处理
    }
};

const handleReject = async (requestId: number) => {
    if (!userStore.user?.id) return;
    try {
        await rejectFriendRequestApi({
            userId: userStore.user.id,
            requestId
        });
        showSuccessToast('已拒绝');
        fetchRequests(); // 刷新列表
        userStore.fetchPendingCount(); // 更新全局徽标
    } catch (err) {
        // 拦截器处理
    }
};

onMounted(() => {
    fetchRequests();
    // 进入页面即视为已读，清除红点数字
    userStore.clearPendingCount();
});
</script>

<template>
    <div class="min-h-screen bg-[#f7f7f7]">
        <van-nav-bar title="新的朋友" left-arrow @click-left="router.back()" fixed placeholder border />

        <div class="mt-2">
            <div v-if="loading" class="p-10 text-center">
                <van-loading size="24px" />
            </div>

            <div v-if="requests.length > 0" class="bg-white">
                <van-cell v-for="req in requests" :key="req.id" center class="py-3">
                    <template #title>
                        <div class="font-medium text-gray-800">{{ req.requester.username }}</div>
                        <div class="text-xs text-gray-400">申请加你为好友</div>
                    </template>
                    <template #icon>
                        <div class="w-12 h-12 bg-orange-100 rounded flex items-center justify-center text-orange-500 font-bold mr-3">
                            {{ req.requester.username.charAt(0).toUpperCase() }}
                        </div>
                    </template>
                    <template #right-icon>
                        <div v-if="req.status === 'pending'" class="flex gap-2">
                            <van-button size="small" type="primary" color="#07c160" @click="handleAccept(req.id)">
                                通过
                            </van-button>
                            <van-button size="small" plain type="danger" @click="handleReject(req.id)">
                                拒绝
                            </van-button>
                        </div>
                        <div v-else>
                            <van-tag v-if="req.status === 'accepted'" type="success" plain size="medium">已通过</van-tag>
                            <van-tag v-else-if="req.status === 'rejected'" type="danger" plain size="medium">已拒绝</van-tag>
                        </div>
                    </template>
                </van-cell>
            </div>

            <div v-else-if="!loading" class="p-20 text-center text-gray-400 text-sm">
                目前没有收到好友申请
            </div>
        </div>
    </div>
</template>
