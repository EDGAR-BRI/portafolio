<script setup lang="ts">
import { ref, computed } from 'vue';
import { Icon } from '@iconify/vue';
import { useLang } from '../stores/lang';
import { translations, skills, type SkillItem } from '../data/site';
import SectionTitle from './SectionTitle.vue';

const lang = useLang();
const t = computed(() => translations[lang.value]);

type CategoryKey = 'all' | 'frontend' | 'backend' | 'database' | 'mobile' | 'tools';

const selectedCategory = ref<CategoryKey>('all');

const categoryLabels: Record<CategoryKey, { es: string; en: string; icon: string }> = {
  all: { es: 'Todos', en: 'All', icon: 'lucide:layers' },
  frontend: { es: 'Frontend', en: 'Frontend', icon: 'lucide:layout' },
  backend: { es: 'Backend', en: 'Backend', icon: 'lucide:server' },
  database: { es: 'Bases de datos', en: 'Databases', icon: 'lucide:database' },
  mobile: { es: 'Móvil', en: 'Mobile', icon: 'lucide:smartphone' },
  tools: { es: 'DevOps & Herramientas', en: 'DevOps & Tools', icon: 'lucide:wrench' },
};

const counts = computed(() => {
  const c: Record<string, number> = { all: skills.length };
  for (const s of skills) {
    c[s.category] = (c[s.category] ?? 0) + 1;
  }
  return c;
});

const filteredSkills = computed<SkillItem[]>(() => {
  if (selectedCategory.value === 'all') return skills;
  return skills.filter((s) => s.category === selectedCategory.value);
});

function categoryTag(cat: SkillItem['category']): { label: string; color: string } {
  switch (cat) {
    case 'frontend':
      return { label: 'FE', color: '#22d3ee' };
    case 'backend':
      return { label: 'BE', color: '#4ade80' };
    case 'database':
      return { label: 'DB', color: '#a78bfa' };
    case 'mobile':
      return { label: 'MOB', color: '#38bdf8' };
    case 'tools':
      return { label: 'OPS', color: '#fbbf24' };
    default:
      return { label: 'DEV', color: '#94a3b8' };
  }
}
</script>

<template>
  <section class="my-12 sm:my-20" id="skills">
    <SectionTitle
      :title="t.sections.skills_title"
      :subtitle="t.sections.skills_subtitle"
      id="skills-title"
      path="~/skills"
    />

    <!-- Category Filter Tabs -->
    <div class="filter-track flex items-center gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none">
      <button
        v-for="(meta, key) in categoryLabels"
        :key="key"
        type="button"
        class="filter-chip"
        :class="{ active: selectedCategory === key }"
        @click="selectedCategory = key as CategoryKey"
      >
        <Icon :icon="meta.icon" width="13" height="13" class="shrink-0" />
        <span>{{ lang === 'es' ? meta.es : meta.en }}</span>
        <span class="chip-count">{{ counts[key] ?? 0 }}</span>
      </button>
    </div>

    <!-- Skills Grid -->
    <div class="skills-wrapper border border-[color:var(--line)] bg-[rgba(6,8,11,0.3)]">
      <ul class="skills-grid list-none p-0 m-0">
        <li
          v-for="(s, idx) in filteredSkills"
          :key="s.name"
          class="skill skill-item corner relative flex items-center justify-between gap-2.5 px-3.5 py-3 sm:px-4 sm:py-3.5 border-b border-r border-[color:var(--line)] bg-[color:var(--bg-soft)] font-mono text-[0.82rem] sm:text-[0.85rem] text-[color:var(--fg)] transition-all duration-150 hover:bg-[rgba(74,222,128,0.06)] hover:border-[color:var(--accent)]"
          :style="{ animationDelay: `${idx * 0.02}s` }"
        >
          <div class="flex items-center gap-2.5 min-w-0">
            <Icon :icon="s.icon" class="skill-icon shrink-0" width="20" height="20" />
            <span class="skill-name truncate font-medium">{{ s.name }}</span>
          </div>

          <span
            class="domain-tag shrink-0 font-mono text-[0.62rem] font-bold px-1.5 py-0.5 rounded-[2px]"
            :style="{
              color: categoryTag(s.category).color,
              backgroundColor: `${categoryTag(s.category).color}15`,
              border: `1px solid ${categoryTag(s.category).color}30`
            }"
          >
            {{ categoryTag(s.category).label }}
          </span>
        </li>
      </ul>

      <!-- Footer Info Bar -->
      <div class="skills-footer flex items-center justify-between px-3.5 py-2.5 bg-[color:var(--bg-soft)] border-t border-[color:var(--line)] font-mono text-[0.7rem] text-[color:var(--muted)] flex-wrap gap-2">
        <div class="flex items-center gap-2">
          <span class="text-[color:var(--accent)] font-bold">&gt;</span>
          <span>{{ filteredSkills.length }} {{ lang === 'es' ? 'tecnologías en vista' : 'technologies in view' }}</span>
        </div>
        <div class="flex items-center gap-2 text-[0.65rem] text-[color:var(--muted)] opacity-80">
          <span>[ FE: Frontend ]</span>
          <span>[ BE: Backend ]</span>
          <span>[ DB: Database ]</span>
          <span>[ OPS: Tools ]</span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.skills-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

@media (min-width: 640px) {
  .skills-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (min-width: 768px) {
  .skills-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .skills-grid {
    grid-template-columns: repeat(6, minmax(0, 1fr));
  }
}

.filter-track {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.filter-track::-webkit-scrollbar {
  display: none;
}

.filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.65rem;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.72rem;
  font-weight: 500;
  border-radius: 2px;
  border: 1px solid var(--line);
  background: var(--bg-soft);
  color: var(--muted);
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease;
}

.filter-chip:hover {
  border-color: var(--accent);
  color: var(--fg);
  background: rgba(74, 222, 128, 0.05);
}

.filter-chip.active {
  border-color: var(--accent);
  color: var(--accent);
  background: rgba(74, 222, 128, 0.12);
  font-weight: 600;
}

.chip-count {
  font-size: 0.65rem;
  padding: 0.05rem 0.3rem;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.05);
  color: inherit;
}

.skill {
  transition: transform 0.15s ease, background-color 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
  animation: fadeIn 0.3s ease-out backwards;
}

.skill:hover {
  z-index: 2;
  box-shadow: 0 0 12px rgba(74, 222, 128, 0.15);
  transform: translateY(-1px);
}

.skill-icon {
  transition: transform 0.15s ease;
}

.skill:hover .skill-icon {
  transform: scale(1.1);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>