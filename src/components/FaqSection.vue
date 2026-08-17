<script setup lang="ts">
import { computed, ref } from 'vue';
import { useLang } from '../stores/lang';
import { translations } from '../data/site';

const lang = useLang();
const t = computed(() => translations[lang.value]);
const open = ref<number>(0);
</script>

<template>
  <section class="my-20" id="faq">
    <div class="section-label">[ faq ]</div>
    <h2 class="section-title">
      <span class="hash">#</span> {{ t.faq_title }}
    </h2>

    <div class="faq-list">
      <details
        v-for="(item, i) in t.faq"
        :key="i"
        class="faq-item"
        :open="open === i"
        @toggle="open = ($event.target as HTMLDetailsElement).open ? i : open"
      >
        <summary class="faq-q">
          <span class="faq-prompt">&gt;</span>
          <span>{{ item.q }}</span>
          <span class="faq-caret" aria-hidden="true">+</span>
        </summary>
        <p class="faq-a">{{ item.a }}</p>
      </details>
    </div>
  </section>
</template>

<style scoped>
.faq-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.faq-item {
  border: 1px solid var(--line);
  background: var(--bg-soft);
}

.faq-item[open] {
  border-color: var(--line-strong);
}

.faq-q {
  list-style: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.95rem;
  color: var(--fg);
  user-select: none;
}

.faq-q::-webkit-details-marker {
  display: none;
}

.faq-prompt {
  color: var(--accent);
  font-weight: 700;
}

.faq-caret {
  margin-left: auto;
  color: var(--muted);
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  transition: transform 0.2s ease;
}

.faq-item[open] .faq-caret {
  transform: rotate(45deg);
  color: var(--accent);
}

.faq-a {
  margin: 0;
  padding: 0 1.25rem 1.25rem 3rem;
  color: var(--muted);
  line-height: 1.6;
  font-size: 0.95rem;
}
</style>