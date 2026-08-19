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
          class="contact-btn-primary group inline-flex items-center justify-center sm:justify-start gap-2.5 px-4.5 py-2.5 font-semibold no-underline text-[0.85rem] sm:text-[0.9rem] font-mono tracking-[0.03em] border border-[color:var(--accent)] bg-[rgba(74,222,128,0.12)] text-[color:var(--fg)] rounded-[2px] transition-all duration-200 hover:bg-[color:var(--accent)] hover:text-[color:var(--bg)] hover:shadow-[0_0_14px_rgba(74,222,128,0.3)]"
        >
          <Icon
            icon="lucide:mail"
            width="15"
            height="15"
            class="text-[color:var(--accent)] group-hover:text-[color:var(--bg)] transition-colors duration-200 shrink-0"
          />
          <span>{{ t.sections.contact_btn }}</span>
        </a>
        <a
          :href="social.github"
          target="_blank"
          rel="noopener noreferrer"
          class="contact-btn-secondary group inline-flex items-center justify-center sm:justify-start gap-2 px-4.5 py-2.5 font-semibold no-underline text-[0.85rem] sm:text-[0.9rem] font-mono tracking-[0.03em] transition-all duration-200 bg-[rgba(255,255,255,0.02)] text-[color:var(--fg)] border border-[color:var(--line)] rounded-[2px] hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
        >
          <Icon icon="lucide:github" width="15" height="15" class="text-[color:var(--accent)] shrink-0" />
          <span>github.com/EDGAR-BRI</span>
          <Icon icon="lucide:external-link" width="13" height="13" class="text-[color:var(--muted)] group-hover:text-[color:var(--accent)] transition-colors shrink-0" />
        </a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.section-title {
  justify-content: flex-start;
}
</style>