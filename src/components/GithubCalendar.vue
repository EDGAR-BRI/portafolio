<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { Icon } from '@iconify/vue';
import { useLang } from '../stores/lang';
import { translations } from '../data/site';
import { getCached, setCached } from '../composables/useGitHubCache';

interface DayContribution {
  date: string;
  count: number;
  level: number;
}

const lang = useLang();
const t = computed(() => translations[lang.value]);

const contributions = ref<DayContribution[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const year = ref(new Date().getFullYear());

const username = 'EDGAR-BRI';

const levelColors = [
  'transparent',
  'rgba(74, 222, 128, 0.18)',
  'rgba(74, 222, 128, 0.38)',
  'rgba(74, 222, 128, 0.6)',
  '#4ade80',
];

function dayLabel(iso: string, locale: string): string {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function tooltip(d: DayContribution): string {
  const n = d.count;
  const label = n === 0
    ? (lang.value === 'es' ? 'Sin contribuciones' : 'No contributions')
    : (lang.value === 'es' ? `${n} contribución${n === 1 ? '' : 'es'}` : `${n} contribution${n === 1 ? '' : 's'}`);
  return `${dayLabel(d.date, lang.value)} — ${label}`;
}

const grid = computed(() => {
  const y = year.value;
  const first = new Date(`${y}-01-01T00:00:00`);
  const startOffset = first.getDay();
  const isLeap = (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
  const totalDays = isLeap ? 366 : 365;

  const map = new Map<string, { level: number; count: number }>();
  for (const c of contributions.value) {
    if (!c.date.startsWith(String(y))) continue;
    map.set(c.date.slice(0, 10), { level: c.level, count: c.count });
  }

  const cells: { date: string; count: number; level: number; empty: boolean }[] = [];
  for (let day = 0; day < totalDays; day++) {
    const d = new Date(y, 0, day + 1);
    const iso = `${y}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (day < startOffset) {
      cells.push({ date: '', count: 0, level: 0, empty: true });
    } else {
      const hit = map.get(iso);
      cells.push({ date: iso, count: hit?.count ?? 0, level: hit?.level ?? 0, empty: false });
    }
  }

  const weeks: typeof cells[] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
});

// Calculate month label positions: the first week index where each month starts
const monthLabels = computed(() => {
  const y = year.value;
  const locale = lang.value === 'es' ? 'es-ES' : 'en-US';
  const labels: { name: string; weekIndex: number }[] = [];
  let lastMonth = -1;

  for (let wi = 0; wi < grid.value.length; wi++) {
    for (const cell of grid.value[wi]) {
      if (cell.empty || !cell.date) continue;
      const m = new Date(cell.date + 'T00:00:00').getMonth();
      if (m !== lastMonth) {
        labels.push({
          name: new Date(cell.date + 'T00:00:00').toLocaleDateString(locale, { month: 'short' }),
          weekIndex: wi,
        });
        lastMonth = m;
      }
      break;
    }
  }
  return labels;
});

const stats = computed(() => {
  const y = year.value;
  const days = contributions.value
    .filter((c) => c.date.startsWith(String(y)))
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date));

  const total = days.reduce((s, d) => s + d.count, 0);
  const activeDays = days.filter((d) => d.count > 0).length;

  let longest = 0, cur = 0;
  for (const d of days) {
    if (d.count > 0) { cur++; if (cur > longest) longest = cur; }
    else cur = 0;
  }

  let current = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].count > 0) current++;
    else break;
  }

  return { total, activeDays, longest, current };
});

async function load() {
  const cacheKey = `gh-cache:contributions:${username}:${year.value}`;
  const cached = getCached<{ contributions: DayContribution[] }>(cacheKey);
  if (cached) {
    contributions.value = cached.contributions ?? [];
    loading.value = false;
    return;
  }
  loading.value = true;
  error.value = null;
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 15000);
    const res = await fetch(
      `https://github-contributions-api.jogruber.de/v4/${username}?y=${year.value}`,
      { signal: ctrl.signal }
    );
    clearTimeout(timer);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    contributions.value = (data.contributions ?? []) as DayContribution[];
    setCached(cacheKey, data);
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'unknown';
  } finally {
    loading.value = false;
  }
}

watch(year, () => load());
onMounted(load);
</script>

<template>
  <section class="github-calendar">
    <div class="flex items-center justify-between mb-3 px-3 py-1.5 bg-[color:var(--bg-soft)] border border-[color:var(--line)] font-mono text-[0.75rem] tracking-[0.1em]">
      <div class="flex items-center gap-2 text-[color:var(--muted)]">
        <Icon icon="lucide:calendar" width="13" height="13" class="text-[color:var(--accent)]" />
        <span>{{ stats.total }} {{ lang === 'es' ? 'contribuciones' : 'contributions' }} · {{ year }}</span>
      </div>
      <select
        v-model.number="year"
        class="bg-transparent border border-[color:var(--line)] text-[color:var(--muted)] text-[0.7rem] px-1.5 py-0.5 cursor-pointer outline-none focus:border-[color:var(--accent)]"
        :aria-label="lang === 'es' ? 'Año' : 'Year'"
      >
        <option v-for="y in [new Date().getFullYear(), new Date().getFullYear() - 1, new Date().getFullYear() - 2, new Date().getFullYear() - 3]" :key="y" :value="y">{{ y }}</option>
      </select>
    </div>

    <div
      v-if="loading"
      class="flex items-center gap-3 text-[color:var(--muted)] py-6 justify-center font-mono text-[0.85rem] border border-dashed border-[color:var(--line)]"
    >
      <Icon icon="lucide:loader" width="16" height="16" class="animate-spin" />
      <span>{{ t.sections.live_loading }}</span>
    </div>

    <div
      v-else-if="error"
      class="flex items-center gap-3 text-[#f85149] py-6 justify-center font-mono text-[0.85rem] border border-dashed border-[#f85149]"
    >
      <Icon icon="lucide:alert-circle" width="16" height="16" />
      <span>{{ t.sections.live_error }}</span>
    </div>

    <template v-else>
      <div class="stats-row flex flex-wrap gap-2 mb-2 font-mono text-[0.7rem]">
        <div class="stat flex items-center gap-1.5 text-[color:var(--muted)]">
          <span class="text-[color:var(--accent)]">{{ stats.total }}</span>
          <span>{{ lang === 'es' ? 'total' : 'total' }}</span>
        </div>
        <div class="stat flex items-center gap-1.5 text-[color:var(--muted)]">
          <span class="text-[color:var(--accent)]">{{ stats.activeDays }}</span>
          <span>{{ lang === 'es' ? 'días' : 'days' }}</span>
        </div>
        <div class="stat flex items-center gap-1.5 text-[color:var(--muted)]">
          <span class="text-[color:var(--accent)]">{{ stats.longest }} 🔥</span>
          <span>{{ lang === 'es' ? 'mejor racha' : 'best streak' }}</span>
        </div>
        <div class="stat flex items-center gap-1.5 text-[color:var(--muted)]">
          <span class="text-[color:var(--accent)]">{{ stats.current }}</span>
          <span>{{ lang === 'es' ? 'actual' : 'current' }}</span>
        </div>
      </div>

      <div class="calendar-wrap border border-[color:var(--line)] bg-[color:var(--bg-soft)] p-2.5 overflow-x-auto">
        <div class="calendar-grid">
          <div class="day-labels-col font-mono text-[0.6rem] text-[color:var(--muted)]">
            <span></span>
            <span>{{ lang === 'es' ? 'Lun' : 'Mon' }}</span>
            <span></span>
            <span>{{ lang === 'es' ? 'Mié' : 'Wed' }}</span>
            <span></span>
            <span>{{ lang === 'es' ? 'Vie' : 'Fri' }}</span>
            <span></span>
            <span>{{ lang === 'es' ? 'Dom' : 'Sun' }}</span>
          </div>

          <div class="calendar-main">
            <div class="month-row font-mono text-[0.6rem] text-[color:var(--muted)] h-3">
              <span
                v-for="m in monthLabels"
                :key="m.name + m.weekIndex"
                class="month-cell-label"
                :style="{ gridColumnStart: m.weekIndex + 1 }"
              >{{ m.name }}</span>
            </div>

            <div class="weeks-row">
              <div
                v-for="(week, wi) in grid"
                :key="wi"
                class="week-col"
              >
                <div
                  v-for="(cell, di) in week"
                  :key="di"
                  class="cell"
                  :style="{ background: cell.empty ? 'transparent' : levelColors[cell.level] }"
                  :title="cell.empty ? '' : tooltip({ date: cell.date, count: cell.count, level: cell.level })"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2 mt-2 justify-end text-[0.65rem] text-[color:var(--muted)] font-mono">
          <span>{{ lang === 'es' ? 'Menos' : 'Less' }}</span>
          <span
            v-for="i in 5"
            :key="i"
            class="legend-cell"
            :style="{
              background: i === 1 ? 'transparent' : levelColors[i - 1],
              border: i === 1 ? '1px solid var(--line)' : 'none'
            }"
          ></span>
          <span>{{ lang === 'es' ? 'Más' : 'More' }}</span>
        </div>
      </div>
    </template>
  </section>
</template>

<style scoped>
.github-calendar {
  width: 100%;
}

.stat {
  padding: 0.15rem 0.5rem;
  border: 1px solid var(--line);
  background: var(--bg-soft);
}

.calendar-wrap {
  scrollbar-width: thin;
}

.calendar-wrap::-webkit-scrollbar {
  height: 6px;
}

.calendar-wrap::-webkit-scrollbar-thumb {
  background: var(--line);
}

.calendar-wrap > .calendar-grid {
  min-width: max-content;
}

.calendar-grid {
  display: flex;
  gap: 6px;
}

.day-labels-col {
  display: grid;
  grid-template-rows: repeat(7, 12px);
  gap: 2px;
  width: 24px;
  align-items: center;
  flex-shrink: 0;
}

.day-labels-col > span {
  height: 12px;
  line-height: 12px;
  font-size: 0.6rem;
  white-space: nowrap;
}

.calendar-main {
  width: fit-content;
  flex: 0 0 auto;
  min-width: 0;
}

.month-row {
  display: grid;
  grid-template-columns: repeat(53, 14px);
  gap: 2px;
  margin-bottom: 2px;
  position: relative;
  height: 14px;
}

.month-cell-label {
  font-size: 0.65rem;
  white-space: nowrap;
  line-height: 14px;
  height: 14px;
  grid-row: 1;
}

.weeks-row {
  display: grid;
  grid-template-columns: repeat(53, 14px);
  gap: 2px;
  width: fit-content;
}

.week-col {
  display: grid;
  grid-template-rows: repeat(7, 14px);
  gap: 2px;
  width: 14px;
}

.cell {
  width: 14px;
  height: 14px;
}

.legend-cell {
  display: inline-block;
  width: 10px;
  height: 10px;
}
</style>