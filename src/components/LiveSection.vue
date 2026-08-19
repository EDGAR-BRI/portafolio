<script setup lang="ts">
import { computed } from 'vue';
import { useLang } from '../stores/lang';
import { translations } from '../data/site';
import LiveRepos from './LiveRepos.vue';

const lang = useLang();
const t = computed(() => translations[lang.value]);
</script>

<template>
  <section class="my-12 sm:my-16">
    <div class="section-label">[ live ]</div>
    <h2 class="section-title">
      <span class="hash">#</span> {{ t.sections.live_title }}
    </h2>
    <p class="section-sub">{{ t.sections.live_subtitle }}</p>
    <LiveRepos client:visible />
  </section>
</template>
