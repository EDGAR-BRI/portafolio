<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { Icon } from '@iconify/vue';
import { useLang } from '../stores/lang';
import { translations } from '../data/site';
import { useCachedFetch, clearCached } from '../composables/useGitHubCache';

interface RawCommit {
  sha: string;
  message: string;
}

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
    commits?: RawCommit[];
    action?: string;
    pull_request?: { html_url?: string; title?: string; state?: string; number?: number; merged?: boolean };
    issue?: { html_url?: string; title?: string; number?: number };
    release?: { name?: string; tag_name?: string; html_url?: string };
    description?: string;
  };
}

interface EventItem {
  id: string;
  type: string;
  repoName: string;
  repoUrl: string;
  timeAgo: string;
  badgeLabel: string;
  badgeColor: string;
  badgeBg: string;
  icon: string;
  detail?: string;
  subDetail?: string;
  targetUrl?: string;
}

const lang = useLang();
const t = computed(() => translations[lang.value]);

const username = 'EDGAR-BRI';
const API_URL = `https://api.github.com/users/${username}/events/public?per_page=40`;
const CACHE_KEY = `gh-cache:events:${username}`;

const { data, loading, error, load } = useCachedFetch<RawEvent[]>(API_URL);

function branchFromRef(ref?: string): string | undefined {
  if (!ref) return undefined;
  const m = ref.match(/^refs\/heads\/(.+)$/);
  return m ? m[1] : ref;
}

function timeAgo(iso: string, locale: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return locale === 'es' ? 'ahora' : 'just now';
  if (mins < 60) return locale === 'es' ? `hace ${mins}m` : `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return locale === 'es' ? `hace ${hrs}h` : `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return locale === 'es' ? `hace ${days}d` : `${days}d ago`;
  const months = Math.floor(days / 30);
  return locale === 'es' ? `hace ${months}m` : `${months}mo ago`;
}

function parseEvent(e: RawEvent, locale: string): EventItem {
  const p = e.payload;
  const repoShort = e.repo.name.replace(`${username}/`, '');
  const repoUrl = e.repo.url.replace('api.github.com/repos', 'github.com');
  const time = timeAgo(e.created_at, locale);

  switch (e.type) {
    case 'PushEvent': {
      const count = p.size ?? p.commits_count ?? (p.commits?.length ?? 1);
      const branch = branchFromRef(p.ref) ?? 'main';
      const commitMsg = p.commits?.[p.commits.length - 1]?.message?.split('\n')[0];
      return {
        id: e.id,
        type: e.type,
        repoName: repoShort,
        repoUrl,
        timeAgo: time,
        badgeLabel: 'push',
        badgeColor: '#4ade80',
        badgeBg: 'rgba(74, 222, 128, 0.12)',
        icon: 'lucide:git-commit',
        detail: `${count} commit${count === 1 ? '' : 's'} → ${branch}`,
        subDetail: commitMsg,
      };
    }
    case 'PullRequestEvent': {
      const prNumber = p.pull_request?.number ? `#${p.pull_request.number}` : '';
      const action = p.pull_request?.merged ? 'merged' : (p.action ?? 'PR');
      return {
        id: e.id,
        type: e.type,
        repoName: repoShort,
        repoUrl,
        timeAgo: time,
        badgeLabel: 'PR',
        badgeColor: '#22d3ee',
        badgeBg: 'rgba(34, 211, 238, 0.12)',
        icon: 'lucide:git-pull-request',
        detail: `${action} ${prNumber}`,
        subDetail: p.pull_request?.title,
        targetUrl: p.pull_request?.html_url,
      };
    }
    case 'IssuesEvent': {
      const issueNum = p.issue?.number ? `#${p.issue.number}` : '';
      return {
        id: e.id,
        type: e.type,
        repoName: repoShort,
        repoUrl,
        timeAgo: time,
        badgeLabel: 'issue',
        badgeColor: '#fde047',
        badgeBg: 'rgba(253, 224, 71, 0.12)',
        icon: 'lucide:circle-dot',
        detail: `${p.action ?? 'opened'} ${issueNum}`,
        subDetail: p.issue?.title,
        targetUrl: p.issue?.html_url,
      };
    }
    case 'ReleaseEvent': {
      const tag = p.release?.tag_name ?? p.release?.name ?? 'release';
      return {
        id: e.id,
        type: e.type,
        repoName: repoShort,
        repoUrl,
        timeAgo: time,
        badgeLabel: 'release',
        badgeColor: '#c084fc',
        badgeBg: 'rgba(192, 132, 252, 0.12)',
        icon: 'lucide:tag',
        detail: `${p.action ?? 'published'} ${tag}`,
        targetUrl: p.release?.html_url,
      };
    }
    case 'CreateEvent': {
      const target = p.ref ? `${p.ref_type} ${p.ref}` : p.ref_type ?? 'repo';
      return {
        id: e.id,
        type: e.type,
        repoName: repoShort,
        repoUrl,
        timeAgo: time,
        badgeLabel: 'create',
        badgeColor: '#60a5fa',
        badgeBg: 'rgba(96, 165, 250, 0.12)',
        icon: 'lucide:folder-plus',
        detail: `created ${target}`,
      };
    }
    case 'ForkEvent': {
      return {
        id: e.id,
        type: e.type,
        repoName: repoShort,
        repoUrl,
        timeAgo: time,
        badgeLabel: 'fork',
        badgeColor: '#a78bfa',
        badgeBg: 'rgba(167, 139, 250, 0.12)',
        icon: 'lucide:git-branch',
        detail: 'forked repository',
      };
    }
    case 'WatchEvent': {
      return {
        id: e.id,
        type: e.type,
        repoName: repoShort,
        repoUrl,
        timeAgo: time,
        badgeLabel: 'star',
        badgeColor: '#fbbf24',
        badgeBg: 'rgba(251, 191, 36, 0.12)',
        icon: 'lucide:star',
        detail: 'starred repository',
      };
    }
    default: {
      const cleanType = e.type.replace('Event', '').toLowerCase();
      return {
        id: e.id,
        type: e.type,
        repoName: repoShort,
        repoUrl,
        timeAgo: time,
        badgeLabel: cleanType,
        badgeColor: '#94a3b8',
        badgeBg: 'rgba(148, 163, 184, 0.12)',
        icon: 'lucide:activity',
        detail: cleanType,
      };
    }
  }
}

