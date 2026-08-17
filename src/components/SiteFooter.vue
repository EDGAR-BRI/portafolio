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
  <footer class="site-footer">
    <div class="footer-row">
      <span class="cursor">█</span>
      <span>{{ t.footer }}</span>
      <span class="tech">
        <Icon icon="logos:astro-icon" width="14" height="14" />
        Astro
      </span>
      <span>{{ t.and }}</span>
      <span class="tech">
        <Icon icon="logos:vue" width="14" height="14" />
        Vue
      </span>
    </div>
    <div class="footer-copy">© {{ year }} Edgar Bri · github.com/EDGAR-BRI</div>
  </footer>
</template>

<style scoped>
.site-footer {
  margin-top: 3rem;
  padding: 1.5rem 0 1rem;
  color: var(--muted);
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.8rem;
  border-top: 1px solid var(--line);
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.footer-row {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.tech {
  color: var(--accent);
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
}

.cursor {
  color: var(--accent);
  animation: blink 1s steps(1) infinite;
}

.footer-copy {
  font-size: 0.7rem;
  color: var(--muted);
  letter-spacing: 0.1em;
}

@keyframes blink {
  50% { opacity: 0; }
}
</style>