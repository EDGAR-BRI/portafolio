<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { Icon } from '@iconify/vue';
import { useLang } from '../stores/lang';
import { featured_slugs, all_featured_slugs, translations } from '../data/site';

interface Repo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  language: string | null;
  updated_at: string;
  pushed_at: string;
  fork: boolean;
}

const lang = useLang();
const t = computed(() => translations[lang.value]);

const repos = ref<Repo[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

const username = 'EDGAR-BRI';

function formatDate(iso: string, locale: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function langColor(name: string | null): string {
  const map: Record<string, string> = {
    TypeScript: '#3178c6',
    JavaScript: '#f1e05a',
    Vue: '#41b883',
    Astro: '#ff5d01',
    Dart: '#00b4ab',
    PHP: '#4f5d95',
    HTML: '#e34c26',
    CSS: '#563d7c',
  };
  return name && map[name] ? map[name] : '#8b949e';
}

function isFeatured(name: string): boolean {
  return featured_slugs.includes(name);
}

async function load() {
  loading.value = true;
  error.value = null;
  try {
    const res = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: Repo[] = await res.json();
    const whitelist = new Set(all_featured_slugs);
    repos.value = data
      .filter((r) => !r.fork && whitelist.has(r.name))
      .sort((a, b) => {
        const aF = isFeatured(a.name) ? 0 : 1;
        const bF = isFeatured(b.name) ? 0 : 1;
        if (aF !== bF) return aF - bF;
        return new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime();
      });
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'unknown';
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>

<template>
  <section class="live-repos" id="live">
    <div class="flex items-center justify-between mb-4 px-3 py-2 bg-[color:var(--bg-soft)] border border-[color:var(--line)] font-mono text-[0.75rem] tracking-[0.1em]">
      <div class="flex items-center gap-2 text-[color:var(--muted)]">
        <span
          class="w-2 h-2"
          :class="{
            'bg-[color:var(--accent)] shadow-[0_0_6px_var(--accent)]': !loading && !error,
            'bg-[#f85149] shadow-[0_0_6px_#f85149]': error,
            'bg-[color:var(--muted)]': loading && !error
          }"
        ></span>
        <span>{{ error ? 'OFFLINE' : (loading ? 'CONNECTING' : 'CONNECTED') }}</span>
      </div>
      <button
        type="button"
        class="bg-transparent border border-[color:var(--line)] text-[color:var(--muted)] px-2 py-1 cursor-pointer inline-flex transition-colors duration-150 hover:text-[color:var(--accent)] hover:border-[color:var(--accent)] disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="loading"
        @click="load"
        :aria-label="t.sections.live_retry"
      >
        <Icon icon="lucide:refresh" width="14" height="14" :class="{ 'animate-spin': loading }" />
      </button>
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

    <ul v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 -m-px list-none p-0 m-0 border border-[color:var(--line)]">
      <li
        v-for="repo in repos"
        :key="repo.id"
        class="repo-card corner relative bg-[color:var(--bg-soft)] border border-[color:var(--line)] m-px transition-colors duration-150 hover:bg-[rgba(74,222,128,0.04)]"
      >
        <a :href="repo.html_url" target="_blank" rel="noopener noreferrer" class="block p-4 text-inherit no-underline">
          <header class="flex items-center gap-2 mb-2">
            <Icon icon="lucide:git-branch" width="14" height="14" class="text-[color:var(--accent)] shrink-0" />
            <span class="font-mono font-semibold text-[color:var(--fg)] flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-[0.9rem]">{{ repo.name }}</span>
            <span
              v-if="isFeatured(repo.name)"
              class="featured-tag inline-flex items-center gap-1 px-1.5 py-0.5 text-[0.6rem] font-bold tracking-[0.1em] bg-[color:var(--accent)] text-[color:var(--bg)] font-mono"
            >
              <Icon icon="lucide:star" width="9" height="9" />
              {{ t.featured }}
            </span>
          </header>

          <p
            v-if="repo.description"
            class="text-[0.8rem] text-[color:var(--muted)] m-0 mb-3 leading-[1.45] min-h-[2.4em] overflow-hidden"
            style="display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;"
          >{{ repo.description }}</p>

          <footer class="flex flex-wrap gap-3.5 text-[0.72rem] text-[color:var(--muted)] font-mono border-t border-dashed border-[color:var(--line)] pt-2.5">
            <span v-if="repo.language" class="inline-flex items-center gap-1.5">
              <span class="inline-block w-2 h-2" :style="{ background: langColor(repo.language) }"></span>
              {{ repo.language }}
            </span>
            <span class="inline-flex items-center gap-1.5">
              <Icon icon="lucide:star" width="12" height="12" />
              {{ repo.stargazers_count }}
            </span>
            <span class="inline-flex items-center gap-1.5">
              <Icon icon="lucide:clock" width="12" height="12" />
              {{ formatDate(repo.pushed_at, lang.value) }}
            </span>
          </footer>
        </a>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.live-repos {
  width: 100%;
}

.repo-card:hover {
  z-index: 1;
}
</style>