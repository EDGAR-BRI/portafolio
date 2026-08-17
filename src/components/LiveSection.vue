<script setup lang="ts">
import { computed } from 'vue';
import { useLang } from '../stores/lang';
import { translations } from '../data/site';
import LiveRepos from './LiveRepos.vue';

const lang = useLang();
const t = computed(() => translations[lang.value]);
</script>

<template>
  <section class="live-section" id="live">
    <h2 class="section-title">
      <span class="hash">#</span> {{ t.sections.live_title }}
    </h2>
    <p class="section-sub">{{ t.sections.live_subtitle }}</p>
    <LiveRepos client:visible />
  </section>
</template>

<style scoped>
.live-section {
  margin: 4rem 0;
}

.section-title {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}

.hash {
  color: var(--accent);
}

.section-sub {
  color: var(--muted);
  margin: 0 0 1.5rem 0;
}
</style>