<script setup lang="ts">
import { computed } from 'vue';
import { useLang } from '../stores/lang';
import { translations, skills } from '../data/site';

const lang = useLang();
const t = computed(() => translations[lang.value]);
</script>

<template>
  <section class="skills-section">
    <h2 class="section-title">
      <span class="hash">#</span> {{ t.sections.skills_title }}
    </h2>
    <p class="section-sub">{{ t.sections.skills_subtitle }}</p>

    <div class="skills-grid">
      <div v-for="(s, i) in skills" :key="s.name" class="skill" :style="{ animationDelay: `${i * 0.04}s` }">
        <div class="skill-head">
          <span class="icon">{{ s.icon }}</span>
          <span class="name">{{ s.name }}</span>
          <span class="level">{{ s.level }}%</span>
        </div>
        <div class="bar">
          <div class="fill" :style="{ width: s.level + '%' }"></div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.skills-section {
  margin: 5rem 0;
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
  margin: 0 0 2rem 0;
}

.skills-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1rem;
}

.skill {
  background: rgba(22, 27, 34, 0.5);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 0.85rem 1rem;
  transition: border-color 0.2s ease;
  animation: fadeUp 0.4s ease-out backwards;
}

.skill:hover {
  border-color: var(--accent);
}

.skill-head {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.icon {
  font-size: 1rem;
}

.name {
  flex: 1;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.85rem;
  color: var(--fg);
}

.level {
  font-size: 0.75rem;
  color: var(--muted);
  font-family: 'JetBrains Mono', ui-monospace, monospace;
}

.bar {
  height: 4px;
  background: rgba(74, 222, 128, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent), var(--accent-2));
  border-radius: 2px;
  transition: width 1s ease-out;
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>