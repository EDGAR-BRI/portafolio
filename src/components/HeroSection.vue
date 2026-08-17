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
  <section class="hero pt-14 pb-12 flex flex-col gap-3" id="top">
    <div class="inline-flex items-center gap-2 font-mono text-[0.75rem] text-[color:var(--fg)] bg-[color:var(--bg-soft)] border border-[color:var(--line)] py-1 px-2.5 w-fit tracking-[0.05em]">
      <Icon icon="lucide:terminal" width="14" height="14" />
      <span>~/portfolio</span>
      <span class="w-1.5 h-1.5 bg-[color:var(--accent)] shadow-[0_0_6px_var(--accent)] animate-pulse"></span>
      <span class="text-[color:var(--muted)]">online</span>
    </div>

    <p class="mt-3 mb-0 font-mono text-[0.95rem] text-[color:var(--muted)] flex items-center gap-1.5">
      <Icon icon="lucide:chevron-right" width="16" height="16" class="text-[color:var(--accent)]" />
      {{ t.hero.greeting }}
    </p>
    <h1 class="text-[clamp(2.5rem,6vw,4.5rem)] font-bold m-0 tracking-[-0.02em] font-mono hero-name">
      {{ t.hero.name }}
    </h1>
    <h2 class="text-[clamp(1.05rem,2.3vw,1.4rem)] mt-1 mb-0 font-medium font-mono min-h-[1.5em] text-[color:var(--accent)]">
      <Typewriter :words="roles" client:load />
    </h2>
    <p class="text-[1rem] text-[color:var(--muted)] max-w-160 leading-relaxed mt-2 mb-6">{{ t.hero.bio }}</p>

    <div class="flex gap-3 flex-wrap mb-12">
      <a
        href="#projects"
        class="inline-flex items-center gap-2 px-4.5 py-2.5 font-semibold no-underline text-[0.9rem] font-mono tracking-[0.02em] border border-transparent transition-colors duration-150 bg-[color:var(--accent)] text-[color:var(--bg)] hover:bg-transparent hover:text-[color:var(--accent)] hover:border-[color:var(--accent)]"
      >
        {{ t.hero.cta_projects }}
        <Icon icon="lucide:arrow-down" width="16" height="16" />
      </a>
      <a
        :href="`mailto:${social.email}`"
        class="inline-flex items-center gap-2 px-4.5 py-2.5 font-semibold no-underline text-[0.9rem] font-mono tracking-[0.02em] transition-colors duration-150 bg-transparent text-[color:var(--fg)] border border-[color:var(--line)] hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
      >
        {{ t.hero.cta_contact }}
        <Icon icon="lucide:arrow-right" width="16" height="16" />
      </a>
    </div>

    <div class="terminal corner relative bg-[color:var(--bg-soft)] border border-[color:var(--line)] overflow-hidden font-mono text-[0.85rem] max-w-160 mt-4" aria-hidden="true">
      <div class="flex items-center gap-1.5 px-4 py-2.5 bg-black/40 border-b border-[color:var(--line)]">
        <span class="w-2.5 h-2.5 bg-[#ff5f56]"></span>
        <span class="w-2.5 h-2.5 bg-[#ffbd2e]"></span>
        <span class="w-2.5 h-2.5 bg-[#27c93f]"></span>
        <span class="ml-2 text-[color:var(--muted)] text-[0.75rem] inline-flex items-center gap-1.5">
          <Icon icon="lucide:terminal" width="12" height="12" />
          edgar@bri: ~/portfolio
        </span>
      </div>
      <div class="p-4 leading-relaxed">
        <div class="text-[color:var(--fg)]"><span class="text-[color:var(--accent)]">$</span> whoami</div>
        <div class="text-[color:var(--muted)] mb-2">{{ t.hero.name }} — {{ t.hero.roles[0] }}</div>
        <div class="text-[color:var(--fg)]"><span class="text-[color:var(--accent)]">$</span> ls ./stack</div>
        <div class="text-[color:var(--muted)] mb-2">Astro · Vue · TypeScript · AdonisJS · React · Tailwind</div>
        <div class="text-[color:var(--fg)]"><span class="text-[color:var(--accent)]">$</span> cat ./contact.md</div>
        <div class="text-[color:var(--muted)] mb-2">→ <a :href="`mailto:${social.email}`" class="text-[color:var(--accent)] no-underline">{{ social.email }}</a></div>
        <div class="text-[color:var(--fg)]"><span class="text-[color:var(--accent)]">$</span> <span class="terminal-cursor">█</span></div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero-name {
  background: linear-gradient(135deg, var(--fg) 0%, var(--accent) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.terminal-cursor {
  animation: blink 1s steps(1) infinite;
  color: var(--accent);
}

@keyframes blink {
  50% { opacity: 0; }
}
</style>