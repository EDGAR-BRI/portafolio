<script setup lang="ts">
import { computed } from 'vue';
import { Icon } from '@iconify/vue';
import { useLang } from '../stores/lang';
import { translations, social } from '../data/site';
import Typewriter from './Typewriter.vue';

const lang = useLang();
const t = computed(() => translations[lang.value]);
const roles = computed(() => t.value.hero.roles);
</script>

<template>
  <section class="hero" id="top">
    <div class="hero-tag">
      <Icon icon="lucide:terminal" width="14" height="14" />
      <span>~/portfolio</span>
      <span class="tag-dot"></span>
      <span class="muted">online</span>
    </div>

    <p class="greeting">
      <Icon icon="lucide:chevron-right" width="16" height="16" class="prompt" />
      {{ t.hero.greeting }}
    </p>
    <h1 class="name">{{ t.hero.name }}</h1>
    <h2 class="role">
      <Typewriter :words="roles" client:load />
    </h2>
    <p class="bio">{{ t.hero.bio }}</p>
    <div class="cta">
      <a href="#projects" class="btn primary">
        {{ t.hero.cta_projects }}
        <Icon icon="lucide:arrow-down" width="16" height="16" />
      </a>
      <a :href="`mailto:${social.email}`" class="btn ghost">
        {{ t.hero.cta_contact }}
        <Icon icon="lucide:arrow-right" width="16" height="16" />
      </a>
    </div>

    <div class="terminal corner" aria-hidden="true">
      <div class="term-bar">
        <span class="dot red"></span>
        <span class="dot yellow"></span>
        <span class="dot green"></span>
        <span class="term-title">
          <Icon icon="lucide:terminal" width="12" height="12" />
          edgar@bri: ~/portfolio
        </span>
      </div>
      <div class="term-body">
        <div class="line"><span class="prompt">$</span> whoami</div>
        <div class="line out">{{ t.hero.name }} — {{ t.hero.roles[0] }}</div>
        <div class="line"><span class="prompt">$</span> ls ./stack</div>
        <div class="line out">Astro · Vue · TypeScript · AdonisJS · React · Tailwind</div>
        <div class="line"><span class="prompt">$</span> cat ./contact.md</div>
        <div class="line out">→ <a :href="`mailto:${social.email}`">{{ social.email }}</a></div>
        <div class="line"><span class="prompt">$</span> <span class="cursor">█</span></div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  padding: 3.5rem 0 3rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.hero-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.75rem;
  color: var(--fg);
  background: var(--bg-soft);
  border: 1px solid var(--line);
  padding: 0.35rem 0.7rem;
  width: fit-content;
  letter-spacing: 0.05em;
}

.tag-dot {
  width: 6px;
  height: 6px;
  background: var(--accent);
  border-radius: 0;
  box-shadow: 0 0 6px var(--accent);
  animation: pulse 1.6s ease-in-out infinite;
}

.muted { color: var(--muted); }

@keyframes pulse {
  50% { opacity: 0.3; }
}

.greeting {
  margin: 0.75rem 0 0 0;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  color: var(--muted);
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.prompt {
  color: var(--accent);
}

.name {
  font-size: clamp(2.5rem, 6vw, 4.5rem);
  font-weight: 700;
  margin: 0;
  letter-spacing: -0.02em;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  background: linear-gradient(135deg, var(--fg) 0%, var(--accent) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.role {
  font-size: clamp(1.05rem, 2.3vw, 1.4rem);
  margin: 0.25rem 0 0 0;
  font-weight: 500;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  min-height: 1.5em;
  color: var(--accent);
}

.bio {
  font-size: 1rem;
  color: var(--muted);
  max-width: 640px;
  line-height: 1.6;
  margin: 0.5rem 0 1.5rem;
}

.cta {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-bottom: 3rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.7rem 1.15rem;
  font-weight: 600;
  text-decoration: none;
  font-size: 0.9rem;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  letter-spacing: 0.02em;
  transition: background 0.15s ease, color 0.15s ease, transform 0.1s ease;
  border: 1px solid transparent;
}

.btn.primary {
  background: var(--accent);
  color: var(--bg);
}

.btn.primary:hover {
  background: transparent;
  color: var(--accent);
  border-color: var(--accent);
}

.btn.ghost {
  background: transparent;
  color: var(--fg);
  border-color: var(--line);
}

.btn.ghost:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.terminal {
  background: var(--bg-soft);
  border: 1px solid var(--line);
  overflow: hidden;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.85rem;
  max-width: 640px;
  margin-top: 1rem;
}

.term-bar {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.6rem 1rem;
  background: rgba(0, 0, 0, 0.4);
  border-bottom: 1px solid var(--line);
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 0;
}

.dot.red { background: #ff5f56; }
.dot.yellow { background: #ffbd2e; }
.dot.green { background: #27c93f; }

.term-title {
  margin-left: 0.5rem;
  color: var(--muted);
  font-size: 0.75rem;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.term-body {
  padding: 1rem;
  line-height: 1.7;
}

.line {
  color: var(--fg);
}

.line.out {
  color: var(--muted);
  margin-bottom: 0.5rem;
}

.line.out a {
  color: var(--accent);
  text-decoration: none;
}

.cursor {
  animation: blink 1s steps(1) infinite;
  color: var(--accent);
}

@keyframes blink {
  50% { opacity: 0; }
}
</style>