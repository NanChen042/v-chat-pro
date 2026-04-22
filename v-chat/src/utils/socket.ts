import { io, Socket } from 'socket.io-client';
import { ref } from 'vue';

const socket = ref<Socket | null>(null);
let currentUserId: number | null = null;
const eventListeners = new Map<string, Set<(data: any) => void>>();

export function useSocket() {
    const connect = (userId: number) => {
        // 如果已经连接且用户 ID 没变，则跳过
        if (socket.value?.connected && currentUserId === userId) return;

        // 如果用户 ID 变了，先断开旧连接
        if (socket.value) {
            socket.value.disconnect();
        }

        currentUserId = userId;
        const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
        const newSocket = io(apiBase, {
            query: { userId }
        });

        newSocket.on('connect', () => {
            console.log('WebSocket Connected');
        });

        newSocket.on('disconnect', () => {
            console.log('WebSocket Disconnected');
        });

        // 重新注册所有已存在的监听器
        eventListeners.forEach((callbacks, event) => {
            callbacks.forEach(callback => {
                newSocket.on(event, callback);
            });
        });

        socket.value = newSocket;
    };

    const disconnect = () => {
        if (socket.value) {
            socket.value.disconnect();
            socket.value = null;
        }
    };

    const emit = (event: string, data: any) => {
        if (socket.value) {
            socket.value.emit(event, data);
        } else {
            console.warn(`Socket not connected, cannot emit event: ${event}`);
        }
    };

    const on = (event: string, callback: (data: any) => void) => {
        if (!eventListeners.has(event)) {
            eventListeners.set(event, new Set());
        }
        const callbacks = eventListeners.get(event)!;

        // 避免重复注册相同的回调
        if (!callbacks.has(callback)) {
            callbacks.add(callback);
            // 如果 socket 已经存在，立即注册
            socket.value?.on(event, callback);
        }
    };

    const off = (event: string, callback: (data: any) => void) => {
        const callbacks = eventListeners.get(event);
        if (callbacks) {
            callbacks.delete(callback);
            socket.value?.off(event, callback);
        }
    };

    return { socket, connect, disconnect, emit, on, off };
}
