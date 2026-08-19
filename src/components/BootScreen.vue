<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { Icon } from '@iconify/vue';
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
    { text: b.connect, type: 'cmd', typed: true, speed: 50 },
    { text: b.password_prompt, type: 'pwd-prompt' },
    { text: b.password, type: 'pwd', typed: true, speed: 80 },
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

interface Row {
  key: string;
  items: { line: Line; index: number }[];
}

const visibleRows = computed<Row[]>(() => {
  const rows: Row[] = [];
  let i = 0;
  const list = visibleLines.value;
  while (i < list.length) {
    const cur = list[i];
    if (cur.type === 'pwd-prompt' && i + 1 < list.length && list[i + 1].type === 'pwd') {
      rows.push({ key: `grp-${i}`, items: [
        { line: cur, index: i },
        { line: list[i + 1], index: i + 1 },
      ]});
      i += 2;
    } else {
      rows.push({ key: `row-${i}`, items: [{ line: cur, index: i }] });
      i += 1;
    }
  }
  return rows;
});

function lineText(line: Line, index: number): string {
  if (line.typed && !entering.value) {
    const chars = typedChars.value.get(index) ?? 0;
    return line.text.slice(0, chars);
  }
  return line.text;
}

function isTyping(line: Line, index: number): boolean {
  if (phase.value === 'finished' || entering.value) return false;
  if (!line.typed) return false;
  if (revealed.value !== index + 1) return false;
  const chars = typedChars.value.get(index) ?? 0;
  return chars < line.text.length;
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

  // 1. Initially reveal ONLY command line 0 ($ ssh ...)
  revealed.value = 1;
  setTyped(0, 0);

  const cmdLine = lines.value[0];
  const total = cmdLine.text.length;
  const speed = cmdLine.speed ?? 50;

  let cursorMs = 0;
  for (let i = 1; i <= total; i++) {
    schedule(() => {
      setTyped(0, i);
    }, i * speed);
  }
  cursorMs = total * speed + 300;

  // 2. Reveal password prompt (Line 1)
  schedule(() => {
    revealed.value = 2;
  }, cursorMs);

  cursorMs += 450;

  // 3. Reveal password line (Line 2) and type asterisks sequentially
  const pwdIdx = lines.value.findIndex((l) => l.type === 'pwd');
  const pwdLine = pwdIdx >= 0 ? lines.value[pwdIdx] : null;

  if (pwdLine && pwdIdx >= 0) {
    schedule(() => {
      revealed.value = pwdIdx + 1;
      setTyped(pwdIdx, 0);
    }, cursorMs);

    const pwdTotal = pwdLine.text.length;
    const pwdSpeed = pwdLine.speed ?? 80;

    for (let i = 1; i <= pwdTotal; i++) {
      schedule(() => {
        setTyped(pwdIdx, i);
      }, cursorMs + i * pwdSpeed);
    }
    cursorMs += pwdTotal * pwdSpeed + 250;
  }

  // 4. Waiting for send password
  schedule(() => {
    phase.value = 'waiting-send-pwd';
    startAutoEnter(5000);
  }, cursorMs);
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
        }, 280);
      }
    }, idx * 350);
  });
}

