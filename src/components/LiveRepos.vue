<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
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
    Python: '#3572A5',
  };
  return name && map[name] ? map[name] : '#8b949e';
}

onMounted(async () => {
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
});
</script>

<template>
  <section class="live-repos">
    <div v-if="loading" class="state">
      <span class="spinner" aria-hidden="true"></span>
      <span>{{ t.sections.live_loading }}</span>
    </div>

    <div v-else-if="error" class="state error">
      <span>⚠ {{ t.sections.live_error }}</span>
    </div>

    <ul v-else class="repo-grid">
      <li v-for="repo in repos" :key="repo.id" class="repo-card">
        <a :href="repo.html_url" target="_blank" rel="noopener noreferrer" class="repo-link">
          <header class="repo-head">
            <svg class="repo-icon" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z"/>
            </svg>
            <span class="repo-name">{{ repo.name }}</span>
            <span class="repo-badge" v-if="featured_slugs.indexOf(repo.name) < 5">★</span>
          </header>

          <p v-if="repo.description" class="repo-desc">
            {{ lang.value === 'en'
              ? (repo.description.length > 90 ? repo.description.slice(0, 90) + '…' : repo.description)
              : (repo.description.length > 90 ? repo.description.slice(0, 90) + '…' : repo.description)
            }}
          </p>

          <footer class="repo-foot">
            <span class="meta" v-if="repo.language">
              <span class="dot" :style="{ background: langColor(repo.language) }"></span>
              {{ repo.language }}
            </span>
            <span class="meta stars">⭐ {{ repo.stargazers_count }} {{ t.sections.live_stars }}</span>
            <span class="meta updated">{{ t.sections.live_updated }} {{ formatDate(repo.pushed_at, lang.value) }}</span>
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

.state {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--muted);
  padding: 2rem;
  justify-content: center;
}

.state.error {
  color: #f85149;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.repo-grid {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.repo-card {
  background: rgba(22, 27, 34, 0.6);
  border: 1px solid var(--border);
  border-radius: 12px;
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
  backdrop-filter: blur(6px);
}

.repo-card:hover {
  transform: translateY(-2px);
  border-color: var(--accent);
  box-shadow: 0 4px 20px rgba(74, 222, 128, 0.1);
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
  width: 16px;
  height: 16px;
  color: var(--muted);
  flex-shrink: 0;
}

.repo-name {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-weight: 600;
  color: var(--accent);
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.95rem;
}

.repo-badge {
  color: var(--accent);
  font-size: 0.9rem;
}

.repo-desc {
  font-size: 0.85rem;
  color: var(--muted);
  margin: 0 0 0.75rem 0;
  line-height: 1.4;
  min-height: 2.4em;
}

.repo-foot {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  font-size: 0.75rem;
  color: var(--muted);
}

.meta {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
}

.dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
}
</style>