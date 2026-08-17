<script setup lang="ts">
import { computed } from 'vue';
import { Icon } from '@iconify/vue';
import { useLang } from '../stores/lang';
import { translations, social } from '../data/site';

const lang = useLang();
const t = computed(() => translations[lang.value]);
</script>

<template>
  <section class="my-20" id="contact">
    <div class="contact-inner corner relative p-10 bg-[color:var(--bg-soft)] border border-[color:var(--line)]">
      <div class="section-label">[ contact ]</div>
      <h2 class="section-title">
        <span class="hash">#</span> {{ t.sections.contact_title }}
      </h2>
      <p class="section-sub">{{ t.sections.contact_subtitle }}</p>
      <div class="flex gap-3 flex-wrap mt-6">
        <a
          :href="`mailto:${social.email}`"
          class="inline-flex items-center gap-2 px-4.5 py-2.5 font-semibold no-underline text-[0.9rem] font-mono tracking-[0.03em] border border-transparent transition-colors duration-150 bg-[color:var(--accent)] text-[color:var(--bg)] hover:bg-transparent hover:text-[color:var(--accent)] hover:border-[color:var(--accent)]"
        >
          <Icon icon="lucide:mail" width="14" height="14" />
          {{ t.sections.contact_btn }}
        </a>
        <a
          :href="social.github"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-2 px-4.5 py-2.5 font-semibold no-underline text-[0.9rem] font-mono tracking-[0.03em] transition-colors duration-150 bg-transparent text-[color:var(--fg)] border border-[color:var(--line)] hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
        >
          <Icon icon="lucide:github" width="14" height="14" />
          github.com/EDGAR-BRI
          <Icon icon="lucide:external-link" width="12" height="12" />
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