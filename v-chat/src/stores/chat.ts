import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface ChatSession {
    id: number;
    username: string;
    avatar?: string;
    lastMessage: string;
    time: string;
    unreadCount: number;
}

export const useChatStore = defineStore('chat', () => {
    // 模拟最近聊天列表数据
    const sessions = ref<ChatSession[]>([
        {
            id: 2,
            username: '产品经理',
            lastMessage: '那个需求还要改一下...',
            time: '13:50',
            unreadCount: 3
        },
        {
            id: 3,
            username: '老板',
            lastMessage: '下午开会',
            time: '12:00',
            unreadCount: 0
        },
        {
            id: 4,
            username: '前端架构师',
            lastMessage: 'Tailwind 4 真香',
            time: '昨天',
            unreadCount: 1
        }
    ]);

    function updateSession(sessionId: number, message: string, time: string) {
        const session = sessions.value.find(s => s.id === sessionId);
        if (session) {
            session.lastMessage = message;
            session.time = time;
        }
    }

    function clearUnread(sessionId: number) {
        const session = sessions.value.find(s => s.id === sessionId);
        if (session) {
            session.unreadCount = 0;
        }
    }

    return { sessions, updateSession, clearUnread };
});
