<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { Icon } from '@iconify/vue';
import { useLang } from '../stores/lang';
import { featured_slugs, translations } from '../data/site';

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
    C: '#555',
    'C++': '#f34b7d',
    'C#': '#178600',
  };
  return name && map[name] ? map[name] : '#8b949e';
}

async function load() {
  loading.value = true;
  error.value = null;
  try {
    const res = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: Repo[] = await res.json();
    const whitelist = new Set(featured_slugs);
    repos.value = data
      .filter((r) => !r.fork && whitelist.has(r.name))
      .sort((a, b) => new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime());
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
    <div class="live-header">
      <div class="live-status">
        <span class="status-dot" :class="{ ok: !loading && !error, err: error }"></span>
        <span class="status-text">
          {{ error ? 'OFFLINE' : (loading ? 'CONNECTING' : 'CONNECTED') }}
        </span>
      </div>
      <button type="button" class="refresh-btn" :disabled="loading" @click="load" :aria-label="t.sections.live_retry">
        <Icon icon="lucide:refresh" width="14" height="14" :class="{ spinning: loading }" />
      </button>
    </div>

    <div v-if="loading" class="state">
      <Icon icon="lucide:loader" width="16" height="16" class="spinner" />
      <span>{{ t.sections.live_loading }}</span>
    </div>

    <div v-else-if="error" class="state error">
      <Icon icon="lucide:alert-circle" width="16" height="16" />
      <span>{{ t.sections.live_error }}</span>
    </div>

    <ul v-else class="repo-grid">
      <li v-for="repo in repos" :key="repo.id" class="repo-card corner">
        <a :href="repo.html_url" target="_blank" rel="noopener noreferrer" class="repo-link">
          <header class="repo-head">
            <Icon icon="lucide:git-branch" width="14" height="14" class="repo-icon" />
            <span class="repo-name">{{ repo.name }}</span>
            <span class="repo-badge" v-if="featured_slugs.indexOf(repo.name) < 5">
              <Icon icon="lucide:star" width="12" height="12" />
            </span>
          </header>

          <p v-if="repo.description" class="repo-desc">{{ repo.description }}</p>

          <footer class="repo-foot">
            <span class="meta" v-if="repo.language">
              <span class="dot" :style="{ background: langColor(repo.language) }"></span>
              {{ repo.language }}
            </span>
            <span class="meta">
              <Icon icon="lucide:star" width="12" height="12" />
              {{ repo.stargazers_count }}
            </span>
            <span class="meta">
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

.live-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding: 0.5rem 0.75rem;
  background: var(--bg-soft);
  border: 1px solid var(--line);
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.75rem;
  letter-spacing: 0.1em;
}

.live-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--muted);
}

.status-dot {
  width: 8px;
  height: 8px;
  background: var(--muted);
}

.status-dot.ok { background: var(--accent); box-shadow: 0 0 6px var(--accent); }
.status-dot.err { background: #f85149; box-shadow: 0 0 6px #f85149; }

.refresh-btn {
  background: transparent;
  border: 1px solid var(--line);
  color: var(--muted);
  padding: 0.3rem 0.5rem;
  cursor: pointer;
  display: inline-flex;
  transition: color 0.15s ease, border-color 0.15s ease;
}

.refresh-btn:hover:not(:disabled) {
  color: var(--accent);
  border-color: var(--accent);
}

.refresh-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.spinning { animation: spin 0.8s linear infinite; }

.state {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--muted);
  padding: 1.5rem;
  justify-content: center;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.85rem;
  border: 1px dashed var(--line);
}

.state.error { color: #f85149; }

.spinner { animation: spin 0.8s linear infinite; }

@keyframes spin {
  to { transform: rotate(360deg); }
}

.repo-grid {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 0;
  border: 1px solid var(--line);
}

.repo-card {
  background: var(--bg-soft);
  transition: background 0.15s ease;
  border: 1px solid var(--line);
  margin: -1px 0 0 -1px;
  position: relative;
}

.repo-card:hover {
  background: rgba(74, 222, 128, 0.04);
  z-index: 1;
}

.repo-link {
  display: block;
  padding: 1rem;
  color: inherit;
  text-decoration: none;
}

.repo-head {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.repo-icon {
  color: var(--accent);
  flex-shrink: 0;
}

.repo-name {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-weight: 600;
  color: var(--fg);
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.9rem;
}

.repo-badge {
  color: var(--accent);
  display: inline-flex;
}

.repo-desc {
  font-size: 0.8rem;
  color: var(--muted);
  margin: 0 0 0.75rem 0;
  line-height: 1.45;
  min-height: 2.4em;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.repo-foot {
  display: flex;
  flex-wrap: wrap;
  gap: 0.85rem;
  font-size: 0.72rem;
  color: var(--muted);
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  border-top: 1px dashed var(--line);
  padding-top: 0.6rem;
}

.meta {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
}

.dot {
  display: inline-block;
  width: 8px;
  height: 8px;
}
</style>