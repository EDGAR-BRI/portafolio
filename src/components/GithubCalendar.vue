<script setup lang="ts">
import { ref, onMounted, computed, watch, nextTick } from 'vue';
import { Icon } from '@iconify/vue';
import { useLang } from '../stores/lang';
import { translations } from '../data/site';
import { getCached, setCached, clearCached } from '../composables/useGitHubCache';

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
const currentYear = new Date().getFullYear();
const year = ref(currentYear);
const hoveredCell = ref<{ date: string; count: number; level: number } | null>(null);
const calendarWrapRef = ref<HTMLElement | null>(null);

const username = 'EDGAR-BRI';

const levelColors = [
  'rgba(255, 255, 255, 0.04)',
  'rgba(74, 222, 128, 0.28)',
  'rgba(74, 222, 128, 0.52)',
  'rgba(74, 222, 128, 0.76)',
  '#4ade80',
];

function formatDateDisplay(iso: string, locale: string): string {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatTooltip(d: DayContribution): string {
  const n = d.count;
  const label = n === 0
    ? (lang.value === 'es' ? 'Sin contribuciones' : 'No contributions')
    : (lang.value === 'es' ? `${n} contribución${n === 1 ? '' : 'es'}` : `${n} contribution${n === 1 ? '' : 's'}`);
  return `${formatDateDisplay(d.date, lang.value)} — ${label}`;
}

const flatCells = computed(() => {
  const y = year.value;
  const first = new Date(y, 0, 1);
  const startOffset = first.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const isLeap = (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
  const totalDays = isLeap ? 366 : 365;

  const map = new Map<string, { level: number; count: number }>();
  for (const c of contributions.value) {
    if (!c.date.startsWith(String(y))) continue;
    map.set(c.date.slice(0, 10), { level: c.level, count: c.count });
  }

  const cells: { date: string; count: number; level: number; empty: boolean; col: number; row: number }[] = [];

  for (let i = 0; i < startOffset; i++) {
    cells.push({ date: '', count: 0, level: 0, empty: true, col: 2, row: i + 2 });
  }

  for (let day = 0; day < totalDays; day++) {
    const d = new Date(y, 0, day + 1);
    const dayOfYearIndex = day + startOffset;
    const weekIndex = Math.floor(dayOfYearIndex / 7);
    const dayOfWeek = dayOfYearIndex % 7;
    const iso = `${y}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const hit = map.get(iso);

    cells.push({
      date: iso,
      count: hit?.count ?? 0,
      level: hit?.level ?? 0,
      empty: false,
      col: weekIndex + 2,
      row: dayOfWeek + 2,
    });
  }

  return cells;
});

const dayLabels = computed(() => {
  return lang.value === 'es'
    ? ['', 'Lun', '', 'Mié', '', 'Vie', '']
    : ['', 'Mon', '', 'Wed', '', 'Fri', ''];
});

const monthLabels = computed(() => {
  const y = year.value;
  const locale = lang.value === 'es' ? 'es-ES' : 'en-US';
  const labels: { name: string; weekIndex: number }[] = [];
  let lastMonth = -1;

  for (const cell of flatCells.value) {
    if (cell.empty || !cell.date) continue;
    const m = new Date(cell.date + 'T00:00:00').getMonth();
    if (m !== lastMonth) {
      labels.push({
        name: new Date(cell.date + 'T00:00:00').toLocaleDateString(locale, { month: 'short' }),
        weekIndex: cell.col - 2,
      });
      lastMonth = m;
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
    if (d.count > 0) {
      cur++;
      if (cur > longest) longest = cur;
    } else {
      cur = 0;
    }
  }

  let currentStreak = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].count > 0) currentStreak++;
    else break;
  }

  return { total, activeDays, longest, currentStreak };
});

const todayIso = computed(() => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
});

function scrollToCurrentDate() {
  if (!calendarWrapRef.value) return;
  const wrap = calendarWrapRef.value;

  if (year.value === currentYear) {
    const todayCell = wrap.querySelector(`.cell[data-date="${todayIso.value}"]`) as HTMLElement | null;
    if (todayCell) {
      const cellRight = todayCell.offsetLeft + todayCell.offsetWidth;
      const wrapWidth = wrap.clientWidth;
      const targetScroll = Math.max(0, cellRight - wrapWidth + 40);
      wrap.scrollLeft = targetScroll;
      return;
    }
  }

  wrap.scrollLeft = wrap.scrollWidth;
}

function scrollCalendar(direction: 'left' | 'right') {
  if (calendarWrapRef.value) {
    const amount = direction === 'left' ? -220 : 220;
    calendarWrapRef.value.scrollBy({ left: amount, behavior: 'smooth' });
  }
}

async function load() {
  const cacheKey = `gh-cache:contributions:${username}:${year.value}`;
  const cached = getCached<{ contributions: DayContribution[] }>(cacheKey);
  if (cached && cached.contributions) {
    contributions.value = cached.contributions;
    loading.value = false;
    nextTick(() => {
      setTimeout(scrollToCurrentDate, 30);
    });
    return;
  }
  loading.value = true;
  error.value = null;
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 12000);
    const res = await fetch(
      `https://github-contributions-api.jogruber.de/v4/${username}?y=${year.value}`,
      { signal: ctrl.signal }
    );
    clearTimeout(timer);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    contributions.value = (data.contributions ?? []) as DayContribution[];
    setCached(cacheKey, data);
    nextTick(() => {
      setTimeout(scrollToCurrentDate, 30);
    });
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'unknown';
  } finally {
    loading.value = false;
  }
}

function refresh() {
  const cacheKey = `gh-cache:contributions:${username}:${year.value}`;
  clearCached(cacheKey);
  load();
}

watch(year, () => load());
onMounted(() => {
  load();
  window.addEventListener('resize', scrollToCurrentDate, { passive: true });
});
</script>

<template>
  <section class="github-calendar">
    <!-- Header Bar -->
    <div class="header-bar flex items-center justify-between mb-3 px-3 py-2 bg-[color:var(--bg-soft)] border border-[color:var(--line)] font-mono text-[0.75rem] tracking-[0.08em]">
      <div class="flex items-center gap-2 text-[color:var(--fg)] min-w-0">
        <Icon icon="lucide:calendar" width="14" height="14" class="text-[color:var(--accent)] shrink-0" />
        <span class="font-bold truncate">gh-calendar</span>
        <span class="text-[color:var(--accent)] font-semibold">· {{ stats.total }} {{ lang === 'es' ? 'contribuciones' : 'contributions' }}</span>
      </div>

      <div class="flex items-center gap-2 shrink-0">
        <!-- Year selector -->
        <select
          v-model.number="year"
          class="year-select"
          :aria-label="lang === 'es' ? 'Seleccionar año' : 'Select year'"
        >
          <option
            v-for="y in [currentYear, currentYear - 1, currentYear - 2, currentYear - 3]"
            :key="y"
            :value="y"
          >
            {{ y }}
          </option>
        </select>

        <button
          type="button"
          class="refresh-btn"
          :disabled="loading"
          @click="refresh"
          :title="lang === 'es' ? 'Recargar calendario' : 'Refresh calendar'"
          :aria-label="lang === 'es' ? 'Recargar calendario' : 'Refresh calendar'"
        >
          <Icon icon="lucide:refresh-cw" width="12" height="12" :class="{ 'animate-spin': loading }" />
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div
      v-if="loading"
      class="state-box loading-box"
    >
      <Icon icon="lucide:loader" width="16" height="16" class="animate-spin text-[color:var(--accent)]" />
      <span>{{ t.sections.live_loading }}</span>
    </div>

    <!-- Error State -->
    <div
      v-else-if="error"
      class="state-box error-box"
    >
      <Icon icon="lucide:alert-circle" width="16" height="16" />
      <span>{{ t.sections.live_error }}</span>
      <button type="button" class="retry-inline-btn" @click="refresh">
        {{ lang === 'es' ? 'Reintentar' : 'Retry' }}
      </button>
    </div>

    <!-- Calendar Matrix & Stats -->
    <div v-else class="calendar-container border border-[color:var(--line)] bg-[color:var(--bg-soft)] p-3">
      <!-- Mini Metric Badges & Pan Arrows -->
      <div class="metrics-row flex items-center justify-between gap-2 flex-wrap mb-3 font-mono text-[0.7rem]">
        <div class="flex items-center gap-2 flex-wrap">
          <div class="metric-pill">
            <span class="metric-label">{{ lang === 'es' ? 'Total' : 'Total' }}:</span>
            <span class="metric-val">{{ stats.total }}</span>
          </div>
          <div class="metric-pill">
            <span class="metric-label">{{ lang === 'es' ? 'Días activos' : 'Active days' }}:</span>
            <span class="metric-val">{{ stats.activeDays }}</span>
          </div>
          <div class="metric-pill">
            <span class="metric-label">{{ lang === 'es' ? 'Racha máx' : 'Max streak' }}:</span>
            <span class="metric-val">{{ stats.longest }}d</span>
          </div>
          <div v-if="stats.currentStreak > 0" class="metric-pill highlight">
            <span class="metric-label">{{ lang === 'es' ? 'Racha actual' : 'Current streak' }}:</span>
            <span class="metric-val">{{ stats.currentStreak }}d 🔥</span>
          </div>
        </div>

        <!-- Pan Controls (‹ / ›) without scrollbar clutter -->
        <div class="pan-controls flex items-center gap-1">
          <button
            type="button"
            class="pan-btn"
            @click="scrollCalendar('left')"
            :title="lang === 'es' ? 'Ver meses anteriores' : 'Scroll left'"
            :aria-label="lang === 'es' ? 'Ver meses anteriores' : 'Scroll left'"
          >
            <Icon icon="lucide:chevron-left" width="14" height="14" />
          </button>
          <button
            type="button"
            class="pan-btn"
            @click="scrollCalendar('right')"
            :title="lang === 'es' ? 'Ver meses recientes' : 'Scroll right'"
            :aria-label="lang === 'es' ? 'Ver meses recientes' : 'Scroll right'"
          >
            <Icon icon="lucide:chevron-right" width="14" height="14" />
          </button>
        </div>
      </div>

      <!-- Clean Touch Heatmap Grid (Zero Ugly Scrollbar) -->
      <div ref="calendarWrapRef" class="calendar-wrap">
        <div class="calendar-grid">
          <!-- Month Labels -->
          <div
            v-for="m in monthLabels"
            :key="m.name + m.weekIndex"
            class="month-label"
            :style="{ gridColumn: m.weekIndex + 2 }"
          >
            {{ m.name }}
          </div>

          <!-- Day of Week Labels -->
          <div
            v-for="(label, i) in dayLabels"
            :key="i"
            class="day-label"
            :style="{ gridRow: i + 2 }"
          >
            {{ label }}
          </div>

          <!-- Contribution Cells -->
          <div
            v-for="(cell, idx) in flatCells"
            :key="idx"
            class="cell"
            :data-date="cell.date"
            :class="{
              'is-empty': cell.empty,
              'has-activity': cell.count > 0,
              'is-today': cell.date === todayIso,
            }"
            :style="{
              gridColumn: cell.col,
              gridRow: cell.row,
              backgroundColor: cell.empty ? 'transparent' : levelColors[cell.level],
            }"
            :title="cell.empty ? '' : formatTooltip({ date: cell.date, count: cell.count, level: cell.level })"
            @mouseenter="!cell.empty && (hoveredCell = { date: cell.date, count: cell.count, level: cell.level })"
            @mouseleave="hoveredCell = null"
          ></div>
        </div>
      </div>

      <!-- Footer: Live Inspector & Legend -->
      <div class="calendar-footer flex items-center justify-between gap-3 mt-3 pt-2.5 border-t border-[color:var(--line)] font-mono text-[0.68rem] text-[color:var(--muted)] flex-wrap">
        <!-- Live Inspector Bar on hover -->
        <div class="inspector-info min-w-0 flex items-center gap-1.5 truncate">
          <span class="text-[color:var(--accent)] font-bold">&gt;</span>
          <span v-if="hoveredCell" class="text-[color:var(--fg)] truncate">
            {{ formatTooltip({ date: hoveredCell.date, count: hoveredCell.count, level: hoveredCell.level }) }}
          </span>
          <span v-else class="text-[color:var(--muted)] opacity-70 truncate">
            {{ lang === 'es' ? 'Pasa el cursor o toca un día para inspeccionar' : 'Hover or tap a cell to inspect' }}
          </span>
        </div>

        <!-- Legend -->
        <div class="legend flex items-center gap-1.5 shrink-0">
          <span>{{ lang === 'es' ? 'Menos' : 'Less' }}</span>
          <span
            v-for="(color, i) in levelColors"
            :key="i"
            class="legend-cell"
            :style="{ backgroundColor: color }"
          ></span>
          <span>{{ lang === 'es' ? 'Más' : 'More' }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.github-calendar {
  width: 100%;
}

.year-select {
  background: rgba(18, 24, 32, 0.85);
  border: 1px solid var(--line);
  color: var(--fg);
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.72rem;
  padding: 0.2rem 0.45rem;
  border-radius: 2px;
  cursor: pointer;
  outline: none;
  transition: border-color 0.15s ease;
}

.year-select:hover,
.year-select:focus {
  border-color: var(--accent);
}

.refresh-btn {
  background: transparent;
  border: 1px solid var(--line);
  color: var(--muted);
  padding: 0.25rem 0.45rem;
  border-radius: 2px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.refresh-btn:hover:not(:disabled) {
  border-color: var(--accent);
  color: var(--accent);
  background: rgba(74, 222, 128, 0.08);
}

.refresh-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.state-box {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 2rem 1rem;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.82rem;
  border: 1px dashed var(--line);
  color: var(--muted);
}

.error-box {
  border-color: #f85149;
  color: #f85149;
  background: rgba(248, 81, 73, 0.04);
}

.retry-inline-btn {
  background: transparent;
  border: 1px solid #f85149;
  color: #f85149;
  font-family: inherit;
  font-size: 0.75rem;
  padding: 0.2rem 0.5rem;
  cursor: pointer;
  border-radius: 2px;
  transition: all 0.15s ease;
}

.retry-inline-btn:hover {
  background: #f85149;
  color: #06080b;
}

.metrics-row {
  display: flex;
  gap: 0.5rem;
}

.metric-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.2rem 0.55rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--line);
  border-radius: 2px;
}

