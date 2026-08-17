<script setup lang="ts">
import { computed } from 'vue';
import { useLang } from '../stores/lang';
import { translations, social } from '../data/site';
import Typewriter from './Typewriter.vue';

const lang = useLang();
const t = computed(() => translations[lang.value]);
const roles = computed(() => t.value.hero.roles);
</script>

<template>
  <section class="hero" id="top">
    <p class="greeting">
      <span class="prompt">{{ lang.value === 'en' ? '>' : '>' }}</span>
      {{ t.hero.greeting }}
    </p>
    <h1 class="name">{{ t.hero.name }}</h1>
    <h2 class="role">
      <Typewriter :words="roles" client:load />
    </h2>
    <p class="bio">{{ t.hero.bio }}</p>
    <div class="cta">
      <a href="#projects" class="btn primary">{{ t.hero.cta_projects }} ↓</a>
      <a :href="`mailto:${social.email}`" class="btn ghost">{{ t.hero.cta_contact }} →</a>
    </div>

    <div class="terminal" aria-hidden="true">
      <div class="term-bar">
        <span class="dot red"></span>
        <span class="dot yellow"></span>
        <span class="dot green"></span>
        <span class="term-title">~ edgar@bri: ~/portfolio</span>
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
  padding: 4rem 0 3rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.greeting {
  margin: 0;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  color: var(--muted);
  font-size: 1rem;
}

.prompt {
  color: var(--accent);
}

.name {
  font-size: clamp(2.5rem, 6vw, 4.5rem);
  font-weight: 700;
  margin: 0;
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, var(--fg) 0%, var(--accent) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.role {
  font-size: clamp(1.1rem, 2.5vw, 1.5rem);
  margin: 0;
  font-weight: 500;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  min-height: 1.5em;
}

.bio {
  font-size: 1.05rem;
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
  gap: 0.4rem;
  padding: 0.7rem 1.25rem;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  font-size: 0.95rem;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.btn.primary {
  background: var(--accent);
  color: var(--bg);
}

.btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(74, 222, 128, 0.3);
}

.btn.ghost {
  background: transparent;
  color: var(--fg);
  border: 1px solid var(--border);
}

.btn.ghost:hover {
  border-color: var(--accent);
}

.terminal {
  background: rgba(13, 17, 23, 0.9);
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.9rem;
  max-width: 640px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
}

.term-bar {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.6rem 1rem;
  background: rgba(0, 0, 0, 0.3);
  border-bottom: 1px solid var(--border);
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.dot.red { background: #ff5f56; }
.dot.yellow { background: #ffbd2e; }
.dot.green { background: #27c93f; }

.term-title {
  margin-left: 0.5rem;
  color: var(--muted);
  font-size: 0.75rem;
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