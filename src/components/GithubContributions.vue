<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { Icon } from '@iconify/vue';
import { useLang } from '../stores/lang';
import { translations } from '../data/site';
import { useCachedFetch, clearCached } from '../composables/useGitHubCache';

interface RawEvent {
  id: string;
  type: string;
  repo: { name: string; url: string };
  created_at: string;
  payload: {
    ref?: string;
    ref_type?: string;
    commits_count?: number;
    size?: number;
    action?: string;
    pull_request?: { html_url?: string; title?: string; state?: string };
    release?: { name?: string; tag_name?: string };
    description?: string;
  };
}

interface EventItem {
  id: string;
  type: string;
  repoName: string;
  repoUrl: string;
  timeAgo: string;
  action: string;
  count?: number;
  branch?: string;
  detail?: string;
  prTitle?: string;
  prUrl?: string;
  releaseName?: string;
}

const lang = useLang();
const t = computed(() => translations[lang.value]);

const username = 'EDGAR-BRI';
const API_URL = `https://api.github.com/users/${username}/events/public?per_page=30`;
const CACHE_KEY = `gh-cache:events:${username}`;

const { data, loading, error, load } = useCachedFetch<RawEvent[]>(API_URL);

function typeLabel(type: string): { icon: string; color: string; label: string } {
  switch (type) {
    case 'PushEvent':
      return { icon: 'lucide:git-commit', color: '#4ade80', label: 'push' };
    case 'PullRequestEvent':
      return { icon: 'lucide:git-pull-request', color: '#22d3ee', label: 'PR' };
    case 'IssuesEvent':
      return { icon: 'lucide:circle-dot', color: '#f1e05a', label: 'issue' };
    case 'ReleaseEvent':
      return { icon: 'lucide:tag', color: '#f85149', label: 'release' };
    case 'CreateEvent':
      return { icon: 'lucide:folder-plus', color: '#8b949e', label: 'create' };
    case 'ForkEvent':
      return { icon: 'lucide:git-branch', color: '#a371f7', label: 'fork' };
    case 'WatchEvent':
      return { icon: 'lucide:star', color: '#ffbd2e', label: 'star' };
    case 'DeleteEvent':
      return { icon: 'lucide:trash-2', color: '#8b949e', label: 'delete' };
    default:
      return { icon: 'lucide:activity', color: '#8b949e', label: type.replace('Event', '').toLowerCase() };
  }
}

function branchFromRef(ref?: string): string | undefined {
  if (!ref) return undefined;
  const m = ref.match(/^refs\/heads\/(.+)$/);
  return m ? m[1] : ref;
}

function timeAgo(iso: string, locale: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return locale === 'es' ? 'ahora' : 'now';
  if (mins < 60) return locale === 'es' ? `hace ${mins} min` : `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return locale === 'es' ? `hace ${hrs} h` : `${hrs} h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return locale === 'es' ? `hace ${days} d` : `${days} d ago`;
  const months = Math.floor(days / 30);
  return locale === 'es' ? `hace ${months} m` : `${months} mo ago`;
}

function detailFor(ev: RawEvent): { count?: number; branch?: string; detail?: string; prTitle?: string; prUrl?: string; releaseName?: string } {
  const p = ev.payload;
  const branch = branchFromRef(p.ref);
  if (ev.type === 'PushEvent') {
    const n = p.size ?? p.commits_count;
    return { count: n, branch, detail: n ? `${n} commit${n === 1 ? '' : 's'} → ${branch ?? '—'}` : branch };
  }
  if (ev.type === 'PullRequestEvent') {
    return { detail: p.action, prTitle: p.pull_request?.title, prUrl: p.pull_request?.html_url };
  }
  if (ev.type === 'ReleaseEvent') {
    return { detail: p.action, releaseName: p.release?.name ?? p.release?.tag_name };
  }
  if (ev.type === 'CreateEvent') return { detail: p.ref_type };
  return {};
}

