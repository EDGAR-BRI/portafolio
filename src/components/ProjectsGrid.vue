<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { Icon } from '@iconify/vue';
import { useLang } from '../stores/lang';
import { translations } from '../data/site';
import CyberButton from './CyberButton.vue';

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

type FilterKey = 'all' | 'featured' | 'fullstack' | 'frontend' | 'tools';

const selectedFilter = ref<FilterKey>('all');
const activeModalProject = ref<Project | null>(null);

const filterTabs: Record<FilterKey, { es: string; en: string; icon: string }> = {
  all: { es: 'Todos', en: 'All', icon: 'lucide:layers' },
  featured: { es: 'Destacados', en: 'Featured', icon: 'lucide:star' },
  fullstack: { es: 'Full-Stack', en: 'Full-Stack', icon: 'lucide:boxes' },
  frontend: { es: 'Frontend', en: 'Frontend', icon: 'lucide:layout' },
  tools: { es: 'Herramientas / CLI', en: 'Tools / CLI', icon: 'lucide:terminal' },
};

const currentLangProjects = computed(() => {
  return props.projects
    .filter((p) => p.lang === lang.value)
    .sort((a, b) => {
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      return a.order - b.order;
    });
});

function matchesFilter(p: Project, key: FilterKey): boolean {
  if (key === 'all') return true;
  if (key === 'featured') return Boolean(p.featured);
  const stackLower = (p.stack || []).map((s) => (s || '').toLowerCase());
  const titleLower = (p.title || '').toLowerCase();
  const descLower = (p.description || '').toLowerCase();
  const slugLower = (p.slug || p.title || '').toLowerCase();

  if (key === 'fullstack') {
    return (
      (stackLower.some((s) => ['adonisjs', 'node', 'nodejs', 'express', 'postgresql', 'supabase'].includes(s)) &&
        stackLower.some((s) => ['react', 'vue', 'astro', 'tailwind'].includes(s))) ||
      slugLower.includes('internship') ||
      slugLower.includes('guardtech') ||
      descLower.includes('facturación') ||
      descLower.includes('dashboard')
    );
  }
  if (key === 'frontend') {
    return stackLower.some((s) => ['vue', 'react', 'astro', 'tailwind', 'typescript', 'javascript'].includes(s));
  }
  if (key === 'tools') {
    return (
      stackLower.some((s) => ['cli', 'bash', 'linux', 'python'].includes(s)) ||
      titleLower.includes('trainer') ||
      titleLower.includes('linux') ||
      titleLower.includes('juego') ||
      titleLower.includes('memorizar')
    );
  }
  return true;
}

const visible = computed(() => {
  return currentLangProjects.value.filter((p) => matchesFilter(p, selectedFilter.value));
});

const filterCounts = computed(() => {
  const counts: Record<FilterKey, number> = {
    all: currentLangProjects.value.length,
    featured: 0,
    fullstack: 0,
    frontend: 0,
    tools: 0,
  };
  for (const p of currentLangProjects.value) {
    if (p.featured) counts.featured++;
    if (matchesFilter(p, 'fullstack')) counts.fullstack++;
    if (matchesFilter(p, 'frontend')) counts.frontend++;
    if (matchesFilter(p, 'tools')) counts.tools++;
  }
  return counts;
});

function openDetails(p: Project) {
  activeModalProject.value = p;
  if (typeof document !== 'undefined') {
    document.body.style.overflow = 'hidden';
  }
}

function closeDetails() {
  activeModalProject.value = null;
  if (typeof document !== 'undefined') {
    document.body.style.overflow = '';
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && activeModalProject.value) {
    closeDetails();
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
  if (typeof document !== 'undefined') {
    document.body.style.overflow = '';
  }
});
</script>

