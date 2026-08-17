<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useLang } from '../stores/lang';
import { translations } from '../data/site';

const lang = useLang();
const t = computed(() => translations[lang.value].boot);

const SESSION_KEY = 'portfolio.booted';

const shown = ref(true);
const revealed = ref(0);
const typedChars = ref(0);
const finished = ref(false);
const entering = ref(false);
const closing = ref(false);

let timers: ReturnType<typeof setTimeout>[] = [];
let keyHandler: ((e: KeyboardEvent) => void) | null = null;

const reducedMotion = typeof window !== 'undefined'
  && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const lastLogin = ref('');

interface Line {
  text: string;
  type: 'cmd' | 'out' | 'ok' | 'info' | 'prompt' | 'enter';
  typed?: boolean;
}

const lines = computed<Line[]>(() => {
  const b = t.value;
  return [
    { text: b.connect, type: 'cmd', typed: true },
    { text: b.connecting, type: 'out' },
    { text: b.ok, type: 'ok' },
    { text: b.auth, type: 'ok' },
    { text: b.welcome, type: 'info' },
    { text: `${b.last} ${lastLogin.value}`, type: 'info' },
    { text: b.prompt, type: 'prompt' },
  ];
});

const enterLines = computed<Line[]>(() => {
  const b = t.value;
  return [
    { text: b.connecting, type: 'out' },
    { text: b.ok_enter, type: 'ok' },
  ];
});

const visibleLines = computed(() => {
  if (entering.value) return [...lines.value, ...enterLines.value];
  return lines.value.slice(0, revealed.value);
});

function lineText(line: Line, index: number): string {
  if (line.typed && index === 0 && !entering.value) {
    return line.text.slice(0, typedChars.value);
  }
  return line.text;
}

function schedule(fn: () => void, ms: number) {
  const id = setTimeout(fn, ms);
  timers.push(id);
}

function clearTimers() {
  for (const id of timers) clearTimeout(id);
  timers = [];
}

function revealAll() {
  revealed.value = lines.value.length;
  typedChars.value = lines.value[0]?.text.length ?? 0;
  finished.value = true;
}

function startSequence() {
  if (reducedMotion) {
    revealAll();
    return;
  }

  const cmd = lines.value[0];
  if (!cmd) return;
  const total = cmd.text.length;
  const speed = 45;
  for (let i = 1; i <= total; i++) {
    schedule(() => {
      typedChars.value = i;
    }, i * speed);
  }

  const cmdEnd = total * speed;
  const rest = lines.value.slice(1);
  const stepGap = 320;
  rest.forEach((_, idx) => {
    schedule(() => {
      revealed.value = idx + 2;
      if (idx === rest.length - 1) {
        schedule(() => {
          finished.value = true;
        }, 250);
      }
    }, cmdEnd + 350 + idx * stepGap);
  });
}

function typeEnterLines() {
  const all = enterLines.value;
  all.forEach((_, idx) => {
    schedule(() => {
      revealed.value = lines.value.length + idx + 1;
    }, idx * 220);
  });

  const totalMs = (all.length - 1) * 220 + 220;
  schedule(() => {
    closing.value = true;
    setTimeout(() => {
      shown.value = false;
      document.body.style.overflow = '';
      window.dispatchEvent(new CustomEvent('portfolio:boot-done'));
    }, 700);
  }, totalMs);
}

function onEnter() {
  if (!shown.value) return;
  if (!finished.value) {
    clearTimers();
    revealAll();
    return;
  }
  if (entering.value || closing.value) return;
  entering.value = true;
  typeEnterLines();
}

function dismiss() {
  shown.value = false;
  closing.value = false;
  entering.value = false;
  document.body.style.overflow = '';
  window.dispatchEvent(new CustomEvent('portfolio:boot-done'));
}

onMounted(() => {
  if (typeof window !== 'undefined') {
    if (window.sessionStorage.getItem(SESSION_KEY) === '1') {
      shown.value = false;
      window.dispatchEvent(new CustomEvent('portfolio:boot-done'));
      return;
    }
    window.sessionStorage.setItem(SESSION_KEY, '1');
  }

  const locale = lang.value === 'es' ? 'es-ES' : 'en-US';
  lastLogin.value = new Date().toLocaleString(locale, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  document.body.style.overflow = 'hidden';

  keyHandler = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onEnter();
    }
  };
  window.addEventListener('keydown', keyHandler);

  startSequence();
});

