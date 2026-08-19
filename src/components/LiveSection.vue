<script setup lang="ts">
import { computed } from 'vue';
import { useLang } from '../stores/lang';
import { translations } from '../data/site';
import LiveRepos from './LiveRepos.vue';
import SectionTitle from './SectionTitle.vue';

const lang = useLang();
const t = computed(() => translations[lang.value]);
</script>

<template>
  <section class="my-12 sm:my-16" id="live">
    <SectionTitle
      :title="t.sections.live_title"
      :subtitle="t.sections.live_subtitle"
      id="live-title"
      path="~/github/live"
    />
    <LiveRepos client:visible />
  </section>
</template>
