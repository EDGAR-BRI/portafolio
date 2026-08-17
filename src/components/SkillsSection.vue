<script setup lang="ts">
import { computed } from 'vue';
import { Icon } from '@iconify/vue';
import { useLang } from '../stores/lang';
import { translations, skills } from '../data/site';

const lang = useLang();
const t = computed(() => translations[lang.value]);
</script>

<template>
  <section class="skills-section" id="skills">
    <div class="section-label">[ skills ]</div>
    <h2 class="section-title">
      <span class="hash">#</span> {{ t.sections.skills_title }}
    </h2>
    <p class="section-sub">{{ t.sections.skills_subtitle }}</p>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 -m-px border border-[color:var(--line)]">
      <div
        v-for="(s, i) in skills"
        :key="s.name"
        class="skill corner relative px-4 py-3.5 border border-[color:var(--line)] m-px bg-[color:var(--bg-soft)]"
        :style="{ animationDelay: `${i * 0.04}s` }"
      >
        <div class="flex items-center gap-2 mb-3">
          <Icon :icon="s.icon" class="text-[color:var(--accent)] shrink-0" width="20" height="20" />
          <span class="flex-1 font-mono text-[0.85rem] text-[color:var(--fg)] font-medium">{{ s.name }}</span>
          <span class="text-[0.75rem] text-[color:var(--muted)] font-mono tracking-[0.05em]">{{ s.level }}%</span>
        </div>
        <div class="bar relative h-2 flex gap-px">
          <div
            class="fill absolute inset-0 bg-[color:var(--accent)] opacity-70 transition-[width] duration-1000 ease-out z-1"
            :style="{ width: s.level + '%' }"
          ></div>
          <div class="absolute inset-0 flex gap-px z-0" aria-hidden="true">
            <span v-for="n in 10" :key="n" class="flex-1 bg-[color:var(--line)]"></span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.skills-section {
  margin: 5rem 0;
}

.skill {
  transition: background 0.15s ease, border-color 0.15s ease;
  animation: fadeUp 0.4s ease-out backwards;
}

.skill:hover {
  background: rgba(74, 222, 128, 0.05);
  z-index: 1;
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>