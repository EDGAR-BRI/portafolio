<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { Icon } from '@iconify/vue';
import { useLang } from '../stores/lang';
import { translations } from '../data/site';
import { useCachedFetch, clearCached } from '../composables/useGitHubCache';

interface Repo {
  id: number;
  name: string;
  language: string | null;
  fork: boolean;
}

interface LangStat {
  name: string;
  count: number;
  pct: number;
  icon: string;
}

const lang = useLang();
const t = computed(() => translations[lang.value]);

const username = 'EDGAR-BRI';
const API_URL = `https://api.github.com/users/${username}/repos?per_page=100`;
const CACHE_KEY = `gh-cache:repos:${username}`;

const { data, loading, error, load } = useCachedFetch<Repo[]>(API_URL);

const languages = computed<LangStat[]>(() => {
  if (!data.value) return [];
  const counts = new Map<string, number>();
  for (const r of data.value) {
    if (r.fork || !r.language) continue;
    counts.set(r.language, (counts.get(r.language) ?? 0) + 1);
  }
  const total = [...counts.values()].reduce((a, b) => a + b, 0);
  return [...counts.entries()]
    .map(([name, count]) => ({
      name,
      count,
      pct: Math.round((count / total) * 100),
      icon: langIcon(name),
    }))
    .sort((a, b) => b.count - a.count);
});

const totalRepos = computed(() => (data.value ?? []).filter((r) => !r.fork).length);

const languageIcons: Record<string, string> = {
  JavaScript: 'logos:javascript',
  TypeScript: 'logos:typescript-icon',
  Vue: 'logos:vue',
  Astro: 'logos:astro-icon',
  Dart: 'logos:dart',
  PHP: 'logos:php',
  HTML: 'logos:html-5',
  CSS: 'logos:css-3',
  'C#': 'logos:c-sharp',
  C: 'simple-icons:c',
  'C++': 'logos:c-plusplus',
  Python: 'logos:python',
  Go: 'logos:go',
  Rust: 'logos:rust',
  Java: 'logos:java',
  Sass: 'logos:sass',
};

const languageColors: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Vue: '#41b883',
  Astro: '#ff5d01',
  Dart: '#00b4ab',
  PHP: '#4f5d95',
  HTML: '#e34c26',
  CSS: '#563d7c',
  'C#': '#178600',
  C: '#555555',
  'C++': '#f34b7d',
  Python: '#3572a5',
  Go: '#00add8',
  Rust: '#dea584',
  Java: '#b07219',
  Sass: '#a53b70',
};

function langColor(name: string): string {
  return languageColors[name] ?? '#8b949e';
}

function langIcon(name: string): string {
  return languageIcons[name] ?? 'lucide:file-code-2';
}

function refresh() {
  clearCached(CACHE_KEY);
  load(true);
}

onMounted(() => load());
</script>

