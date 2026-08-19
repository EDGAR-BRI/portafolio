<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { Icon } from "@iconify/vue";
import { useLang } from "../stores/lang";
import { translations, social } from "../data/site";
import Typewriter from "./Typewriter.vue";

const lang = useLang();
const t = computed(() => translations[lang.value]);
const roles = computed(() => t.value.hero.roles);

const entered = ref(false);

function startEnter() {
  entered.value = true;
}

onMounted(() => {
  if (typeof window === "undefined") return;
  if (window.sessionStorage.getItem("portfolio.booted") === "1") {
    startEnter();
    return;
  }
  window.addEventListener("portfolio:boot-done", startEnter, { once: true });
  setTimeout(() => {
    if (!entered.value) startEnter();
  }, 6000);
});
</script>

<template>
  <section
    class="hero pt-8 sm:pt-14 pb-8 sm:pb-12 flex flex-col gap-2.5 sm:gap-3"
    :class="{ 'hero-enter': entered }"
    id="top"
  >
    <div class="flex flex-col">
      <p
        class="mt-2 sm:mt-3 mb-0 font-mono text-[0.88rem] sm:text-[0.95rem] text-[color:var(--muted)] flex items-center gap-1.5"
      >
        <Icon
          icon="lucide:chevron-right"
          width="16"
          height="16"
          class="text-[color:var(--accent)]"
        />
        {{ t.hero.greeting }}
      </p>
      <h1
        class="text-[clamp(2.1rem,7.5vw,4.5rem)] font-bold m-0 tracking-[-0.02em] font-mono hero-name -translate-y-1 sm:-translate-y-3 translate-x-0 sm:-translate-x-2"
      >
        {{ t.hero.name }}
      </h1>
    </div>

    <h2
      class="text-[clamp(1rem,2.8vw,1.4rem)] mt-0.5 sm:mt-1 mb-0 font-medium font-mono min-h-[1.5em] text-[color:var(--accent)]"
    >
      <Typewriter :words="roles" client:load />
    </h2>
    <p
      class="text-[0.92rem] sm:text-[1rem] text-[color:var(--muted)] max-w-160 leading-relaxed mt-2 mb-4 sm:mb-6"
    >
      {{ t.hero.bio }}
    </p>

    <div class="flex gap-3 sm:gap-4 flex-wrap mb-8 sm:mb-12">
      <a
        href="#projects"
        class="btn-primary inline-flex items-center gap-2 px-2 py-1.5 sm:px-1 sm:py-1 no-underline text-[0.88rem] sm:text-[0.9rem] font-mono tracking-[0.02em] text-[color:var(--accent)] transition-colors duration-150 hover:text-[color:var(--fg)]"
      >
        <span class="prompt-arrow">&gt;</span>
        <span
          class="underline underline-offset-4 decoration-[color:var(--accent)]/40 group-hover:decoration-[color:var(--accent)]"
          >{{ t.hero.cta_projects }}</span
        >
        <Icon icon="lucide:arrow-down" width="14" height="14" />
      </a>
      <a
        :href="`mailto:${social.email}`"
        class="btn-ghost inline-flex items-center gap-2 px-2 py-1.5 sm:px-1 sm:py-1 no-underline text-[0.88rem] sm:text-[0.9rem] font-mono tracking-[0.02em] text-[color:var(--muted)] transition-colors duration-150 hover:text-[color:var(--accent)]"
      >
        <span class="prompt-arrow muted-arrow">·</span>
        <span
          class="underline underline-offset-4 decoration-[color:var(--line)]"
          >{{ t.hero.cta_contact }}</span
        >
        <Icon icon="lucide:arrow-right" width="14" height="14" />
      </a>
    </div>
  </section>
</template>

<style scoped>
.hero {
  opacity: 0;
  transform: translateY(12px);
  transition: opacity 0.7s ease;
  will-change: transform;
}

.hero.hero-enter {
  opacity: 1;
  transform: translateY(0);
}

.hero-name {
  background: linear-gradient(135deg, var(--fg) 0%, var(--accent) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.prompt-arrow {
  color: var(--accent);
  font-weight: 700;
}

.muted-arrow {
  color: var(--muted);
}

.terminal-cursor {
  animation: blink 1s steps(1) infinite;
  color: var(--accent);
}

@keyframes blink {
  50% {
    opacity: 0;
  }
}
</style>
