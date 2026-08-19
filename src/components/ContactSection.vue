<script setup lang="ts">
import { computed } from 'vue';
import { Icon } from '@iconify/vue';
import { useLang } from '../stores/lang';
import { translations, social } from '../data/site';

const lang = useLang();
const t = computed(() => translations[lang.value]);
</script>

<template>
  <section class="my-12 sm:my-20" id="contact">
    <div class="contact-inner corner relative p-5 sm:p-8 md:p-10 bg-[color:var(--bg-soft)] border border-[color:var(--line)]">
      <div class="section-label">[ contact ]</div>
      <h2 class="section-title">
        <span class="hash">#</span> {{ t.sections.contact_title }}
      </h2>
      <p class="section-sub">{{ t.sections.contact_subtitle }}</p>
      <div class="flex flex-col sm:flex-row gap-3 flex-wrap mt-6">
        <a
          :href="`mailto:${social.email}`"
          class="contact-btn-primary"
        >
          <Icon
            icon="lucide:mail"
            width="15"
            height="15"
            class="contact-btn-icon"
          />
          <span class="contact-btn-text">{{ t.sections.contact_btn }}</span>
        </a>
        <a
          :href="social.github"
          target="_blank"
          rel="noopener noreferrer"
          class="contact-btn-secondary"
        >
          <Icon icon="lucide:github" width="15" height="15" class="github-icon" />
          <span class="github-text">github.com/EDGAR-BRI</span>
          <Icon icon="lucide:external-link" width="13" height="13" class="external-icon" />
        </a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.section-title {
  justify-content: flex-start;
}

.contact-btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  padding: 0.6rem 1.15rem;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.88rem;
  font-weight: 600;
  letter-spacing: 0.03em;
  text-decoration: none;
  border: 1px solid var(--accent);
  background: rgba(74, 222, 128, 0.1);
  color: var(--fg);
  border-radius: 2px;
  transition: background 0.18s ease, color 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
  cursor: pointer;
}

.contact-btn-primary .contact-btn-icon {
  color: var(--accent);
  transition: color 0.18s ease;
  flex-shrink: 0;
}

.contact-btn-primary .contact-btn-text {
  color: var(--fg);
  transition: color 0.18s ease;
}

.contact-btn-primary:hover {
  background: var(--accent);
  border-color: var(--accent);
  box-shadow: 0 0 16px rgba(74, 222, 128, 0.35);
}

.contact-btn-primary:hover .contact-btn-icon,
.contact-btn-primary:hover .contact-btn-text {
  color: #06080b !important;
}

.contact-btn-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
  padding: 0.6rem 1.15rem;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.88rem;
  font-weight: 600;
  letter-spacing: 0.03em;
  text-decoration: none;
  border: 1px solid var(--line);
  background: rgba(255, 255, 255, 0.02);
  color: var(--fg);
  border-radius: 2px;
  transition: all 0.18s ease;
  cursor: pointer;
}

.contact-btn-secondary .github-icon {
  color: var(--accent);
  flex-shrink: 0;
}

.contact-btn-secondary .github-text {
  color: var(--fg);
  transition: color 0.18s ease;
}

.contact-btn-secondary .external-icon {
  color: var(--muted);
  transition: color 0.18s ease;
  flex-shrink: 0;
}

.contact-btn-secondary:hover {
  border-color: var(--accent);
  background: rgba(74, 222, 128, 0.08);
}

.contact-btn-secondary:hover .github-text,
.contact-btn-secondary:hover .external-icon {
  color: var(--accent);
}
</style>