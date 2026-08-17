<script setup lang="ts">
import { computed } from 'vue';
import { Icon } from '@iconify/vue';
import { useLang } from '../stores/lang';
import { translations, skills } from '../data/site';

const lang = useLang();
const t = computed(() => translations[lang.value]);
</script>

<template>
  <section class="my-20" id="skills">
    <div class="section-label">[ skills ]</div>
    <h2 class="section-title">
      <span class="hash">#</span> {{ t.sections.skills_title }}
    </h2>
    <p class="section-sub">{{ t.sections.skills_subtitle }}</p>

    <ul class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-0 -m-px list-none p-0 m-0 border border-[color:var(--line)]">
      <li
        v-for="(s, i) in skills"
        :key="s.name"
        class="skill corner relative flex items-center gap-2.5 px-4 py-3 border border-[color:var(--line)] m-px bg-[color:var(--bg-soft)] font-mono text-[0.85rem] text-[color:var(--fg)] transition-colors duration-150 hover:bg-[rgba(74,222,128,0.05)]"
        :style="{ animationDelay: `${i * 0.025}s` }"
      >
        <Icon :icon="s.icon" class="text-[color:var(--accent)] shrink-0" width="20" height="20" />
        <span class="truncate">{{ s.name }}</span>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.skill {
  animation: fadeUp 0.4s ease-out backwards;
}

.skill:hover {
  z-index: 1;
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>