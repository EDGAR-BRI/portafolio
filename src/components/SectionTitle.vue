<script setup lang="ts">
interface Props {
  title: string;
  subtitle?: string;
  id?: string;
  hash?: string;
  path?: string;
  tag?: 'h2' | 'h3';
  count?: number | string;
}

const props = withDefaults(defineProps<Props>(), {
  hash: '#',
  tag: 'h2',
});
</script>

<template>
  <header class="section-header mb-6 sm:mb-8">
    <div class="flex items-center justify-between gap-3 flex-wrap">
      <component
        :is="tag"
        :id="id"
        class="section-title text-[clamp(1.35rem,3.8vw,2.05rem)] font-bold font-mono m-0 flex items-center gap-2 text-[color:var(--fg)] tracking-[-0.01em]"
      >
        <span class="hash text-[color:var(--accent)] font-bold select-none" aria-hidden="true">{{ hash }}</span>
        <span>{{ title }}</span>
        <span
          v-if="count !== undefined"
          class="text-[0.72rem] font-normal px-2 py-0.5 border border-[color:var(--line)] bg-[color:var(--bg-soft)] text-[color:var(--accent)] rounded-[2px]"
        >
          {{ count }}
        </span>
      </component>

      <span
        v-if="path"
        class="font-mono text-[0.72rem] text-[color:var(--muted)] opacity-75 hidden sm:inline-block"
      >
        {{ path }}
      </span>
    </div>

    <p
      v-if="subtitle"
      class="section-sub text-[clamp(0.9rem,1.8vw,0.98rem)] text-[color:var(--muted)] leading-relaxed mt-1.5 mb-0 max-w-2xl"
    >
      {{ subtitle }}
    </p>
  </header>
</template>

<style scoped>
.hash {
  text-shadow: 0 0 10px rgba(74, 222, 128, 0.35);
}
</style>
