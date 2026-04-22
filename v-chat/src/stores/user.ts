import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useUserStore = defineStore('user', () => {
    const userInfo = ref<{ id: number; username: string } | null>(null);
    const token = ref(localStorage.getItem('token') || '');
    const pendingFriendCount = ref(0);
    const sessions = ref<any[]>([]);
    const totalUnreadCount = computed(() => {
        return sessions.value.reduce((sum, s) => sum + (s.unreadCount || 0), 0);
    });

    const isLoggedIn = computed(() => !!userInfo.value?.id);

    async function fetchSessions() {
        if (!userInfo.value?.id) return;
        try {
            const { getSessionsApi } = await import('@/api/chat');
            const res = await getSessionsApi(userInfo.value.id);
            sessions.value = res || [];
        } catch (err) {
            console.error('Fetch sessions failed', err);
        }
    }

    function setUser(user: { id: number; username: string }) {
        userInfo.value = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
    }

    function setToken(val: string) {
        token.value = val;
        localStorage.setItem('token', val);
    }

    function initFromStorage() {
        const saved = localStorage.getItem('currentUser');
        if (saved) {
            userInfo.value = JSON.parse(saved);
        }
    }

    function logout() {
        userInfo.value = null;
        token.value = '';
        pendingFriendCount.value = 0;
        localStorage.removeItem('currentUser');
        localStorage.removeItem('token');
    }

    async function fetchPendingCount() {
        if (!userInfo.value?.id) return;
        try {
            const { getPendingRequestsApi } = await import('@/api/friend');
            const res = await getPendingRequestsApi(userInfo.value.id);
            pendingFriendCount.value = (res || []).length;
        } catch (err) {
            console.error('Fetch pending count failed', err);
        }
    }

    function clearPendingCount() {
        pendingFriendCount.value = 0;
    }

    const user = computed(() => userInfo.value);

    return {
        userInfo, user, token, pendingFriendCount, totalUnreadCount, sessions,
        isLoggedIn, setUser, setToken, initFromStorage, logout,
        fetchPendingCount, clearPendingCount, fetchSessions
    };
});
