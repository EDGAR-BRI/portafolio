<script setup lang="ts">
import { computed } from "vue";
import { Icon } from "@iconify/vue";
import { useLang } from "../stores/lang";
import { translations, social } from "../data/site";
import Typewriter from "./Typewriter.vue";
import CyberButton from "./CyberButton.vue";

const lang = useLang();
const t = computed(() => translations[lang.value]);
const roles = computed(() => t.value.hero.roles);
</script>

<template>
  <section
    class="hero pt-8 sm:pt-14 pb-6 sm:pb-10 flex flex-col gap-3.5 sm:gap-4"
    id="top"
  >
    <!-- Top Terminal Status Bar -->
    <div class="flex items-center gap-3 flex-wrap">
      <div class="status-pill inline-flex items-center gap-2 px-2.5 py-1 bg-[rgba(74,222,128,0.08)] border border-[rgba(74,222,128,0.25)] rounded-[2px] font-mono text-[0.72rem] text-[color:var(--accent)]">
        <span class="status-pulse" aria-hidden="true"></span>
        <span>{{ lang === 'es' ? 'disponible para proyectos' : 'available for hire' }}</span>
      </div>

      <div class="terminal-cmd font-mono text-[0.75rem] text-[color:var(--muted)] hidden sm:flex items-center gap-1.5 opacity-80">
        <span class="text-[color:var(--accent)]">$</span>
        <span>whoami --role="fullstack"</span>
      </div>
    </div>

    <!-- Main Title Block -->
    <div class="flex flex-col mt-1">
      <p
        class="mb-1 font-mono text-[0.88rem] sm:text-[0.95rem] text-[color:var(--muted)] flex items-center gap-1.5"
      >
        <span class="text-[color:var(--accent)] font-bold">&gt;</span>
        {{ t.hero.greeting }}
      </p>
      <h1
        class="text-[clamp(2.3rem,7.5vw,4.6rem)] font-bold m-0 tracking-[-0.02em] font-mono hero-name -translate-y-1 sm:-translate-y-2 translate-x-0"
      >
        {{ t.hero.name }}
      </h1>
    </div>

    <!-- Animated Role Line -->
    <div class="flex items-center gap-2 font-mono text-[clamp(1.05rem,2.8vw,1.45rem)] font-medium text-[color:var(--accent)] min-h-[1.6em]">
      <span class="text-[color:var(--accent-2)]">&gt;</span>
      <Typewriter :words="roles" client:load />
    </div>

    <!-- Bio Description -->
    <p
      class="text-[0.95rem] sm:text-[1.05rem] text-[color:var(--muted)] max-w-160 leading-relaxed m-0"
    >
      {{ t.hero.bio }}
    </p>

    <!-- Quick Tech Highlights Pills -->
    <div class="flex items-center gap-2 flex-wrap font-mono text-[0.74rem] text-[color:var(--muted)] pt-1">
      <span class="meta-tag inline-flex items-center gap-1.5 px-2 py-0.5 border border-[color:var(--line)] bg-[rgba(255,255,255,0.02)] rounded-[2px]">
        <Icon icon="lucide:layers" width="12" height="12" class="text-[color:var(--accent)]" />
        <span>Astro · Vue · AdonisJS · Node</span>
      </span>
      <span class="meta-tag inline-flex items-center gap-1.5 px-2 py-0.5 border border-[color:var(--line)] bg-[rgba(255,255,255,0.02)] rounded-[2px]">
        <Icon icon="lucide:map-pin" width="12" height="12" class="text-[color:var(--accent-2)]" />
        <span>{{ lang === 'es' ? 'Remoto / Presencial' : 'Remote / On-site' }}</span>
      </span>
    </div>

    <!-- Action Buttons -->
    <div class="flex gap-3 sm:gap-4 flex-wrap pt-2">
      <CyberButton
        href="#projects"
        variant="primary"
        size="md"
        iconRight="lucide:arrow-down"
      >
        <span class="prompt-arrow mr-1.5">&gt;</span>
        {{ t.hero.cta_projects }}
      </CyberButton>
      <CyberButton
        :href="`mailto:${social.email}`"
        variant="secondary"
        size="md"
        iconRight="lucide:arrow-right"
      >
        <span class="prompt-arrow muted-arrow mr-1.5">·</span>
        {{ t.hero.cta_contact }}
      </CyberButton>
    </div>
  </section>
</template>

<style scoped>
.hero {
  opacity: 1;
  transform: translateY(0);
}

.status-pulse {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 8px var(--accent);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(0.85); }
}

.hero-name {
  background: linear-gradient(135deg, var(--fg) 0%, #a7f3d0 60%, var(--accent) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 30px rgba(74, 222, 128, 0.15);
}

.prompt-arrow {
  color: var(--accent);
  font-weight: 700;
}

.muted-arrow {
  color: var(--muted);
}
</style>
