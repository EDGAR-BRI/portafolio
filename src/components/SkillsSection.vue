<script setup lang="ts">
import { computed } from 'vue';
import { Icon } from '@iconify/vue';
import { useLang } from '../stores/lang';
import { translations, skills } from '../data/site';

const lang = useLang();
const t = computed(() => translations[lang.value]);
</script>

<template>
  <section class="skills-section" id="skills">
    <div class="section-label">[ skills ]</div>
    <h2 class="section-title">
      <span class="hash">#</span> {{ t.sections.skills_title }}
    </h2>
    <p class="section-sub">{{ t.sections.skills_subtitle }}</p>

    <div class="skills-grid">
      <div
        v-for="(s, i) in skills"
        :key="s.name"
        class="skill corner"
        :style="{ animationDelay: `${i * 0.04}s` }"
      >
        <div class="skill-head">
          <Icon :icon="s.icon" class="icon" width="20" height="20" />
          <span class="name">{{ s.name }}</span>
          <span class="level">{{ s.level }}%</span>
        </div>
        <div class="bar">
          <div class="fill" :style="{ width: s.level + '%' }"></div>
          <div class="bar-grid" aria-hidden="true">
            <span v-for="n in 10" :key="n"></span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.skills-section {
  margin: 5rem 0;
}

.skills-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 0;
  border: 1px solid var(--line);
}

.skill {
  padding: 1rem 1.1rem;
  border: 1px solid var(--line);
  margin: -1px 0 0 -1px;
  background: var(--bg-soft);
  transition: background 0.15s ease, border-color 0.15s ease;
  animation: fadeUp 0.4s ease-out backwards;
  position: relative;
}

.skill:hover {
  background: rgba(74, 222, 128, 0.05);
  z-index: 1;
}

.skill-head {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 0.75rem;
}

.icon {
  color: var(--accent);
  flex-shrink: 0;
}

.name {
  flex: 1;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.85rem;
  color: var(--fg);
  font-weight: 500;
}

.level {
  font-size: 0.75rem;
  color: var(--muted);
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  letter-spacing: 0.05em;
}

.bar {
  position: relative;
  height: 8px;
  background: transparent;
  display: flex;
  gap: 1px;
}

.fill {
  position: absolute;
  inset: 0;
  background: var(--accent);
  opacity: 0.7;
  transition: width 1s ease-out;
  z-index: 1;
}

.bar-grid {
  position: absolute;
  inset: 0;
  display: flex;
  gap: 1px;
  z-index: 0;
}

.bar-grid span {
  flex: 1;
  background: var(--line);
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>