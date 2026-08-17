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
  <section class="projects-section" id="projects" aria-labelledby="projects-title">
    <div class="section-label">[ projects ]</div>
    <h2 id="projects-title" class="section-title">
      <span class="hash" aria-hidden="true">#</span>
      {{ t.sections.projects_title }}
    </h2>
    <p class="section-sub">{{ t.sections.projects_subtitle }}</p>

    <ol class="projects-grid" aria-label="List of projects">
      <li
        v-for="(p, idx) in visible"
        :key="p.slug"
        class="project-card-wrap"
        :style="{ animationDelay: `${idx * 0.04}s` }"
      >
        <article
          class="project-card corner"
          :class="{ featured: p.featured }"
          :aria-labelledby="`project-${p.slug}-title`"
        >
          <header class="card-head">
            <div class="card-meta">
              <span class="meta-num">{{ String(idx + 1).padStart(2, '0') }}</span>
              <time v-if="p.year" :datetime="p.year" class="meta-year">{{ p.year }}</time>
            </div>
            <span v-if="p.featured" class="badge">
              <Icon icon="lucide:star" width="10" height="10" aria-hidden="true" />
              {{ t.featured }}
            </span>
          </header>

          <h3 :id="`project-${p.slug}-title`" class="project-title">{{ p.title }}</h3>
          <p class="project-subtitle">{{ p.subtitle }}</p>

          <p class="project-description">{{ p.description }}</p>

          <ul v-if="p.stack.length" class="project-stack" aria-label="Tech stack">
            <li v-for="tech in p.stack" :key="tech" class="chip">{{ tech }}</li>
          </ul>

          <footer class="card-foot">
            <a
              :href="p.repo"
              target="_blank"
              rel="noopener noreferrer"
              class="btn primary"
              :aria-label="`${t.repo_link}: ${p.title}`"
            >
              <Icon icon="lucide:github" width="14" height="14" aria-hidden="true" />
              {{ t.repo_link }}
              <Icon icon="lucide:external-link" width="12" height="12" aria-hidden="true" />
            </a>
            <a
              v-if="p.demo"
              :href="p.demo"
              target="_blank"
              rel="noopener noreferrer"
              class="btn ghost"
              :aria-label="`${t.demo_link}: ${p.title}`"
            >
              {{ t.demo_link }}
              <Icon icon="lucide:external-link" width="12" height="12" aria-hidden="true" />
            </a>
          </footer>
        </article>
      </li>
    </ol>
  </section>
</template>

<style scoped>
.projects-section {
  margin: 4rem 0;
}

.projects-grid {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: 1fr;
  border: 1px solid var(--line);
}

@media (min-width: 640px) {
  .projects-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (min-width: 1024px) {
  .projects-grid { grid-template-columns: repeat(3, 1fr); }
}

.project-card-wrap {
  display: flex;
}

.project-card {
  position: relative;
  background: var(--bg-soft);
  border: 1px solid var(--line);
  margin: -1px 0 0 -1px;
  padding: 1.4rem;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  width: 100%;
  transition: background 0.15s ease;
  animation: fadeUp 0.4s ease-out backwards;
  min-height: 260px;
}

.project-card:hover {
  background: rgba(74, 222, 128, 0.04);
  z-index: 1;
}

.project-card.featured {
  background: rgba(74, 222, 128, 0.025);
}

.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.7rem;
  color: var(--muted);
  letter-spacing: 0.1em;
}

.card-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.meta-num {
  color: var(--accent);
  font-weight: 700;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  background: var(--accent);
  color: var(--bg);
  font-size: 0.65rem;
  font-weight: 700;
  padding: 0.15rem 0.5rem;
  letter-spacing: 0.1em;
}

.project-title {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--fg);
  font-family: 'JetBrains Mono', ui-monospace, monospace;
}

.project-subtitle {
  margin: 0.2rem 0 0 0;
  font-size: 0.8rem;
  color: var(--accent);
  opacity: 0.85;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
}

.project-description {
  margin: 0;
  font-size: 0.88rem;
  color: var(--muted);
  line-height: 1.55;
  flex: 1;
}

.project-stack {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.chip {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.7rem;
  padding: 0.2rem 0.55rem;
  background: transparent;
  color: var(--muted);
  border: 1px solid var(--line);
  letter-spacing: 0.02em;
}

.card-foot {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 0.25rem;
  padding-top: 0.85rem;
  border-top: 1px dashed var(--line);
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.45rem 0.75rem;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.78rem;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  letter-spacing: 0.03em;
  border: 1px solid var(--accent);
  transition: background 0.15s ease, color 0.15s ease;
  cursor: pointer;
}

.btn.primary {
  background: var(--accent);
  color: var(--bg);
}

.btn.primary:hover {
  background: transparent;
  color: var(--accent);
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

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>