<template>
  <section class="projects-section my-12 sm:my-20" id="projects" aria-labelledby="projects-title">
    <div class="section-label">[ projects ]</div>
    <h2 id="projects-title" class="section-title">
      <span class="hash" aria-hidden="true">#</span>
      {{ t.sections.projects_title }}
    </h2>
    <p class="section-sub">{{ t.sections.projects_subtitle }}</p>

    <!-- Filter Bar Matching Live & Contributions Header Style -->
    <div class="flex items-center justify-between mb-4 px-3 py-2 bg-[color:var(--bg-soft)] border border-[color:var(--line)] font-mono text-[0.75rem] tracking-[0.08em] flex-wrap gap-2">
      <div class="flex items-center gap-2 text-[color:var(--fg)] min-w-0">
        <Icon icon="lucide:folder-git-2" width="14" height="14" class="text-[color:var(--accent)] shrink-0" />
        <span class="font-bold truncate">projects_archive</span>
        <span class="text-[color:var(--accent)] font-semibold">· {{ visible.length }}</span>
      </div>

      <!-- Category Filter Chips -->
      <div class="filter-track flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        <button
          v-for="(meta, key) in filterTabs"
          :key="key"
          type="button"
          class="filter-chip"
          :class="{ active: selectedFilter === key }"
          @click="selectedFilter = key as FilterKey"
        >
          <Icon :icon="meta.icon" width="12" height="12" class="shrink-0" />
          <span>{{ lang === 'es' ? meta.es : meta.en }}</span>
          <span class="chip-count">{{ filterCounts[key] ?? 0 }}</span>
        </button>
      </div>
    </div>

    <!-- Monolithic Grid Matching Live & Skills Section Style -->
    <ul class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 -m-px list-none p-0 m-0 border border-[color:var(--line)]">
      <li
        v-for="(p, idx) in visible"
        :key="p.slug || p.title"
        class="project-card corner relative bg-[color:var(--bg-soft)] border border-[color:var(--line)] m-px p-4 sm:p-5 flex flex-col justify-between transition-colors duration-150 hover:bg-[rgba(74,222,128,0.04)]"
      >
        <div>
          <!-- Header: Meta & Featured Badge -->
          <header class="flex items-center justify-between gap-2 mb-3 font-mono text-[0.72rem] text-[color:var(--muted)]">
            <div class="flex items-center gap-2 min-w-0">
              <Icon icon="lucide:git-branch" width="13" height="13" class="text-[color:var(--accent)] shrink-0" />
              <span class="text-[color:var(--accent)] font-bold">{{ String(idx + 1).padStart(2, '0') }}.</span>
              <span class="truncate opacity-80">~/{{ p.slug || p.title.toLowerCase().replace(/\s+/g, '-') }}</span>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <time v-if="p.year" :datetime="p.year" class="meta-year text-[0.68rem] px-1.5 py-0.5 border border-[color:var(--line)] bg-[rgba(255,255,255,0.02)]">{{ p.year }}</time>
              <span
                v-if="p.featured"
                class="featured-tag inline-flex items-center gap-1 px-1.5 py-0.5 text-[0.62rem] font-bold tracking-[0.1em] bg-[color:var(--accent)] text-[color:var(--bg)] font-mono uppercase"
              >
                <Icon icon="lucide:star" width="9" height="9" />
                {{ t.featured }}
              </span>
            </div>
          </header>

          <!-- Project Title & Subtitle -->
          <div class="mb-2 min-h-[3.2rem]">
            <h3 class="m-0 font-mono font-bold text-[1.05rem] text-[color:var(--fg)] tracking-tight flex items-center gap-1.5">
              <span class="text-[color:var(--accent)] text-[0.8rem]">&gt;</span>
              <span>{{ p.title }}</span>
            </h3>
            <p class="m-0 font-mono text-[0.76rem] text-[color:var(--accent-2)] mt-0.5 line-clamp-1" :title="p.subtitle">
              {{ p.subtitle }}
            </p>
          </div>

          <!-- Project Description with Details Trigger -->
          <div class="desc-container mb-4">
            <p class="project-desc text-[0.82rem] text-[color:var(--muted)] m-0 leading-[1.5] line-clamp-3" :title="p.description">
              {{ p.description }}
            </p>
            <button
              type="button"
              class="expand-btn font-mono text-[0.7rem] text-[color:var(--accent)] hover:underline inline-flex items-center gap-1 mt-1 bg-transparent border-0 p-0 cursor-pointer"
              @click="openDetails(p)"
            >
              <span>[{{ lang === 'es' ? '+ detalles' : '+ details' }}]</span>
              <Icon icon="lucide:arrow-up-right" width="11" height="11" />
            </button>
          </div>

          <!-- Tech Stack Chips (Standardized height & clean 2-line wrap) -->
          <ul v-if="p.stack.length" class="project-stack list-none p-0 m-0" aria-label="Tech stack">
            <li
              v-for="tech in p.stack"
              :key="tech"
              class="chip"
            >
              {{ tech }}
            </li>
          </ul>
        </div>

        <!-- Card Footer Actions Pinned to Baseline -->
        <footer class="flex items-center gap-2 pt-3 border-t border-dashed border-[color:var(--line)] mt-auto flex-wrap font-mono text-[0.75rem]">
          <CyberButton
            :href="p.repo"
            variant="primary"
            size="sm"
            icon="lucide:github"
            target="_blank"
            class="flex-1"
            :aria-label="`${t.repo_link}: ${p.title}`"
          >
            {{ t.repo_link }}
          </CyberButton>

          <CyberButton
            v-if="p.demo"
            :href="p.demo"
            variant="secondary"
            size="sm"
            icon="lucide:play"
            target="_blank"
            :aria-label="`${t.demo_link}: ${p.title}`"
          >
            {{ t.demo_link }}
          </CyberButton>
        </footer>
      </li>
    </ul>

    <!-- Cyber Terminal Detail Modal -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div
          v-if="activeModalProject"
          class="modal-backdrop fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[rgba(6,8,11,0.85)] backdrop-blur-sm"
          @click.self="closeDetails"
        >
          <div
            class="modal-card corner relative w-full max-w-2xl bg-[color:var(--bg-soft)] border border-[color:var(--line)] shadow-2xl p-5 sm:p-7 max-h-[90vh] overflow-y-auto"
            role="dialog"
            aria-modal="true"
            :aria-labelledby="`modal-${activeModalProject.slug}-title`"
          >
            <!-- Modal Header -->
            <div class="flex items-center justify-between pb-3 mb-4 border-b border-[color:var(--line)] font-mono text-[0.75rem]">
              <div class="flex items-center gap-2 text-[color:var(--fg)] min-w-0">
                <Icon icon="lucide:terminal" width="14" height="14" class="text-[color:var(--accent)] shrink-0" />
                <span class="text-[color:var(--muted)] truncate">man ~/projects/{{ activeModalProject.slug }}</span>
              </div>
              <button
                type="button"
                class="close-modal-btn text-[color:var(--muted)] hover:text-[color:var(--accent)] bg-transparent border-0 cursor-pointer inline-flex items-center gap-1 font-mono text-[0.75rem]"
                @click="closeDetails"
                :aria-label="lang === 'es' ? 'Cerrar ventana' : 'Close modal'"
              >
                <span>[ESC]</span>
                <Icon icon="lucide:x" width="16" height="16" />
              </button>
            </div>

            <!-- Project Title & Subtitle in Modal -->
            <div class="mb-4">
              <div class="flex items-center gap-2 flex-wrap mb-1.5">
                <span class="text-[color:var(--accent)] font-mono font-bold text-[1.1rem]">&gt;</span>
                <h3 :id="`modal-${activeModalProject.slug}-title`" class="m-0 font-mono font-bold text-[1.25rem] text-[color:var(--fg)]">
                  {{ activeModalProject.title }}
                </h3>
                <span
                  v-if="activeModalProject.featured"
                  class="featured-tag inline-flex items-center gap-1 px-1.5 py-0.5 text-[0.62rem] font-bold tracking-[0.1em] bg-[color:var(--accent)] text-[color:var(--bg)] font-mono uppercase ml-auto"
                >
                  <Icon icon="lucide:star" width="9" height="9" />
                  {{ t.featured }}
                </span>
              </div>
              <p class="m-0 font-mono text-[0.85rem] text-[color:var(--accent-2)]">
                {{ activeModalProject.subtitle }}
              </p>
            </div>

            <!-- Full Description in Modal -->
            <div class="modal-body mb-6">
              <h4 class="font-mono text-[0.72rem] uppercase tracking-wider text-[color:var(--muted)] mb-2">
                // {{ lang === 'es' ? 'Descripción completa del proyecto' : 'Full Project Overview' }}
              </h4>
              <p class="text-[0.9rem] text-[color:var(--fg)] leading-[1.65] font-sans m-0 bg-[rgba(255,255,255,0.02)] p-4 border border-[color:var(--line)] rounded-[2px]">
                {{ activeModalProject.description }}
              </p>
            </div>

            <!-- Full Tech Stack in Modal -->
            <div class="mb-6">
              <h4 class="font-mono text-[0.72rem] uppercase tracking-wider text-[color:var(--muted)] mb-2">
                // {{ lang === 'es' ? 'Stack tecnológico implementado' : 'Tech Stack' }}
              </h4>
              <ul class="list-none p-0 m-0 flex flex-wrap gap-2">
                <li
                  v-for="tech in activeModalProject.stack"
                  :key="tech"
                  class="modal-chip font-mono text-[0.75rem] px-2.5 py-1 border border-[color:var(--line)] bg-[rgba(74,222,128,0.05)] text-[color:var(--fg)]"
                >
                  <span class="text-[color:var(--accent)] mr-1">#</span>{{ tech }}
                </li>
              </ul>
            </div>

            <!-- Modal Footer Actions -->
            <div class="flex items-center justify-between gap-3 pt-4 border-t border-[color:var(--line)] font-mono text-[0.8rem] flex-wrap">
              <div class="flex items-center gap-2.5 flex-wrap">
                <CyberButton
                  :href="activeModalProject.repo"
                  variant="primary"
                  size="md"
                  icon="lucide:github"
                  target="_blank"
                >
                  {{ lang === 'es' ? 'Ver en GitHub' : 'View on GitHub' }}
                </CyberButton>

                <CyberButton
                  v-if="activeModalProject.demo"
                  :href="activeModalProject.demo"
                  variant="secondary"
                  size="md"
                  icon="lucide:play"
                  target="_blank"
                >
                  {{ lang === 'es' ? 'Ver demo en vivo' : 'Live Demo' }}
                </CyberButton>
              </div>

              <CyberButton
                variant="secondary"
                size="sm"
                @click="closeDetails"
              >
                {{ lang === 'es' ? 'Cerrar' : 'Close' }}
              </CyberButton>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </section>