onUnmounted(() => {
  clearTimers();
  if (keyHandler) window.removeEventListener('keydown', keyHandler);
});
</script>

<template>
  <div
    v-if="shown"
    class="boot-overlay"
    :class="{ closing, entering }"
    role="dialog"
    aria-modal="true"
    :aria-label="lang === 'es' ? 'Conexión al portafolio' : 'Connecting to portfolio'"
  >
    <div class="boot-bg"></div>
    <div class="terminal-wrap">
      <div class="terminal corner" :aria-hidden="true">
        <div class="terminal-bar">
          <span class="dot bg-[#ff5f56]"></span>
          <span class="dot bg-[#ffbd2e]"></span>
          <span class="dot bg-[#27c93f]"></span>
          <span class="ml-2 inline-flex items-center gap-1.5 text-[color:var(--muted)] text-[0.75rem]">
            <span class="opacity-60">●</span>
            {{ t.title }}
          </span>
        </div>

        <div class="terminal-body">
          <div
            v-for="(line, idx) in visibleLines"
            :key="idx + '-' + (entering ? 'e' : 'b')"
            class="line"
            :class="['line-' + line.type]"
          >
            <span class="text">{{ lineText(line, idx) }}</span>
            <span
              v-if="line.typed && idx === 0 && typedChars < (lines[0]?.text.length ?? 0)"
              class="caret"
            >█</span>
            <span
              v-else-if="line.type === 'prompt' && finished && !entering"
              class="caret"
            >█</span>
          </div>

          <div v-if="finished && !entering" class="enter-prompt">
            <span class="bracket">[</span>
            <span class="enter-text">{{ t.enter }}</span>
            <span class="bracket">]</span>
            <span class="caret blink">█</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.boot-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  transition: opacity 0.5s ease;
}

.boot-overlay.closing {
  opacity: 0;
  pointer-events: none;
}

.boot-overlay.entering .terminal {
  transform: translateY(-110%);
  transition: transform 0.7s cubic-bezier(0.55, 0.06, 0.68, 0.19);
}

.boot-overlay.entering .boot-bg {
  opacity: 0;
  transition: opacity 0.7s ease 0.1s;
}

.boot-bg {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(var(--grid) 1px, transparent 1px),
    linear-gradient(90deg, var(--grid) 1px, transparent 1px),
    var(--bg);
  background-size: 48px 48px, 48px 48px, 100% 100%;
  z-index: -1;
}

.terminal-wrap {
  width: min(640px, calc(100vw - 2rem));
  max-height: calc(100vh - 2rem);
  overflow: hidden;
}

.terminal {
  background: var(--bg-soft);
  border: 1px solid var(--line);
  overflow: hidden;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.85rem;
  transition: transform 0.7s cubic-bezier(0.55, 0.06, 0.68, 0.19);
}

.terminal-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background: rgba(0, 0, 0, 0.4);
  border-bottom: 1px solid var(--line);
}

.dot {
  display: inline-block;
  width: 10px;
  height: 10px;
}

.terminal-body {
  padding: 1rem 1.25rem 1.5rem;
  line-height: 1.7;
  color: var(--fg);
  min-height: 14rem;
  overflow-y: auto;
}

.line {
  white-space: pre-wrap;
  word-break: break-word;
  animation: fadeIn 0.25s ease-out;
}

.line-cmd {
  color: var(--fg);
}

.line-out {
  color: var(--muted);
}

.line-ok {
  color: var(--accent);
}

.line-info {
  color: var(--fg);
}

.line-prompt {
  color: var(--accent);
  margin-top: 0.5rem;
}

.caret {
  display: inline-block;
  margin-left: 2px;
  color: var(--accent);
  animation: blink 1s steps(1) infinite;
}

.enter-prompt {
  margin-top: 1rem;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.8rem;
  color: var(--muted);
  animation: fadeIn 0.3s ease-out;
}

.enter-text {
  color: var(--accent);
  letter-spacing: 0.05em;
}

.bracket {
  color: var(--muted);
  opacity: 0.6;
}

.blink {
  animation: blink 1s steps(1) infinite;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-2px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes blink {
  50% { opacity: 0; }
}

@media (max-width: 520px) {
  .terminal-body { padding: 0.75rem 0.9rem 1.1rem; font-size: 0.78rem; }
  .enter-prompt { font-size: 0.75rem; }
}
</style>