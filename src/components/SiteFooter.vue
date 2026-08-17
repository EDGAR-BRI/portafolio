<script setup lang="ts">
import { computed } from 'vue';
import { Icon } from '@iconify/vue';
import { useLang } from '../stores/lang';
import { translations } from '../data/site';

const lang = useLang();
const t = computed(() => translations[lang.value]);
const year = new Date().getFullYear();
</script>

<template>
  <footer class="mt-12 pt-6 pb-4 text-[color:var(--muted)] font-mono text-[0.8rem] border-t border-[color:var(--line)] text-center flex flex-col gap-2">
    <div class="inline-flex items-center justify-center gap-2 flex-wrap">
      <span class="text-[color:var(--accent)] animate-blink">█</span>
      <span>{{ t.footer }}</span>
      <span class="text-[color:var(--accent)] inline-flex items-center gap-1.5">
        <Icon icon="logos:astro-icon" width="14" height="14" />
        Astro
      </span>
      <span>{{ t.and }}</span>
      <span class="text-[color:var(--accent)] inline-flex items-center gap-1.5">
        <Icon icon="logos:vue" width="14" height="14" />
        Vue
      </span>
    </div>
    <div class="text-[0.7rem] text-[color:var(--muted)] tracking-[0.1em]">© {{ year }} Edgar Bri · github.com/EDGAR-BRI</div>
  </footer>
</template>

<style scoped>
.animate-blink {
  animation: blink 1s steps(1) infinite;
}

@keyframes blink {
  50% { opacity: 0; }
}
</style>