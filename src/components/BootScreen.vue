<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useLang } from '../stores/lang';
import { translations } from '../data/site';

const lang = useLang();
const t = computed(() => translations[lang.value].boot);

const SESSION_KEY = 'portfolio.booted';

const shown = ref(true);
const revealed = ref(0);
const typedChars = ref<Map<number, number>>(new Map());
const finished = ref(false);
const entering = ref(false);
const closing = ref(false);

type Phase = 'typing' | 'waiting-send-pwd' | 'finished';
const phase = ref<Phase>('typing');

let timers: ReturnType<typeof setTimeout>[] = [];
let keyHandler: ((e: KeyboardEvent) => void) | null = null;
let autoEnterTimer: ReturnType<typeof setTimeout> | null = null;

const reducedMotion = typeof window !== 'undefined'
  && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const lastLogin = ref('');

interface Line {
  text: string;
  type: 'cmd' | 'out' | 'ok' | 'info' | 'prompt' | 'pwd-prompt' | 'pwd' | 'auth-running';
  typed?: boolean;
  speed?: number;
}

const lines = computed<Line[]>(() => {
  const b = t.value;
  return [
    { text: b.connect, type: 'cmd', typed: true, speed: 30 },
    { text: b.password_prompt, type: 'pwd-prompt', typed: true, speed: 22 },
    { text: b.password, type: 'pwd', typed: true, speed: 35 },
    { text: b.authenticating, type: 'auth-running' },
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
  if (line.typed && !entering.value) {
    const chars = typedChars.value.get(index) ?? 0;
    return line.text.slice(0, chars);
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

function clearAutoEnter() {
  if (autoEnterTimer) {
    clearTimeout(autoEnterTimer);
    autoEnterTimer = null;
  }
}

function startAutoEnter(ms = 5000) {
  clearAutoEnter();
  autoEnterTimer = setTimeout(() => {
    if (shown.value && !entering.value && !closing.value) {
      onEnter();
    }
  }, ms);
}

function setTyped(idx: number, chars: number) {
  const m = new Map(typedChars.value);
  m.set(idx, chars);
  typedChars.value = m;
}

function revealAll() {
  revealed.value = lines.value.length;
  const m = new Map<number, number>();
  lines.value.forEach((l, i) => {
    if (l.typed) m.set(i, l.text.length);
  });
  typedChars.value = m;
  finished.value = true;
  phase.value = 'finished';
  startAutoEnter();
}

function startSequence() {
  if (reducedMotion) {
    revealAll();
    return;
  }

  const initialTyped = lines.value
    .map((l, i) => ({ line: l, idx: i }))
    .filter((x) => x.line.typed && x.line.type !== 'pwd');

  const pwdIdx = lines.value.findIndex((l) => l.type === 'pwd');
  const pwdLine = pwdIdx >= 0 ? lines.value[pwdIdx] : null;

  const firstTypedIdx = initialTyped[0]?.idx ?? 0;
  revealed.value = firstTypedIdx + 1;
  setTyped(firstTypedIdx, 1);

  let cursorMs = 0;
  for (const { line, idx } of initialTyped) {
    const total = line.text.length;
    const speed = line.speed ?? 30;
    for (let i = 1; i <= total; i++) {
      schedule(() => {
        setTyped(idx, i);
      }, cursorMs + i * speed);
    }
    cursorMs += total * speed + 60;
  }

  if (pwdLine && pwdIdx >= 0) {
    revealed.value = pwdIdx + 1;
    setTyped(pwdIdx, 1);
    const total = pwdLine.text.length;
    const speed = pwdLine.speed ?? 35;
    for (let i = 1; i <= total; i++) {
      schedule(() => {
        setTyped(pwdIdx, i);
      }, cursorMs + i * speed);
    }
    cursorMs += total * speed + 60;
  }

  schedule(() => {
    phase.value = 'waiting-send-pwd';
    startAutoEnter(5000);
  }, cursorMs + 80);
}

function sendPassword() {
  if (phase.value !== 'waiting-send-pwd') return;
  clearTimers();
  clearAutoEnter();
  phase.value = 'typing';

  const pwdIdx = lines.value.findIndex((l) => l.type === 'pwd');
  if (pwdIdx < 0) return;

  const rest = lines.value.slice(pwdIdx + 1);
  rest.forEach((line, idx) => {
    schedule(() => {
      revealed.value = pwdIdx + 2 + idx;
      if (idx === rest.length - 1) {
        schedule(() => {
          finished.value = true;
          phase.value = 'finished';
          startAutoEnter(5000);
        }, 220);
      }
    }, idx * 260);
  });
}

function typeEnterLines() {
  clearAutoEnter();
  const all = enterLines.value;
  all.forEach((_, idx) => {
    schedule(() => {
      revealed.value = lines.value.length + idx + 1;
    }, idx * 220);
  });

  const totalMs = (all.length - 1) * 220 + 220;
  schedule(() => {
    try { window.scrollTo({ top: 0, behavior: 'auto' }); } catch {}
    document.documentElement.classList.add('boot-dropping');
    closing.value = true;
    setTimeout(() => {
      document.documentElement.classList.remove('boot-pending', 'boot-dropping');
      shown.value = false;
      document.body.style.overflow = '';
      try { window.sessionStorage.setItem(SESSION_KEY, '1'); } catch {}
      window.dispatchEvent(new CustomEvent('portfolio:boot-done'));
    }, 550);
  }, totalMs);
}

function onEnter() {
  if (!shown.value) return;
  if (phase.value === 'typing') {
    clearTimers();
    revealAll();
    return;
  }
  if (phase.value === 'waiting-send-pwd') {
    sendPassword();
    return;
  }
  if (phase.value === 'finished') {
    if (entering.value || closing.value) return;
    entering.value = true;
    typeEnterLines();
  }
}

onMounted(() => {
  if (typeof window !== 'undefined') {
    keyHandler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'R' || e.key === 'r')) {
        try { window.sessionStorage.removeItem(SESSION_KEY); } catch {}
        return;
      }
      if (shown.value && e.key === 'Enter') {
        e.preventDefault();
        onEnter();
      }
    };
    window.addEventListener('keydown', keyHandler, true);
  }

  if (typeof window !== 'undefined' && window.sessionStorage.getItem(SESSION_KEY) === '1') {
    shown.value = false;
    document.documentElement.classList.remove('boot-pending');
    window.dispatchEvent(new CustomEvent('portfolio:boot-done'));
    return;
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

  startSequence();
});

onUnmounted(() => {
  clearTimers();
  clearAutoEnter();
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
          </div>

          <div v-if="phase === 'waiting-send-pwd'" class="enter-prompt">
            <span class="bracket">[</span>
            <span class="enter-text">{{ t.send_password }}</span>
            <span class="bracket">]</span>
            <span class="caret blink">█</span>
          </div>

          <div v-else-if="phase === 'finished'" class="enter-prompt">
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
  transition: opacity 0.55s ease;
}

.boot-overlay.closing {
  opacity: 0;
  pointer-events: none;
}

.boot-overlay.entering .terminal {
  opacity: 0;
  transform: scale(0.96);
  transition: opacity 0.45s ease, transform 0.45s ease;
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
  transition: opacity 0.45s ease, transform 0.45s ease;
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

.line-pwd-prompt {
  color: var(--muted);
}

.line-pwd {
  color: var(--accent);
  letter-spacing: 0.05em;
}

.line-auth-running {
  color: var(--muted);
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