<script setup lang="ts">
import { computed } from 'vue';
import { useLang } from '../stores/lang';
import { translations } from '../data/site';

const lang = useLang();
const t = computed(() => translations[lang.value]);
const year = new Date().getFullYear();
</script>

<template>
  <footer class="site-footer">
    <p>
      © {{ year }} Edgar Bri · {{ t.footer }}
      <span class="tech">Astro</span> {{ t.and }}
      <span class="tech">Vue</span>
      <span class="cursor">█</span>
    </p>
  </footer>
</template>

<style scoped>
.site-footer {
  text-align: center;
  padding: 2rem 0 1rem;
  color: var(--muted);
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.85rem;
  border-top: 1px solid var(--border);
  margin-top: 3rem;
}

.tech {
  color: var(--accent);
  margin: 0 0.3rem;
}

.cursor {
  color: var(--accent);
  animation: blink 1s steps(1) infinite;
}

@keyframes blink {
  50% { opacity: 0; }
}
</style>