</template>

<style scoped>
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
  gap: 0.35rem;
  padding: 0.2rem 0.5rem;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.7rem;
  font-weight: 500;
  border-radius: 2px;
  border: 1px solid var(--line);
  background: rgba(255, 255, 255, 0.02);
  color: var(--muted);
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease;
}

.filter-chip:hover {
  border-color: var(--accent);
  color: var(--fg);
}

.filter-chip.active {
  border-color: var(--accent);
  color: var(--accent);
  background: rgba(74, 222, 128, 0.12);
  font-weight: 600;
}

.chip-count {
  font-size: 0.62rem;
  padding: 0.05rem 0.25rem;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.05);
  color: inherit;
}

.project-card:hover {
  z-index: 2;
}

.desc-container {
  min-height: 4.8rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.expand-btn {
  transition: color 0.15s ease;
}

.project-stack {
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  gap: 0.35rem;
  min-height: 3.25rem;
  margin-bottom: 0.85rem;
}

.chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 22px;
  padding: 0 0.45rem;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.68rem;
  line-height: 1;
  color: var(--fg);
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--line);
  border-radius: 2px;
  letter-spacing: 0.02em;
  white-space: nowrap;
  transition: all 0.15s ease;
  flex-shrink: 0;
}

.project-card:hover .chip {
  border-color: rgba(74, 222, 128, 0.25);
}

.action-btn {
  border-radius: 2px;
}

.primary-btn:hover .btn-icon {
  color: #06080b !important;
}

.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-card {
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.8), 0 0 15px rgba(74, 222, 128, 0.15);
}
</style>