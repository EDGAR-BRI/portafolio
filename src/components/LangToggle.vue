<script setup lang="ts">
import { useLang, toggleLang, type Lang } from '../stores/lang';

const lang = useLang();

function pick(value: Lang) {
  if (lang.value !== value) toggleLang();
}
</script>

<template>
  <div class="lang-toggle" role="group" aria-label="Language">
    <button
      type="button"
      class="lang-btn"
      :class="{ active: lang.value === 'es' }"
      :aria-pressed="lang.value === 'es'"
      @click="pick('es')"
    >
      ES
    </button>
    <span class="sep">/</span>
    <button
      type="button"
      class="lang-btn"
      :class="{ active: lang.value === 'en' }"
      :aria-pressed="lang.value === 'en'"
      @click="pick('en')"
    >
      EN
    </button>
  </div>
</template>

<style scoped>
.lang-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.75rem;
  border: 1px solid var(--line);
  background: rgba(11, 15, 20, 0.6);
  backdrop-filter: blur(8px);
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.75rem;
  letter-spacing: 0.1em;
}

.lang-btn {
  padding: 0.2rem 0.4rem;
  border: none;
  background: transparent;
  color: var(--muted);
  cursor: pointer;
  font-weight: 600;
  transition: color 0.15s ease;
}

.lang-btn:hover {
  color: var(--fg);
}

.lang-btn.active {
  color: var(--accent);
  text-shadow: 0 0 8px rgba(74, 222, 128, 0.4);
}

.sep {
  color: var(--line);
}
</style>