const events = computed<EventItem[]>(() => {
  if (!data.value || !Array.isArray(data.value)) return [];
  const list: EventItem[] = [];
  for (const raw of data.value) {
    if (!raw?.type || !raw?.repo?.name) continue;
    list.push(parseEvent(raw, lang.value));
    if (list.length >= 4) break;
  }
  return list;
});

function refresh() {
  clearCached(CACHE_KEY);
  load(true);
}

onMounted(() => load());
</script>

<template>
  <section class="github-contrib">
    <!-- Header bar -->
    <div class="header-bar flex items-center justify-between mb-3 px-3 py-2 bg-[color:var(--bg-soft)] border border-[color:var(--line)] font-mono text-[0.75rem] tracking-[0.08em]">
      <div class="flex items-center gap-2 text-[color:var(--fg)] min-w-0">
        <span class="live-pulse" aria-hidden="true"></span>
        <Icon icon="lucide:activity" width="14" height="14" class="text-[color:var(--accent)] shrink-0" />
        <span class="font-bold truncate">gh-activity</span>
        <span class="text-[color:var(--muted)] text-[0.7rem] hidden sm:inline truncate">/ {{ username }}</span>
      </div>
      <div class="flex items-center gap-2.5 shrink-0">
        <span class="events-count text-[color:var(--muted)] text-[0.7rem]" v-if="!loading && !error && data">
          {{ events.length }} {{ lang === 'es' ? 'recientes' : 'recent' }}
        </span>
        <button
          type="button"
          class="refresh-btn"
          :disabled="loading"
          @click="refresh"
          :title="lang === 'es' ? 'Recargar actividad' : 'Refresh activity'"
          :aria-label="lang === 'es' ? 'Recargar actividad' : 'Refresh activity'"
        >
          <Icon icon="lucide:refresh-cw" width="12" height="12" :class="{ 'animate-spin': loading }" />
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div
      v-if="loading"
      class="state-box loading-box"
    >
      <Icon icon="lucide:loader" width="16" height="16" class="animate-spin text-[color:var(--accent)]" />
      <span>{{ t.sections.live_loading }}</span>
    </div>

    <!-- Error State -->
    <div
      v-else-if="error"
      class="state-box error-box"
    >
      <Icon icon="lucide:alert-circle" width="16" height="16" />
      <span>{{ t.sections.live_error }}</span>
      <button type="button" class="retry-inline-btn" @click="refresh">
        {{ lang === 'es' ? 'Reintentar' : 'Retry' }}
      </button>
    </div>

    <!-- Events Feed -->
    <ul v-else-if="events.length" class="events-list">
      <li
        v-for="(ev, i) in events"
        :key="ev.id"
        class="event-row"
        :style="{ animationDelay: `${i * 0.04}s` }"
      >
        <div class="event-content">
          <!-- Left: Event Badge -->
          <span
            class="event-badge"
            :style="{
              color: ev.badgeColor,
              backgroundColor: ev.badgeBg,
              borderColor: `${ev.badgeColor}40`,
            }"
            :title="ev.type"
          >
            <Icon :icon="ev.icon" width="11" height="11" class="shrink-0" />
            <span class="badge-text">{{ ev.badgeLabel }}</span>
          </span>

          <!-- Center: Target Repo & Details -->
          <div class="event-main min-w-0 flex-1">
            <div class="event-title-line flex items-center gap-1.5 flex-wrap min-w-0">
              <a
                :href="ev.targetUrl || ev.repoUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="repo-name"
                :title="`Abrir ${ev.repoName} en GitHub`"
              >
                {{ ev.repoName }}
              </a>
              <span v-if="ev.detail" class="event-detail-chip">
                {{ ev.detail }}
              </span>
            </div>

            <!-- Subdetail / commit message if present -->
            <p v-if="ev.subDetail" class="event-subdetail" :title="ev.subDetail">
              {{ ev.subDetail }}
            </p>
          </div>

          <!-- Right: Relative Time -->
          <div class="event-time shrink-0" :title="ev.timeAgo">
            {{ ev.timeAgo }}
          </div>
        </div>
      </li>
    </ul>

    <!-- Empty State -->
    <div
      v-else
      class="state-box empty-box"
    >
      <Icon icon="lucide:inbox" width="16" height="16" class="text-[color:var(--muted)]" />
      <span>{{ lang === 'es' ? 'Sin actividad reciente pública' : 'No recent public activity' }}</span>
    </div>
  </section>
