<script setup lang="ts">
import { ref, computed } from "vue";
import { Icon } from "@iconify/vue";
import { useLang } from "../stores/lang";
import { translations, social } from "../data/site";
import Typewriter from "./Typewriter.vue";
import CyberButton from "./CyberButton.vue";

const lang = useLang();
const t = computed(() => translations[lang.value]);
const roles = computed(() => t.value.hero.roles);

const copied = ref(false);
let copyTimeout: ReturnType<typeof setTimeout> | null = null;

async function copyEmail() {
  try {
    await navigator.clipboard.writeText(social.email);
    copied.value = true;
    if (copyTimeout) clearTimeout(copyTimeout);
    copyTimeout = setTimeout(() => {
      copied.value = false;
    }, 2500);
  } catch {
    copied.value = true;
    if (copyTimeout) clearTimeout(copyTimeout);
    copyTimeout = setTimeout(() => {
      copied.value = false;
    }, 2500);
  }
}
</script>

<template>
  <section
    class="hero min-h-[calc(100svh-4.5rem)] flex flex-col justify-center gap-3.5 sm:gap-4 max-w-3xl py-6 sm:py-10"
    id="top"
  >
    <!-- Greeting -->
    <p class="m-0 font-mono text-[0.88rem] sm:text-[0.95rem] text-[color:var(--muted)] flex items-center gap-1.5">
      <span class="text-[color:var(--accent)] font-bold">&gt;</span>
      {{ t.hero.greeting }}
    </p>

    <!-- Main Name Heading -->
    <h1
      class="text-[clamp(2.4rem,7.5vw,4.8rem)] font-bold m-0 tracking-[-0.02em] font-mono hero-name -translate-y-1 sm:-translate-y-2"
    >
      {{ t.hero.name }}
    </h1>

    <!-- Animated Role Line -->
    <div class="flex items-center gap-2 font-mono text-[clamp(1.1rem,2.8vw,1.5rem)] font-medium text-[color:var(--accent)] min-h-[1.6em]">
      <span class="text-[color:var(--accent-2)]">&gt;</span>
      <Typewriter :words="roles" client:load />
    </div>

    <!-- Bio Description -->
    <p
      class="text-[0.95rem] sm:text-[1.05rem] text-[color:var(--muted)] leading-relaxed m-0"
    >
      {{ t.hero.bio }}
    </p>

    <!-- Education & Location below description -->
    <div class="flex items-center gap-3 sm:gap-4 flex-wrap font-mono text-[0.78rem] sm:text-[0.82rem] text-[color:var(--muted)] pt-0.5">
      <span class="flex items-center gap-1.5">
        <Icon icon="lucide:graduation-cap" width="14" height="14" class="text-[color:var(--accent)] shrink-0" />
        <span>{{ t.hero.education }}</span>
      </span>
      <span class="text-[color:var(--line)] hidden sm:inline" aria-hidden="true">|</span>
      <span class="flex items-center gap-1.5">
        <Icon icon="lucide:map-pin" width="14" height="14" class="text-[color:var(--accent-2)] shrink-0" />
        <span>{{ lang === 'es' ? 'Venezuela · Remoto' : 'Venezuela · Remote' }}</span>
      </span>
    </div>

    <!-- Action Buttons Row -->
    <div class="flex gap-3 sm:gap-4 flex-wrap pt-2 items-center">
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

      <!-- Quick Copy Email Button -->
      <button
        type="button"
        class="hero-copy-btn inline-flex items-center gap-1.5 px-3 py-2 text-[0.76rem] font-mono border border-[color:var(--line)] bg-[rgba(255,255,255,0.02)] text-[color:var(--muted)] hover:text-[color:var(--accent)] hover:border-[color:var(--accent)] rounded-[2px] cursor-pointer transition-all duration-150"
        @click="copyEmail"
        :title="lang === 'es' ? 'Copiar email' : 'Copy email'"
      >
        <Icon :icon="copied ? 'lucide:check' : 'lucide:copy'" width="13" height="13" :class="{ 'text-[color:var(--accent)]': copied }" />
        <span>{{ copied ? (lang === 'es' ? 'Copiado' : 'Copied') : 'edgardev26@gmail.com' }}</span>
      </button>
    </div>
  </section>
</template>

<style scoped>
.hero {
  opacity: 1;
  transform: translateY(0);
  box-sizing: border-box;
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
