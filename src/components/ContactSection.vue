<script setup lang="ts">
import { computed } from 'vue';
import { Icon } from '@iconify/vue';
import { useLang } from '../stores/lang';
import { translations, social } from '../data/site';

const lang = useLang();
const t = computed(() => translations[lang.value]);
</script>

<template>
  <section class="contact" id="contact">
    <div class="contact-inner corner">
      <div class="section-label">[ contact ]</div>
      <h2 class="section-title">
        <span class="hash">#</span> {{ t.sections.contact_title }}
      </h2>
      <p class="section-sub">{{ t.sections.contact_subtitle }}</p>
      <div class="actions">
        <a :href="`mailto:${social.email}`" class="btn primary">
          <Icon icon="lucide:mail" width="14" height="14" />
          {{ t.sections.contact_btn }}
        </a>
        <a :href="social.github" target="_blank" rel="noopener noreferrer" class="btn ghost">
          <Icon icon="lucide:github" width="14" height="14" />
          github.com/EDGAR-BRI
          <Icon icon="lucide:external-link" width="12" height="12" />
        </a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.contact {
  margin: 5rem 0 2rem;
}

.contact-inner {
  padding: 2.5rem;
  background: var(--bg-soft);
  border: 1px solid var(--line);
}

.section-title {
  justify-content: flex-start;
}

.actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-top: 1.5rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.7rem 1.15rem;
  font-weight: 600;
  text-decoration: none;
  font-size: 0.9rem;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  letter-spacing: 0.03em;
  border: 1px solid transparent;
  transition: background 0.15s ease, color 0.15s ease;
}

.btn.primary {
  background: var(--accent);
  color: var(--bg);
}

.btn.primary:hover {
  background: transparent;
  color: var(--accent);
  border-color: var(--accent);
}

.btn.ghost {
  background: transparent;
  color: var(--fg);
  border-color: var(--line);
}

.btn.ghost:hover {
  border-color: var(--accent);
  color: var(--accent);
}
</style>