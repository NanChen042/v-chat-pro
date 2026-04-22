<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { searchUserApi, sendFriendRequestApi } from '@/api/friend';
import { useUserStore } from '@/stores/user';

const router = useRouter();
const userStore = useUserStore();

const keyword = ref('');
const searchResult = ref<any[]>([]);
const searching = ref(false);

const handleSearch = async () => {
    if (!keyword.value.trim()) return;
    searching.value = true;
    try {
        const res = await searchUserApi(keyword.value);
        searchResult.value = res || [];
    } catch (err) {
        // 拦截器处理
    } finally {
        searching.value = false;
    }
};

const sendRequest = async (targetId: number) => {
    if (!userStore.user?.id) return;
    try {
        await sendFriendRequestApi({
            requesterId: userStore.user.id,
            addresseeId: targetId
        });
        showSuccessToast('申请已发送');
    } catch (err) {
        // 拦截器处理
    }
};
</script>

<template>
    <div class="min-h-screen bg-[#f7f7f7]">
        <van-nav-bar title="添加朋友" left-arrow @click-left="router.back()" fixed placeholder border />

        <div class="px-4 py-3 bg-white flex items-center space-x-3">
            <div class="flex-1 bg-[#f7f7f7] rounded px-3 py-2 flex items-center">
                <van-icon name="search" class="text-gray-400 mr-2" />
                <input v-model="keyword" placeholder="账号" class="bg-transparent border-none outline-none text-sm w-full" @keyup.enter="handleSearch" />
                <van-icon v-if="keyword" name="clear" class="text-gray-300" @click="keyword = ''" />
            </div>
            <span class="text-[#07c160] text-sm font-medium" @click="handleSearch">搜索</span>
        </div>

        <div class="mt-4">
            <div v-if="searching" class="p-10 text-center">
                <van-loading size="24px">搜索中...</van-loading>
            </div>

            <div v-if="searchResult.length > 0" class="bg-white">
                <div class="px-4 py-2 text-xs text-gray-500 bg-[#f7f7f7]">搜索结果</div>
                <van-cell v-for="user in searchResult" :key="user.id" :title="user.username" center>
                    <template #icon>
                        <div class="w-10 h-10 bg-blue-100 rounded flex items-center justify-center text-blue-500 font-bold mr-3">
                            {{ user.username.charAt(0).toUpperCase() }}
                        </div>
                    </template>
                    <template #right-icon>
                        <van-button size="small" type="primary" color="#07c160" @click="sendRequest(user.id)">
                            添加
                        </van-button>
                    </template>
                </van-cell>
            </div>

            <div v-else-if="keyword && !searching" class="p-10 text-center text-gray-400 text-sm">
                未找到相关用户
            </div>
        </div>
    </div>
</template>
