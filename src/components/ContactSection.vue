<script setup lang="ts">
import { computed } from 'vue';
import { useLang } from '../stores/lang';
import { translations, social } from '../data/site';

const lang = useLang();
const t = computed(() => translations[lang.value]);
</script>

<template>
  <section class="contact" id="contact">
    <h2 class="section-title">
      <span class="hash">#</span> {{ t.sections.contact_title }}
    </h2>
    <p class="section-sub">{{ t.sections.contact_subtitle }}</p>
    <div class="actions">
      <a :href="`mailto:${social.email}`" class="btn primary">
        ✉ {{ t.sections.contact_btn }}
      </a>
      <a :href="social.github" target="_blank" rel="noopener noreferrer" class="btn ghost">
        GitHub ↗
      </a>
    </div>
  </section>
</template>

<style scoped>
.contact {
  margin: 5rem 0 2rem;
  padding: 2.5rem;
  background: rgba(22, 27, 34, 0.5);
  border: 1px solid var(--border);
  border-radius: 16px;
  text-align: center;
  backdrop-filter: blur(6px);
}

.section-title {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  justify-content: center;
}

.hash {
  color: var(--accent);
}

.section-sub {
  color: var(--muted);
  margin: 0 0 1.5rem 0;
}

.actions {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.7rem 1.25rem;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  font-size: 0.95rem;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.btn.primary {
  background: var(--accent);
  color: var(--bg);
}

.btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(74, 222, 128, 0.3);
}

.btn.ghost {
  background: transparent;
  color: var(--fg);
  border: 1px solid var(--border);
}

.btn.ghost:hover {
  border-color: var(--accent);
}
</style>