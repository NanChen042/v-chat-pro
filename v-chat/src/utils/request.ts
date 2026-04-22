import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { showToast, showFailToast } from 'vant';

// 基础配置
const service: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// 请求拦截器
service.interceptors.request.use(
    (config) => {
        // 在这里可以添加 Token
        // const token = localStorage.getItem('token');
        // if (token) {
        //   config.headers.Authorization = `Bearer ${token}`;
        // }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 响应拦截器
service.interceptors.response.use(
    (response: AxiosResponse) => {
        const { code, message, data } = response.data;
        const { method } = response.config;

        // 业务错误处理 (假设 400 以上为错误)
        if (code && code >= 400) {
            showFailToast(message || '业务逻辑错误');
            return Promise.reject(new Error(message || 'Error'));
        }

        // 对个人习惯性的“操作成功”提示进行移除，由具体页面按需处理
        // if (method !== 'get') {
        //     showToast({
        //         message: message || '操作成功',
        //         type: 'success',
        //         duration: 1500
        //     });
        // }

        return data;
    },
    (error) => {
        const message = error.response?.data?.message || error.message || '网络请求错误';
        showFailToast(message);
        return Promise.reject(error);
    }
);

/**
 * 封装通用的请求方法
 */
const request = <T = any>(config: AxiosRequestConfig): Promise<T> => {
    return service.request(config);
};

export default request;
