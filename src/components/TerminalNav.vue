<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useLang } from '../stores/lang';
import { translations } from '../data/site';

const lang = useLang();
const t = computed(() => translations[lang.value]);

const currentSegment = ref('');

interface NavItem {
  id: string;
  label: string;
  path: string;
}

const navItems = computed<NavItem[]>(() => [
  { id: 'projects', label: t.value.nav.projects, path: 'projects' },
  { id: 'live', label: 'GitHub Live', path: 'github/live' },
  { id: 'github-stack', label: 'GitHub Stack', path: 'github/stack' },
  { id: 'skills', label: t.value.nav.skills, path: 'skills' },
  { id: 'contact', label: t.value.nav.contact, path: 'contact' },
]);

function updateActive() {
  if (typeof window === 'undefined') return;
  const scrollY = window.scrollY;
  const triggerLine = window.innerHeight * 0.4;

  if (scrollY < 120) {
    currentSegment.value = '';
    return;
  }

  let activeId = '';

  // First: check which section intersects the trigger line.
  for (const item of navItems.value) {
    const el = document.getElementById(item.id);
    if (!el) continue;
    const rect = el.getBoundingClientRect();
    if (rect.top <= triggerLine && rect.bottom >= triggerLine) {
      activeId = item.id;
      break;
    }
  }

  // Fallback: last section passed above the trigger line.
  if (!activeId) {
    for (const item of navItems.value) {
      const el = document.getElementById(item.id);
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      if (rect.top <= triggerLine) {
        activeId = item.id;
      }
    }
  }

  if (!activeId) {
    currentSegment.value = '';
  } else {
    const item = navItems.value.find((n) => n.id === activeId);
    currentSegment.value = item ? `/${item.path}` : `/${activeId}`;
  }
}

onMounted(() => {
  if (typeof window === 'undefined') return;
  updateActive();
  window.addEventListener('scroll', updateActive, { passive: true });
});

onUnmounted(() => {
  window.removeEventListener('scroll', updateActive);
});

function scrollTo(id: string) {
  if (typeof window === 'undefined') return;
  if (id === 'top') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }
  const el = document.getElementById(id);
  if (!el) return;
  const header = document.querySelector('.site-header');
  const headerHeight = header ? header.getBoundingClientRect().height : 56;
  const targetTop = el.getBoundingClientRect().top + window.scrollY - headerHeight - 14;
  window.scrollTo({ top: targetTop, behavior: 'smooth' });
}
</script>

<template>
  <div class="terminal-header">
    <a href="#top" class="brand" aria-label="Home" @click.prevent="scrollTo('top')">
      <span class="prompt">~/</span>
      <span class="brand-name">edgar</span>
      <span class="current-path">{{ currentSegment }}</span>
    </a>

    <nav class="terminal-nav" aria-label="Secciones">
      <a
        v-for="item in navItems"
        :key="item.id"
        :href="'#' + item.id"
        class="nav-link"
        :class="{ active: currentSegment === '/' + item.path }"
        @click.prevent="scrollTo(item.id)"
      >
        <span class="cmd">cd</span>
        <span class="path">{{ item.path }}</span>
      </a>
    </nav>
  </div>
</template>

<style scoped>
.terminal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  flex: 1;
  min-width: 0;
  margin-right: 1.25rem;
}

.brand {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  text-decoration: none;
  color: var(--fg);
  font-weight: 700;
  font-size: 0.95rem;
  display: inline-flex;
  align-items: center;
  gap: 0.05rem;
  white-space: nowrap;
  min-width: 0;
  cursor: pointer;
  transition: opacity 0.15s ease;
}

.brand:hover {
  opacity: 0.85;
}

.prompt { color: var(--accent); }

.brand-name {
  color: var(--fg);
}

.current-path {
  color: var(--muted);
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 180px;
}

.terminal-nav {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.8rem;
  transition: gap 0.2s ease;
}

.nav-link {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  text-decoration: none;
  color: var(--muted);
  transition: all 0.15s ease;
  white-space: nowrap;
  padding: 0.2rem 0.35rem;
  border-radius: 2px;
  border: 1px solid transparent;
}

.nav-link:hover,
.nav-link:focus {
  color: var(--accent);
}

.nav-link.active {
  color: var(--fg);
  border-color: rgba(74, 222, 128, 0.3);
  background: rgba(74, 222, 128, 0.06);
}

.cmd {
  color: var(--accent);
  opacity: 0.8;
}

.path {
  color: inherit;
}

@media (max-width: 768px) {
  .terminal-header {
    display: contents;
  }

  .brand {
    grid-column: 1 / 2;
    grid-row: 1 / 2;
    font-size: 0.92rem;
    justify-self: start;
  }

  .terminal-nav {
    grid-column: 1 / 3;
    grid-row: 2 / 3;
    width: 100%;
    gap: 0.4rem;
    font-size: 0.72rem;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    padding: 0.1rem 0;
    margin: 0;
  }

  .terminal-nav::-webkit-scrollbar {
    display: none;
  }

  .nav-link {
    padding: 0.22rem 0.55rem;
    background: rgba(18, 24, 32, 0.65);
    border: 1px solid var(--line);
    border-radius: 3px;
    flex-shrink: 0;
  }

  .nav-link.active {
    border-color: rgba(74, 222, 128, 0.5);
    background: rgba(74, 222, 128, 0.12);
    color: var(--accent);
    box-shadow: 0 0 8px rgba(74, 222, 128, 0.15);
  }
}
</style>