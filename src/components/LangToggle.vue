<script setup lang="ts">
import { useLang, toggleLang, type Lang } from '../stores/lang';

const lang = useLang();

function handleToggle() {
  toggleLang();
}

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
  gap: 2px;
  padding: 4px;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: rgba(13, 17, 23, 0.6);
  backdrop-filter: blur(8px);
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
}

.lang-btn {
  padding: 0.35rem 0.75rem;
  border: none;
  border-radius: 999px;
  background: transparent;
  color: var(--muted);
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
}

.lang-btn:hover {
  color: var(--fg);
}

.lang-btn.active {
  background: var(--accent);
  color: var(--bg);
  box-shadow: 0 0 12px rgba(74, 222, 128, 0.4);
}
</style>