</template>

<style scoped>
.github-contrib {
  width: 100%;
}

.live-pulse {
  display: inline-block;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 8px var(--accent);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(0.85); }
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

.events-list {
  list-none: none;
  padding: 0;
  margin: 0;
  border: 1px solid var(--line);
  background: rgba(6, 8, 11, 0.4);
}

.event-row {
  border-bottom: 1px solid var(--line);
  transition: background 0.15s ease, border-left-color 0.15s ease, transform 0.15s ease;
  animation: fadeIn 0.35s ease-out backwards;
  border-left: 2px solid transparent;
}

.event-row:last-child {
  border-bottom: none;
}

.event-row:hover {
  background: rgba(74, 222, 128, 0.04);
  border-left-color: var(--accent);
}

.event-content {
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
  padding: 0.42rem 0.85rem;
  font-family: 'JetBrains Mono', monospace;
}

.event-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.15rem 0.4rem;
  border-radius: 2px;
  border: 1px solid transparent;
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  line-height: 1.2;
  margin-top: 2px;
  flex-shrink: 0;
}

.event-main {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.repo-name {
  color: var(--fg);
  font-size: 0.78rem;
  font-weight: 600;
  text-decoration: none;
  transition: color 0.15s ease;
}

.repo-name:hover {
  color: var(--accent);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.event-detail-chip {
  color: var(--muted);
  font-size: 0.7rem;
  background: rgba(255, 255, 255, 0.03);
  padding: 0.05rem 0.35rem;
  border-radius: 2px;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.event-subdetail {
  margin: 0;
  color: var(--muted);
  font-size: 0.68rem;
  line-height: 1.35;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 95%;
  opacity: 0.85;
}

.event-time {
  font-size: 0.68rem;
  color: var(--muted);
  margin-top: 2px;
  white-space: nowrap;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateX(-6px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@media (max-width: 640px) {
  .event-content {
    padding: 0.5rem 0.65rem;
    gap: 0.5rem;
  }

  .event-badge {
    font-size: 0.6rem;
    padding: 0.1rem 0.3rem;
  }

  .repo-name {
    font-size: 0.74rem;
  }

  .event-detail-chip {
    font-size: 0.65rem;
  }

  .event-subdetail {
    font-size: 0.65rem;
  }

  .event-time {
    font-size: 0.65rem;
  }
}
</style>