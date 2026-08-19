<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
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
    <div class="flex items-center justify-between mb-3 px-3 py-1.5 bg-[color:var(--bg-soft)] border border-[color:var(--line)] font-mono text-[0.75rem] tracking-[0.1em]">
      <div class="flex items-center gap-2 text-[color:var(--muted)]">
        <Icon icon="lucide:terminal" width="13" height="13" class="text-[color:var(--accent)]" />
        <span>gh-stack — {{ username }}</span>
      </div>
      <div class="flex items-center gap-3">
        <span class="text-[color:var(--muted)]" v-if="!loading && !error && data">
          {{ totalRepos }} {{ lang === 'es' ? 'repos' : 'repos' }}
        </span>
        <button
          type="button"
          class="bg-transparent border border-[color:var(--line)] text-[color:var(--muted)] px-1.5 py-0.5 cursor-pointer inline-flex items-center transition-colors duration-150 hover:text-[color:var(--accent)] hover:border-[color:var(--accent)] disabled:opacity-50"
          :disabled="loading"
          @click="refresh"
          :aria-label="t.sections.live_retry"
        >
          <Icon icon="lucide:refresh" width="12" height="12" :class="{ 'animate-spin': loading }" />
        </button>
      </div>
    </div>

    <div
      v-if="loading"
      class="flex items-center gap-3 text-[color:var(--muted)] py-6 justify-center font-mono text-[0.85rem] border border-dashed border-[color:var(--line)]"
    >
      <Icon icon="lucide:loader" width="16" height="16" class="animate-spin" />
      <span>{{ t.sections.live_loading }}</span>
    </div>

    <div
      v-else-if="error"
      class="flex items-center gap-3 text-[#f85149] py-6 justify-center font-mono text-[0.85rem] border border-dashed border-[#f85149]"
    >
      <Icon icon="lucide:alert-circle" width="16" height="16" />
      <span>{{ t.sections.live_error }}</span>
    </div>

    <ul
      v-else-if="languages.length"
      class="list-none p-0 m-0 border border-[color:var(--line)]"
    >
      <li
        v-for="(l, i) in languages"
        :key="l.name"
        class="lang-row flex items-center gap-2.5 sm:gap-3.5 px-3 py-2.5 sm:px-4 sm:py-3 border-b border-[color:var(--line)] last:border-b-0 font-mono hover:bg-[rgba(74,222,128,0.04)] transition-colors duration-150"
        :style="{ animationDelay: `${i * 0.03}s` }"
      >
        <Icon :icon="l.icon" width="16" height="16" class="shrink-0" />
        <span class="w-20 sm:w-24 shrink-0 text-[0.75rem] sm:text-[0.8rem] text-[color:var(--fg)] truncate">{{ l.name }}</span>
        <div class="flex-1 h-4 flex items-center min-w-[30px]">
          <div
            class="h-2.5 sm:h-3 transition-[width] duration-700 ease-out rounded-[1px]"
            :style="{
              width: l.pct + '%',
              background: langColor(l.name),
              opacity: 0.75,
              boxShadow: `0 0 10px ${langColor(l.name)}44`,
            }"
            :title="`${l.name}: ${l.count} repos (${l.pct}%)`"
          ></div>
        </div>
        <span class="w-7 sm:w-10 shrink-0 text-right text-[0.7rem] sm:text-[0.75rem] text-[color:var(--muted)]">{{ l.count }}</span>
        <span class="w-9 sm:w-12 shrink-0 text-right text-[0.7rem] sm:text-[0.75rem] text-[color:var(--accent)] font-bold">{{ l.pct }}%</span>
      </li>
    </ul>

    <div
      v-else
      class="text-[color:var(--muted)] py-6 text-center font-mono text-[0.85rem] border border-dashed border-[color:var(--line)]"
    >
      No data
    </div>
  </section>
</template>

<style scoped>
.github-langs {
  width: 100%;
}

.lang-row {
  animation: fadeIn 0.35s ease-out backwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateX(-6px); }
  to { opacity: 1; transform: translateX(0); }
}
</style>