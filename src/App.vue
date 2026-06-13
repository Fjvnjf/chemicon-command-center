<script setup lang="ts">
import { useAppStore } from '@/stores/app'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppHeader from '@/components/layout/AppHeader.vue'

const appStore = useAppStore()

function toggleSidebar() {
  appStore.toggleSidebar()
}
</script>

<template>
  <n-config-provider>
    <n-message-provider>
      <n-dialog-provider>
        <div class="app-shell">
          <AppSidebar />
          <div class="main-area">
            <AppHeader @toggle-sidebar="toggleSidebar" />
            <main class="main-content">
              <router-view />
            </main>
          </div>
        </div>
      </n-dialog-provider>
    </n-message-provider>
  </n-config-provider>
</template>

<style scoped lang="scss">
.app-shell {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

.main-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  height: 100%;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}
</style>
