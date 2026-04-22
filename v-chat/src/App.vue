<script setup lang="ts">
import { watch, onMounted } from 'vue';
import { RouterView, useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { useSocket } from '@/utils/socket';
import { showDialog, showNotify } from 'vant';

const router = useRouter();
const userStore = useUserStore();
const { connect, on } = useSocket();

// 初始化时从存储恢复并尝试连接
onMounted(() => {
  userStore.initFromStorage();
  if (userStore.userInfo?.id) {
    connect(userStore.userInfo.id);
    userStore.fetchSessions();
    userStore.fetchPendingCount();
  }

  // 1. 监听好友申请通知
  on('friendRequest', (data: any) => {
    userStore.pendingFriendCount++;
    showDialog({
      title: '新的朋友',
      message: `${data.requesterName} 申请添加你为朋友`,
      confirmButtonText: '去查看',
      cancelButtonText: '忽略',
      showCancelButton: true,
      confirmButtonColor: '#07c160'
    }).then((action) => {
      if (action === 'confirm') {
        router.push('/contact/pending');
      }
    });
  });

  // 2. 监听好友申请通过通知
  on('friendAccepted', (data: any) => {
    showDialog({
      title: '申请已通过',
      message: `你已成功添加 ${data.friendName} 为朋友`,
      confirmButtonText: '知道了',
      confirmButtonColor: '#07c160'
    });
  });

  // 3. 监听好友申请拒绝通知
  on('friendRejected', (data: any) => {
    showDialog({
      title: '好友申请被拒绝',
      message: `用户 ${data.friendName} 拒绝了你的好友申请`,
      confirmButtonText: '确定',
      confirmButtonColor: '#07c160'
    });
  });

  // 4. 监听新消息，计算全局未读数
  on('message', (data: any) => {
    const route = router.currentRoute.value;
    // 如果当前不在对应的聊天页，则展示提醒并增加未读数
    const isCurrentChat = route.name === 'chat' && parseInt(route.params.id as string) === data.senderId;
    if (!isCurrentChat && data.senderId !== userStore.userInfo?.id) {
      // 刷新会话列表以获取最新未读数（替代非法的 computed ++）
      userStore.fetchSessions();

      // 显示顶部通知
      showNotify({
        type: 'primary',
        message: `收到来自 ${data.senderName || '好友'} 的新消息`,
        background: '#07c160',
        onClick: () => {
          router.push(`/chat/${data.senderId}`);
        }
      });
    }
  });

  // 监听登录状态变化
  watch(() => userStore.userInfo?.id, (newId) => {
    if (newId) {
      connect(newId);
    }
  });
});
</script>

<template>
  <RouterView />
</template>

<style scoped></style>