.metric-pill.highlight {
  border-color: rgba(74, 222, 128, 0.4);
  background: rgba(74, 222, 128, 0.08);
}

.metric-label {
  color: var(--muted);
}

.metric-val {
  color: var(--fg);
  font-weight: 700;
}

.metric-pill.highlight .metric-val {
  color: var(--accent);
}

.pan-btn {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--line);
  color: var(--muted);
  padding: 0.18rem 0.35rem;
  border-radius: 2px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.pan-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
  background: rgba(74, 222, 128, 0.08);
}

.calendar-wrap {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE/Edge */
  position: relative;
  padding-bottom: 2px;
}

.calendar-wrap::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}

.calendar-grid {
  display: grid;
  grid-template-columns: 24px repeat(53, minmax(10px, 1fr));
  grid-template-rows: 16px repeat(7, auto);
  gap: 2.5px;
  align-items: start;
  min-width: 610px;
}

.month-label {
  grid-row: 1;
  font-size: 0.62rem;
  font-family: 'JetBrains Mono', monospace;
  color: var(--muted);
  white-space: nowrap;
  line-height: 16px;
}

.day-label {
  grid-column: 1;
  font-size: 0.6rem;
  font-family: 'JetBrains Mono', monospace;
  color: var(--muted);
  display: flex;
  align-items: center;
  line-height: 1;
}

.cell {
  width: 100%;
  aspect-ratio: 1;
  min-width: 9px;
  min-height: 9px;
  border-radius: 2px;
  border: 1px solid rgba(255, 255, 255, 0.03);
  transition: transform 0.12s ease, outline 0.12s ease, box-shadow 0.12s ease;
  cursor: pointer;
}

.cell.is-empty {
  border: none;
  cursor: default;
}

.cell.has-activity {
  border-color: rgba(74, 222, 128, 0.15);
}

.cell.is-today {
  outline: 1.5px solid var(--accent);
  outline-offset: 1px;
  box-shadow: 0 0 6px rgba(74, 222, 128, 0.4);
}

.cell:hover:not(.is-empty) {
  transform: scale(1.35);
  z-index: 10;
  outline: 1px solid var(--accent);
  box-shadow: 0 0 8px rgba(74, 222, 128, 0.6);
}

.legend-cell {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 2px;
  border: 1px solid rgba(255, 255, 255, 0.04);
}

@media (max-width: 640px) {
  .calendar-container {
    padding: 0.65rem;
  }

  .metric-pill {
    font-size: 0.65rem;
    padding: 0.15rem 0.4rem;
  }

  .inspector-info {
    width: 100%;
  }

  .legend {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>