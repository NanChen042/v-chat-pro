import request from '@/utils/request';

export const registerApi = (data: any) => {
    return request({
        url: '/user/register',
        method: 'post',
        data
    });
};

export const loginApi = (data: any) => {
    return request({
        url: '/auth/login',
        method: 'post',
        data
    });
};

export const getUserInfoApi = (id: number) => {
    return request({
        url: '/user/info',
        method: 'get',
        params: { id }
    });
};

export const searchUserApi = (username: string) => {
    return request({
        url: '/user/search',
        method: 'get',
        params: { username }
    });
};
