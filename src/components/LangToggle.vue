<script setup lang="ts">
import { computed } from 'vue';
import { Icon } from '@iconify/vue';
import { useLang, toggleLang, type Lang } from '../stores/lang';

const lang = useLang();
const currentUpper = computed(() => (lang.value || 'es').toUpperCase());

function pick(value: Lang) {
  if (lang.value !== value) toggleLang();
}
</script>

<template>
  <div class="lang-toggle-wrap">
    <!-- Desktop view: ES / EN toggle -->
    <div class="lang-toggle-desktop" role="group" aria-label="Language">
      <button
        type="button"
        class="lang-btn"
        :class="{ active: lang === 'es' }"
        :aria-pressed="lang === 'es'"
        @click="pick('es')"
      >
        ES
      </button>
      <span class="sep">/</span>
      <button
        type="button"
        class="lang-btn"
        :class="{ active: lang === 'en' }"
        :aria-pressed="lang === 'en'"
        @click="pick('en')"
      >
        EN
      </button>
    </div>

    <!-- Mobile view: compact icon button -->
    <button
      type="button"
      class="lang-toggle-mobile"
      :aria-label="lang === 'es' ? 'Cambiar a inglés' : 'Switch to Spanish'"
      :title="lang === 'es' ? 'Cambiar idioma (actual: ES)' : 'Switch language (current: EN)'"
      @click="toggleLang"
    >
      <Icon icon="lucide:languages" width="15" height="15" class="lang-icon" />
      <span class="lang-tag">{{ currentUpper }}</span>
    </button>
  </div>
</template>

<style scoped>
.lang-toggle-wrap {
  display: inline-flex;
  align-items: center;
}

.lang-toggle-desktop {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.7rem;
  border: 1px solid var(--line);
  background: rgba(11, 15, 20, 0.6);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.75rem;
  letter-spacing: 0.1em;
  transition: all 0.2s ease;
}

.lang-btn {
  padding: 0.15rem 0.35rem;
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

.lang-toggle-mobile {
  display: none;
  align-items: center;
  gap: 0.35rem;
  padding: 0.3rem 0.55rem;
  border: 1px solid var(--line);
  background: rgba(11, 15, 20, 0.7);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  color: var(--fg);
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.72rem;
  font-weight: 700;
  cursor: pointer;
  border-radius: 2px;
  transition: all 0.15s ease;
}

.lang-toggle-mobile:hover,
.lang-toggle-mobile:active {
  border-color: var(--accent);
  background: rgba(74, 222, 128, 0.08);
  color: var(--accent);
}

.lang-icon {
  color: var(--accent);
  flex-shrink: 0;
}

.lang-tag {
  color: var(--fg);
  font-size: 0.7rem;
  letter-spacing: 0.05em;
}

@media (max-width: 640px) {
  .lang-toggle-desktop {
    display: none;
  }
  .lang-toggle-mobile {
    display: inline-flex;
  }
}
</style>