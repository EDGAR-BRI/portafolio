<script setup lang="ts">
import { computed } from 'vue';
import { Icon } from '@iconify/vue';
import { useLang } from '../stores/lang';
import { translations, skills } from '../data/site';

const lang = useLang();
const t = computed(() => translations[lang.value]);
</script>

<template>
  <section class="my-12 sm:my-20" id="skills">
    <div class="section-label">[ skills ]</div>
    <h2 class="section-title">
      <span class="hash">#</span> {{ t.sections.skills_title }}
    </h2>
    <p class="section-sub">{{ t.sections.skills_subtitle }}</p>

    <ul class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-0 -m-px list-none p-0 m-0 border border-[color:var(--line)]">
      <li
        v-for="s in skills"
        :key="s.name"
        class="skill skill-item corner relative flex items-center gap-2 sm:gap-2.5 px-3 py-2.5 sm:px-4 sm:py-3 border border-[color:var(--line)] m-px bg-[color:var(--bg-soft)] font-mono text-[0.8rem] sm:text-[0.85rem] text-[color:var(--fg)] transition-colors duration-150 hover:bg-[rgba(74,222,128,0.05)]"
      >
        <Icon :icon="s.icon" class="text-[color:var(--accent)] shrink-0" width="18" height="18" />
        <span class="truncate">{{ s.name }}</span>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.skill:hover {
  z-index: 1;
}
</style>