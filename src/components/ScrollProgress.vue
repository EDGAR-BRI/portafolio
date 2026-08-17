<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';

const progress = ref(0);

function update() {
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  progress.value = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
}

onMounted(() => {
  update();
  window.addEventListener('scroll', update, { passive: true });
});

onUnmounted(() => {
  window.removeEventListener('scroll', update);
});
</script>

<template>
  <div class="scroll-progress" aria-hidden="true">
    <div class="scroll-progress-bar" :style="{ width: progress + '%' }"></div>
  </div>
</template>

<style scoped>
.scroll-progress {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  z-index: 101;
  background: rgba(139, 148, 158, 0.12);
}

.scroll-progress-bar {
  height: 100%;
  width: 0%;
  background: var(--accent);
  box-shadow: 0 0 10px var(--accent);
  transition: width 0.1s linear;
}
</style>