const events = computed<EventItem[]>(() => {
  if (!data.value) return [];
  const seen = new Set<string>();
  const items: EventItem[] = [];
  for (const e of data.value) {
    const repo = e.repo.name;
    if (seen.has(repo)) continue;
    seen.add(repo);
    if (items.length >= 12) break;
    const meta = typeLabel(e.type);
    const d = detailFor(e);
    items.push({
      id: e.id,
      type: e.type,
      repoName: e.repo.name.replace(`${username}/`, ''),
      repoUrl: e.repo.url.replace('api.github.com/repos', 'github.com'),
      timeAgo: timeAgo(e.created_at, lang.value),
      action: meta.label,
      ...d,
    });
  }
  return items;
});

function refresh() {
  clearCached(CACHE_KEY);
  load(true);
}

onMounted(() => load());
</script>

<template>
  <section class="github-contrib">
    <div class="flex items-center justify-between mb-4 px-3 py-2 bg-[color:var(--bg-soft)] border border-[color:var(--line)] font-mono text-[0.75rem] tracking-[0.1em]">
      <div class="flex items-center gap-2 text-[color:var(--muted)]">
        <Icon icon="lucide:activity" width="13" height="13" class="text-[color:var(--accent)]" />
        <span>gh-activity — {{ username }}</span>
      </div>
      <div class="flex items-center gap-3">
        <span class="text-[color:var(--muted)]" v-if="!loading && !error && data">
          {{ events.length }} {{ lang === 'es' ? 'eventos' : 'events' }}
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

    <ul v-else-if="events.length" class="list-none p-0 m-0 border border-[color:var(--line)]">
      <li
        v-for="(ev, i) in events"
        :key="ev.id"
        class="contrib-row px-4 py-3 border-b border-[color:var(--line)] last:border-b-0 font-mono hover:bg-[rgba(74,222,128,0.03)] transition-colors duration-150"
        :style="{ animationDelay: `${i * 0.03}s` }"
      >
        <div class="flex items-center gap-3">
          <Icon
            :icon="typeLabel(ev.type).icon"
            width="15"
            height="15"
            class="shrink-0"
            :style="{ color: typeLabel(ev.type).color }"
          />
          <a
            :href="ev.repoUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="flex-1 text-[color:var(--fg)] no-underline hover:text-[color:var(--accent)] transition-colors duration-150 truncate"
          >
            <span class="text-[color:var(--muted)]">{{ ev.action }}</span>
            <span class="mx-1.5 text-[color:var(--accent)]">›</span>
            <span class="text-[color:var(--accent)]">{{ ev.repoName }}</span>
          </a>
          <span class="w-20 shrink-0 text-right text-[0.7rem] text-[color:var(--muted)]">{{ ev.timeAgo }}</span>
        </div>
        <div v-if="ev.detail || ev.branch || ev.prTitle || ev.releaseName" class="mt-1.5 ml-7 text-[0.7rem] text-[color:var(--muted)] truncate">
          <template v-if="ev.type === 'PushEvent' && ev.count">
            <Icon icon="lucide:git-branch" width="11" height="11" class="inline-block align-[-1px]" />
            <span class="ml-1">{{ ev.branch }}</span>
            <span class="mx-1.5 text-[color:var(--line)]">·</span>
            <span>{{ ev.count }} {{ lang === 'es' ? 'commits' : 'commits' }}</span>
          </template>
          <template v-else-if="ev.type === 'PullRequestEvent' && ev.prTitle">
            <Icon icon="lucide:git-pull-request-arrow" width="11" height="11" class="inline-block align-[-1px]" />
            <span class="ml-1">{{ ev.prTitle }}</span>
          </template>
          <template v-else-if="ev.type === 'ReleaseEvent' && ev.releaseName">
            <Icon icon="lucide:tag" width="11" height="11" class="inline-block align-[-1px]" />
            <span class="ml-1">{{ ev.releaseName }}</span>
          </template>
          <template v-else-if="ev.detail">
            <span class="text-[color:var(--muted)]">{{ ev.detail }}</span>
          </template>
        </div>
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
.github-contrib {
  width: 100%;
}

.contrib-row {
  animation: fadeIn 0.35s ease-out backwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateX(-6px); }
  to { opacity: 1; transform: translateX(0); }
}
</style>