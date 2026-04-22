<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { registerApi } from '@/api/user';
import { showSuccessToast, showFailToast } from 'vant';

const router = useRouter();

const username = ref('');
const password = ref('');
const confirmPassword = ref('');
const loading = ref(false);

const handleRegister = async () => {
    if (password.value !== confirmPassword.value) {
        showFailToast('两次密码输入不一致');
        return;
    }

    loading.value = true;
    try {
        const res = await registerApi({ username: username.value, password: password.value });
        if (res && res.id) {
            showSuccessToast('注册成功，请准备登录');
            router.push('/auth/login');
        } else {
            showFailToast(res.message || '注册失败');
        }
    } catch (err) {
        // 拦截器已处理
    } finally {
        loading.value = false;
    }
};
</script>

<template>
    <div class="min-h-screen bg-white px-8 pt-20 flex flex-col">
        <div class="flex flex-col items-center mb-12">
            <div class="w-20 h-20 bg-[#07c160] rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-green-100">
                <van-icon name="user-circle-o" size="48" color="white" />
            </div>
            <h1 class="text-2xl font-semibold text-gray-800">注册账号</h1>
        </div>

        <van-form @submit="handleRegister" class="space-y-4">
            <van-cell-group inset class="m-0!">
                <van-field v-model="username" label="用户名" placeholder="起个响亮的名字" :rules="[{ required: true, message: '请填写用户名' }]" class="px-0! py-4 text-lg" />
                <van-field v-model="password" type="password" label="密码" placeholder="设置登录密码" autocomplete="new-password" :rules="[{ required: true, message: '请填写密码' }]" class="px-0! py-4 text-lg" />
                <van-field v-model="confirmPassword" type="password" label="确认密码" placeholder="再次输入密码" autocomplete="new-password" :rules="[{ required: true, message: '请确认密码' }]" class="px-0! py-4 text-lg" />
            </van-cell-group>

            <div class="mt-12">
                <van-button round block type="primary" native-type="submit" color="#07c160" :loading="loading" class="h-12 text-lg font-medium">
                    立即注册
                </van-button>

                <div class="flex justify-center mt-6">
                    <span class="text-[#576b95] text-sm font-medium cursor-pointer" @click="router.back()">
                        返回登录
                    </span>
                </div>
            </div>
        </van-form>
    </div>
</template>

<style scoped>
:deep(.van-cell:after) {
    left: 0;
    right: 0;
}

:deep(.van-field__label) {
    width: 4.5em;
    color: #333;
}
</style>
