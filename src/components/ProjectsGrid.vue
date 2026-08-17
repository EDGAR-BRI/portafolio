<script setup lang="ts">
import { computed } from 'vue';
import { Icon } from '@iconify/vue';
import { useLang } from '../stores/lang';
import { translations } from '../data/site';

interface Project {
  slug: string;
  lang: 'es' | 'en';
  title: string;
  subtitle: string;
  description: string;
  stack: string[];
  repo: string;
  demo?: string;
  featured: boolean;
  order: number;
  year?: string;
}

interface Props {
  projects: Project[];
}

const props = defineProps<Props>();

const lang = useLang();
const t = computed(() => translations[lang.value]);

const visible = computed(() => {
  return props.projects
    .filter((p) => p.lang === lang.value)
    .sort((a, b) => {
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      return a.order - b.order;
    });
});
</script>

<template>
  <section class="projects-section" id="projects">
    <div class="section-label">[ projects ]</div>
    <h2 class="section-title">
      <span class="hash">#</span> {{ t.sections.projects_title }}
    </h2>
    <p class="section-sub">{{ t.sections.projects_subtitle }}</p>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 -m-px border border-[color:var(--line)]">
      <article
        v-for="(p, idx) in visible"
        :key="p.slug"
        class="project-card corner relative flex flex-col gap-3.5 p-5.5 border border-[color:var(--line)] m-px min-h-65"
        :class="{ featured: p.featured }"
        :style="{ animationDelay: `${idx * 0.04}s` }"
      >
        <div class="flex items-center justify-between text-[0.7rem] text-[color:var(--muted)] font-mono tracking-[0.1em]">
          <div class="flex items-center gap-2">
            <span class="text-[color:var(--accent)] font-bold">{{ String(idx + 1).padStart(2, '0') }}</span>
            <span v-if="p.year">{{ p.year }}</span>
          </div>
          <span
            v-if="p.featured"
            class="inline-flex items-center gap-1.5 bg-[color:var(--accent)] text-[color:var(--bg)] text-[0.65rem] font-bold px-2 py-0.5 tracking-[0.1em]"
          >
            <Icon icon="lucide:star" width="10" height="10" />
            {{ t.featured }}
          </span>
        </div>

        <header>
          <h3 class="m-0 text-[1.15rem] font-bold text-[color:var(--fg)] font-mono">{{ p.title }}</h3>
          <p class="mt-0.5 text-[0.8rem] text-[color:var(--accent)] opacity-85 font-mono">{{ p.subtitle }}</p>
        </header>

        <p class="m-0 text-[0.88rem] text-[color:var(--muted)] leading-[1.55] flex-1">{{ p.description }}</p>

        <ul class="flex flex-wrap gap-1.5 p-0 m-0 list-none">
          <li
            v-for="tech in p.stack"
            :key="tech"
            class="font-mono text-[0.7rem] px-2 py-0.5 text-[color:var(--muted)] border border-[color:var(--line)] tracking-[0.02em]"
          >
            {{ tech }}
          </li>
        </ul>

        <footer class="flex items-center gap-2 flex-wrap mt-1 pt-3.5 border-t border-dashed border-[color:var(--line)]">
          <a
            :href="p.repo"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[color:var(--accent)] text-[color:var(--bg)] no-underline font-semibold text-[0.78rem] font-mono tracking-[0.03em] border border-[color:var(--accent)] transition-colors duration-150 hover:bg-transparent hover:text-[color:var(--accent)]"
          >
            <Icon icon="lucide:github" width="14" height="14" />
            {{ t.repo_link }}
            <Icon icon="lucide:external-link" width="12" height="12" />
          </a>
          <a
            v-if="p.demo"
            :href="p.demo"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-transparent text-[color:var(--fg)] no-underline font-semibold text-[0.78rem] font-mono tracking-[0.03em] border border-[color:var(--line)] transition-colors duration-150 hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
          >
            {{ t.demo_link }}
            <Icon icon="lucide:external-link" width="12" height="12" />
          </a>
        </footer>
      </article>
    </div>
  </section>
</template>

<style scoped>
.project-card {
  background: var(--bg-soft);
  transition: background 0.15s ease;
  animation: fadeUp 0.4s ease-out backwards;
}

.project-card:hover {
  background: rgba(74, 222, 128, 0.04);
  z-index: 1;
}

.project-card.featured {
  background: rgba(74, 222, 128, 0.025);
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 640px) {
  .grid { grid-template-columns: 1fr; }
}
</style>