<template>
  <section class="github-langs">
    <div class="header-bar flex items-center justify-between mb-3 px-3 py-2 bg-[color:var(--bg-soft)] border border-[color:var(--line)] font-mono text-[0.75rem] tracking-[0.08em]">
      <div class="flex items-center gap-2 text-[color:var(--fg)] min-w-0">
        <Icon icon="lucide:terminal" width="14" height="14" class="text-[color:var(--accent)] shrink-0" />
        <span class="font-bold truncate">gh-stack</span>
        <span class="text-[color:var(--muted)] text-[0.7rem] hidden sm:inline truncate">/ {{ username }}</span>
      </div>
      <div class="flex items-center gap-2.5 shrink-0">
        <span class="text-[color:var(--muted)] text-[0.7rem]" v-if="!loading && !error && data">
          {{ totalRepos }} {{ lang === 'es' ? 'repos' : 'repos' }}
        </span>
        <button
          type="button"
          class="refresh-btn"
          :disabled="loading"
          @click="refresh"
          :title="lang === 'es' ? 'Recargar stack' : 'Refresh stack'"
          :aria-label="lang === 'es' ? 'Recargar stack' : 'Refresh stack'"
        >
          <Icon icon="lucide:refresh-cw" width="12" height="12" :class="{ 'animate-spin': loading }" />
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div
      v-if="loading"
      class="state-box loading-box flex-1"
    >
      <Icon icon="lucide:loader" width="16" height="16" class="animate-spin text-[color:var(--accent)]" />
      <span>{{ t.sections.live_loading }}</span>
    </div>

    <!-- Error State -->
    <div
      v-else-if="error"
      class="state-box error-box flex-1"
    >
      <Icon icon="lucide:alert-circle" width="16" height="16" />
      <span>{{ t.sections.live_error }}</span>
      <button type="button" class="retry-inline-btn" @click="refresh">
        {{ lang === 'es' ? 'Reintentar' : 'Retry' }}
      </button>
    </div>

    <!-- Languages Container with List & Summary Footer -->
    <div v-else-if="languages.length" class="langs-container border border-[color:var(--line)] bg-[rgba(6,8,11,0.4)] flex-1 flex flex-col justify-between">
      <ul class="langs-list list-none p-0 m-0 flex-1 flex flex-col justify-between">
        <li
          v-for="(l, i) in languages.slice(0, 8)"
          :key="l.name"
          class="lang-row flex items-center gap-2.5 sm:gap-3 px-3 py-2 sm:px-4 border-b border-[color:var(--line)] last:border-b-0 font-mono hover:bg-[rgba(74,222,128,0.04)] transition-colors duration-150"
          :style="{ animationDelay: `${i * 0.03}s` }"
        >
          <Icon :icon="l.icon" width="15" height="15" class="shrink-0" />
          <span class="w-20 sm:w-24 shrink-0 text-[0.75rem] sm:text-[0.78rem] text-[color:var(--fg)] truncate font-medium">{{ l.name }}</span>
          <div class="flex-1 h-3.5 flex items-center min-w-[30px]">
            <div
              class="h-2 sm:h-2.5 transition-[width] duration-700 ease-out rounded-[1px]"
              :style="{
                width: l.pct + '%',
                background: langColor(l.name),
                opacity: 0.85,
                boxShadow: `0 0 8px ${langColor(l.name)}44`,
              }"
              :title="`${l.name}: ${l.count} repos (${l.pct}%)`"
            ></div>
          </div>
          <span class="w-6 sm:w-8 shrink-0 text-right text-[0.68rem] sm:text-[0.72rem] text-[color:var(--muted)]">{{ l.count }}</span>
          <span class="w-8 sm:w-10 shrink-0 text-right text-[0.68rem] sm:text-[0.72rem] text-[color:var(--accent)] font-bold">{{ l.pct }}%</span>
        </li>
      </ul>

      <!-- Summary Footer -->
      <div class="langs-footer flex items-center justify-between px-3 py-2 border-t border-[color:var(--line)] font-mono text-[0.68rem] text-[color:var(--muted)] bg-[color:var(--bg-soft)]">
        <span class="truncate">
          <span class="text-[color:var(--accent)] font-bold">&gt;</span>
          {{ lang === 'es' ? 'Lenguaje principal' : 'Top language' }}:
          <span class="text-[color:var(--fg)] font-semibold">{{ languages[0]?.name }}</span>
        </span>
        <span class="shrink-0 text-[color:var(--muted)]">
          {{ languages.length }} {{ lang === 'es' ? 'detectados' : 'detected' }}
        </span>
      </div>
    </div>

    <div
      v-else
      class="state-box empty-box flex-1"
    >
      <Icon icon="lucide:inbox" width="16" height="16" class="text-[color:var(--muted)]" />
      <span>No data</span>
    </div>
  </section>
</template>

<style scoped>
.github-langs {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.refresh-btn {
  background: transparent;
  border: 1px solid var(--line);
  color: var(--muted);
  padding: 0.25rem 0.45rem;
  border-radius: 2px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.refresh-btn:hover:not(:disabled) {
  border-color: var(--accent);
  color: var(--accent);
  background: rgba(74, 222, 128, 0.08);
}

.refresh-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.state-box {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 2rem 1rem;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.82rem;
  border: 1px dashed var(--line);
  color: var(--muted);
}

.error-box {
  border-color: #f85149;
  color: #f85149;
  background: rgba(248, 81, 73, 0.04);
}

.retry-inline-btn {
  background: transparent;
  border: 1px solid #f85149;
  color: #f85149;
  font-family: inherit;
  font-size: 0.75rem;
  padding: 0.2rem 0.5rem;
  cursor: pointer;
  border-radius: 2px;
  transition: all 0.15s ease;
}

.retry-inline-btn:hover {
  background: #f85149;
  color: #06080b;
}

.lang-row {
  flex: 1;
  min-height: 38px;
  animation: fadeIn 0.35s ease-out backwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateX(-6px); }
  to { opacity: 1; transform: translateX(0); }
}
</style>