function typeEnterLines() {
  clearAutoEnter();
  const all = enterLines.value;
  all.forEach((_, idx) => {
    schedule(() => {
      revealed.value = lines.value.length + idx + 1;
    }, idx * 300);
  });

  const totalMs = (all.length - 1) * 300 + 260;
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

function skipIntro() {
  if (!shown.value || closing.value) return;
  clearTimers();
  clearAutoEnter();
  try { window.scrollTo({ top: 0, behavior: 'auto' }); } catch {}
  document.documentElement.classList.add('boot-dropping');
  closing.value = true;
  setTimeout(() => {
    document.documentElement.classList.remove('boot-pending', 'boot-dropping');
    shown.value = false;
    document.body.style.overflow = '';
    try { window.sessionStorage.setItem(SESSION_KEY, '1'); } catch {}
    window.dispatchEvent(new CustomEvent('portfolio:boot-done'));
  }, 350);
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
      if (shown.value && (e.key === 'Escape' || e.key === 'Esc')) {
        e.preventDefault();
        skipIntro();
        return;
      }
      if (shown.value && (e.key === 'Enter' || e.key === ' ')) {
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
    @click="onEnter"
  >
    <div class="boot-bg"></div>
    <div class="terminal-wrap" @click.stop="onEnter">
      <div class="terminal corner" :aria-hidden="true">
        <div class="terminal-bar">
          <div class="flex items-center gap-1.5 shrink-0">
            <span class="dot bg-[#ff5f56]"></span>
            <span class="dot bg-[#ffbd2e]"></span>
            <span class="dot bg-[#27c93f]"></span>
          </div>
          <span class="ml-2 inline-flex items-center gap-1.5 text-[color:var(--muted)] text-[0.72rem] sm:text-[0.75rem] truncate flex-1 min-w-0">
            <span class="opacity-60 shrink-0">●</span>
            <span class="truncate">{{ t.title }}</span>
          </span>
          <button
            type="button"
            class="skip-btn"
            @click.stop="skipIntro"
            :title="t.skip"
            :aria-label="t.skip"
          >
            {{ t.skip }}
          </button>
        </div>

        <div class="terminal-body">
          <div
            v-for="row in visibleRows"
            :key="row.key + '-' + (entering ? 'e' : 'b')"
            class="line"
            :class="row.items.length > 1 ? 'line-pwd-row' : 'line-' + row.items[0].line.type"
          >
            <template v-for="(item, j) in row.items" :key="j">
              <span
                class="line-segment"
                :class="'line-' + item.line.type"
              >{{ lineText(item.line, item.index) }}</span>
              <span
                v-if="isTyping(item.line, item.index)"
                class="caret blink"
                aria-hidden="true"
              >█</span>
            </template>
            <!-- Cursor for the final shell prompt -->
            <span
              v-if="row.items.some(it => it.line.type === 'prompt') && phase === 'finished' && !entering"
              class="caret blink"
              aria-hidden="true"
            >█</span>
          </div>

          <button
            v-if="phase === 'waiting-send-pwd'"
            type="button"
            class="enter-prompt"
            @click.stop="onEnter"
            :aria-label="t.send_password"
          >
            <span class="bracket">[</span>
            <span class="enter-text">{{ t.send_password }}</span>
            <span class="bracket">]</span>
            <Icon icon="lucide:corner-down-left" width="13" height="13" class="enter-icon" aria-hidden="true" />
          </button>

          <button
            v-else-if="phase === 'finished'"
            type="button"
            class="enter-prompt"
            @click.stop="onEnter"
            :aria-label="t.enter"
          >
            <span class="bracket">[</span>
            <span class="enter-text">{{ t.enter }}</span>
            <span class="bracket">]</span>
            <Icon icon="lucide:corner-down-left" width="13" height="13" class="enter-icon" aria-hidden="true" />
          </button>
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
  padding: 1rem;
  transition: opacity 0.55s ease;
  user-select: none;
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
  width: min(640px, 100%);
  max-height: min(88dvh, 620px);
  display: flex;
  flex-direction: column;
}

.terminal {
  background: var(--bg-soft);
  border: 1px solid var(--line);
  display: flex;
  flex-direction: column;
  max-height: 100%;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.85rem;
  transition: opacity 0.45s ease, transform 0.45s ease;
  cursor: pointer;
}

.terminal-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.45);
  border-bottom: 1px solid var(--line);
  min-height: 38px;
}

.skip-btn {
  background: transparent;
  border: 1px solid var(--line);
  color: var(--muted);
  font-family: inherit;
  font-size: 0.68rem;
  padding: 0.2rem 0.5rem;
  cursor: pointer;
  letter-spacing: 0.05em;
  transition: all 0.15s ease;
  white-space: nowrap;
  border-radius: 2px;
}

.skip-btn:hover,
.skip-btn:focus-visible {
  color: var(--accent);
  border-color: var(--accent);
  background: rgba(74, 222, 128, 0.06);
}

.dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.terminal-body {
  padding: 1rem 1.25rem 1.4rem;
  line-height: 1.65;
  color: var(--fg);
  min-height: 13rem;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  word-break: break-word;
  overflow-wrap: anywhere;
}

.line {
  white-space: pre-wrap;
  word-break: break-word;
  overflow-wrap: anywhere;
  animation: fadeIn 0.25s ease-out;
}

.line-segment {
  display: inline;
  white-space: pre-wrap;
  word-break: break-word;
  overflow-wrap: anywhere;
}

.line-pwd-row {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.35rem;
  white-space: pre-wrap;
  word-break: break-word;
  overflow-wrap: anywhere;
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
  font-family: inherit;
  font-size: 0.8rem;
  color: var(--muted);
  background: rgba(74, 222, 128, 0.05);
  border: 1px solid rgba(74, 222, 128, 0.25);
  padding: 0.4rem 0.75rem;
  cursor: pointer;
  animation: fadeIn 0.3s ease-out;
  transition: all 0.15s ease;
  text-align: left;
  border-radius: 2px;
}

.enter-prompt:hover,
.enter-prompt:focus-visible {
  background: rgba(74, 222, 128, 0.12);
  border-color: var(--accent);
  color: var(--fg);
  box-shadow: 0 0 10px rgba(74, 222, 128, 0.15);
}

.enter-text {
  color: var(--accent);
  letter-spacing: 0.05em;
}

.enter-icon {
  color: var(--accent);
  margin-left: 2px;
  flex-shrink: 0;
  opacity: 0.9;
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

@media (max-width: 540px) {
  .boot-overlay {
    padding: 0.75rem 0.5rem;
  }
  .terminal {
    font-size: 0.76rem;
  }
  .terminal-bar {
    padding: 6px 10px;
    min-height: 34px;
  }
  .terminal-body {
    padding: 0.75rem 0.85rem 1rem;
    min-height: 11rem;
    line-height: 1.55;
  }
  .enter-prompt {
    font-size: 0.72rem;
    padding: 0.4rem 0.6rem;
    width: 100%;
    justify-content: center;
  }
}
</style>