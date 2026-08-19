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
  { id: 'top', label: t.value.nav.projects, path: 'projects' },
  { id: 'live', label: t.value.nav.live, path: 'github' },
  { id: 'github-stack', label: 'Stack', path: 'stack' },
  { id: 'skills', label: t.value.nav.skills, path: 'skills' },
  { id: 'contact', label: t.value.nav.contact, path: 'contact' },
]);

function updateActive() {
  if (typeof window === 'undefined') return;
  const triggerLine = window.innerHeight * 0.45;

  let activeId = 'top';

  // First: the section whose bounds straddle the trigger line.
  for (const item of navItems.value) {
    const el = document.getElementById(item.id);
    if (!el) continue;
    const rect = el.getBoundingClientRect();
    if (rect.top <= triggerLine && rect.bottom >= triggerLine) {
      activeId = item.id;
      break;
    }
  }

  // Fallback: last section already above the trigger line.
  if (activeId === 'top') {
    for (const item of navItems.value) {
      const el = document.getElementById(item.id);
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      if (rect.top <= triggerLine) {
        activeId = item.id;
      }
    }
  }

  if (activeId === 'top') {
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
        :class="{ active: currentSegment === '/' + item.path || (item.id === 'top' && !currentSegment) }"
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
  gap: 1.25rem;
  flex: 1;
  min-width: 0;
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
  max-width: 110px;
}

.terminal-nav {
  display: flex;
  align-items: center;
  gap: 0.85rem;
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
}

.cmd {
  color: var(--accent);
  opacity: 0.8;
}

.path {
  color: inherit;
}

@media (max-width: 860px) {
  .terminal-header {
    flex-wrap: wrap;
    gap: 0.35rem;
  }

  .brand {
    font-size: 0.88rem;
  }

  .terminal-nav {
    gap: 0.45rem;
    font-size: 0.74rem;
    width: 100%;
    order: 3;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    padding: 0.1rem 0 0.25rem;
  }

  .terminal-nav::-webkit-scrollbar {
    display: none;
  }

  .nav-link {
    padding: 0.2rem 0.5rem;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid var(--line);
    flex-shrink: 0;
  }

  .nav-link.active {
    border-color: rgba(74, 222, 128, 0.4);
    background: rgba(74, 222, 128, 0.08);
    color: var(--accent);
  }
}
</style>