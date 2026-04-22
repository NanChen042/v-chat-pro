<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { loginApi } from '@/api/user';
import { useUserStore } from '@/stores/user';
import { useSocket } from '@/utils/socket';
import { showSuccessToast, showFailToast } from 'vant';

const router = useRouter();
const userStore = useUserStore();
const { connect } = useSocket();

const username = ref('');
const password = ref('');
const loading = ref(false);

const handleLogin = async () => {
    if (!username.value || !password.value) return;

    loading.value = true;
    try {
        const res = await loginApi({ username: username.value, password: password.value });
        if (res && res.user) {
            userStore.setUser({ id: res.user.id, username: res.user.username });
            if (res.access_token) userStore.setToken(res.access_token);
            // 连接 WebSocket
            connect(res.user.id);
            router.replace('/');
        }
    } catch (err) {
        // 拦截器已处理 Toast
    } finally {
        loading.value = false;
    }
};
</script>

<template>
    <div class="min-h-screen bg-white px-8 pt-20 flex flex-col">
        <!-- Logo 区域 -->
        <div class="flex flex-col items-center mb-12">
            <div class="w-20 h-20 bg-[#07c160] rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-green-100">
                <van-icon name="chat" size="48" color="white" />
            </div>
            <h1 class="text-2xl font-semibold text-gray-800">登录微信</h1>
        </div>

        <!-- 表单区域 -->
        <van-form @submit="handleLogin" class="space-y-4">
            <van-cell-group inset class="m-0!">
                <van-field v-model="username" name="username" label="账号" placeholder="请输入用户名" :rules="[{ required: true, message: '请填写用户名' }]" class="px-0! py-4 text-lg" />
                <van-field v-model="password" type="password" name="password" label="密码" placeholder="请输入密码" autocomplete="current-password" :rules="[{ required: true, message: '请填写密码' }]" class="px-0! py-4 text-lg" />
            </van-cell-group>

            <div class="mt-12">
                <van-button round block type="primary" native-type="submit" color="#07c160" :loading="loading" class="h-12 text-lg font-medium">
                    登录
                </van-button>

                <div class="flex justify-center mt-6">
                    <span class="text-gray-400 text-sm">还没有账号？</span>
                    <span class="text-[#576b95] text-sm font-medium cursor-pointer" @click="router.push('/auth/register')">
                        立即注册
                    </span>
                </div>
            </div>
        </van-form>

        <div class="mt-auto pb-10 text-center text-xs text-gray-300">
            登录即代表同意微服务协议及隐私政策
        </div>
    </div>
</template>

<style scoped>
:deep(.van-cell:after) {
    left: 0;
    right: 0;
}

:deep(.van-field__label) {
    width: 3.5em;
    color: #333;
}
</style>
