import request from '@/utils/request';

/**
 * 获取最近会话列表
 */
export const getSessionsApi = (userId: number) => {
    return request({
        url: '/chat/sessions',
        method: 'get',
        params: { userId }
    });
};

/**
 * 获取两个好友之间的历史聊天记录
 */
export const getChatHistoryApi = (user1Id: number, user2Id: number) => {
    return request({
        url: '/chat/history',
        method: 'get',
        params: { user1Id, user2Id }
    });
};

/**
 * 标记已读
 */
export const markAsReadApi = (userId: number, friendId: number) => {
    return request({
        url: '/chat/read',
        method: 'post',
        data: { userId, friendId }
    });
};
