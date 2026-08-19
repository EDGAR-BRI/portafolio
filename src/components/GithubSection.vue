<script setup lang="ts">
import { computed } from 'vue';
import { useLang } from '../stores/lang';
import { translations } from '../data/site';
import GithubLanguages from './GithubLanguages.vue';
import GithubContributions from './GithubContributions.vue';
import GithubCalendar from './GithubCalendar.vue';
import SectionTitle from './SectionTitle.vue';

const lang = useLang();
const t = computed(() => translations[lang.value]);
</script>

<template>
  <section class="my-12 sm:my-16" id="github-stack">
    <SectionTitle
      :title="t.sections.github_langs_title"
      :subtitle="t.sections.github_langs_subtitle"
      id="github-title"
      path="~/github/stack"
    />

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 items-stretch">
      <div class="flex flex-col h-full">
        <GithubLanguages client:visible />
      </div>
      <div class="flex flex-col justify-between gap-5 sm:gap-6 h-full">
        <GithubContributions client:visible />
        <GithubCalendar client:visible />
      </div>
    </div>
  </section>
</template>