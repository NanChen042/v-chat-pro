import request from '@/utils/request';

/**
 * 搜索用户
 */
export const searchUserApi = (username: string) => {
    return request({
        url: '/user/search',
        method: 'get',
        params: { username }
    });
};

/**
 * 发起好友申请
 */
export const sendFriendRequestApi = (data: { requesterId: number; addresseeId: number }) => {
    return request({
        url: '/user/friend/request',
        method: 'post',
        data
    });
};

/**
 * 处理好友申请 (同意)
 */
export const acceptFriendRequestApi = (data: { userId: number; requestId: number }) => {
    return request({
        url: '/user/friend/accept',
        method: 'post',
        data
    });
};

/**
 * 处理好友申请 (拒绝)
 */
export const rejectFriendRequestApi = (data: { userId: number; requestId: number }) => {
    return request({
        url: '/user/friend/reject',
        method: 'post',
        data
    });
};

/**
 * 获取我的好友列表
 */
export const getFriendListApi = (userId: number) => {
    return request({
        url: '/user/friend/list',
        method: 'get',
        params: { userId }
    });
};

/**
 * 获取待处理申请列表
 */
export const getPendingRequestsApi = (userId: number) => {
    return request({
        url: '/user/friend/pending',
        method: 'get',
        params: { userId }
    });
};
