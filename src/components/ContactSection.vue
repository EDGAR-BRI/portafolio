<script setup lang="ts">
import { ref, computed } from 'vue';
import { Icon } from '@iconify/vue';
import { useLang } from '../stores/lang';
import { translations, social } from '../data/site';
import CyberButton from './CyberButton.vue';
import SectionTitle from './SectionTitle.vue';

const lang = useLang();
const t = computed(() => translations[lang.value]);

const copied = ref(false);
let copyTimeout: ReturnType<typeof setTimeout> | null = null;

async function copyEmail() {
  try {
    await navigator.clipboard.writeText(social.email);
    copied.value = true;
    if (copyTimeout) clearTimeout(copyTimeout);
    copyTimeout = setTimeout(() => {
      copied.value = false;
    }, 2500);
  } catch {
    // Fallback for older browsers
    const input = document.createElement('input');
    input.value = social.email;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
    copied.value = true;
    if (copyTimeout) clearTimeout(copyTimeout);
    copyTimeout = setTimeout(() => {
      copied.value = false;
    }, 2500);
  }
}
</script>

<template>
  <section class="my-12 sm:my-20" id="contact">
    <!-- Top Header Outside Card -->
    <SectionTitle
      :title="t.sections.contact_title"
      id="contact-title"
      path="~/contact"
    />

    <div class="contact-card corner relative p-6 sm:p-8 md:p-10 bg-[color:var(--bg-soft)] border border-[color:var(--line)]">
      <!-- Subtitle inside card -->
      <p class="text-[clamp(0.92rem,1.8vw,1rem)] text-[color:var(--muted)] leading-relaxed mb-6 sm:mb-8 max-w-2xl m-0">
        {{ t.sections.contact_subtitle }}
      </p>

      <!-- 2-Column Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
        <!-- Left Column: Quick Info Cards -->
        <div class="lg:col-span-5 flex flex-col justify-between gap-3 font-mono text-[0.78rem]">
          <div class="info-item">
            <div class="flex items-center gap-2 text-[color:var(--accent)] font-semibold mb-1">
              <Icon icon="lucide:map-pin" width="14" height="14" />
              <span>{{ lang === 'es' ? 'Ubicación' : 'Location' }}</span>
            </div>
            <p class="info-text text-[color:var(--fg)]">
              {{ lang === 'es' ? 'Remoto (Cualquier zona horaria) / Presencial' : 'Remote (Any timezone) / On-site' }}
            </p>
          </div>

          <div class="info-item">
            <div class="flex items-center gap-2 text-[color:var(--accent)] font-semibold mb-1">
              <Icon icon="lucide:zap" width="14" height="14" />
              <span>{{ lang === 'es' ? 'Tiempo de respuesta' : 'Response time' }}</span>
            </div>
            <p class="info-text text-[color:var(--fg)]">
              {{ lang === 'es' ? '< 24 horas garantizado' : '< 24 hours guaranteed' }}
            </p>
          </div>

          <div class="info-item">
            <div class="flex items-center gap-2 text-[color:var(--accent)] font-semibold mb-1">
              <Icon icon="lucide:languages" width="14" height="14" />
              <span>{{ lang === 'es' ? 'Idiomas' : 'Languages' }}</span>
            </div>
            <p class="info-text text-[color:var(--fg)]">
              {{ lang === 'es' ? 'Español (Nativo) · Inglés (Técnico)' : 'Spanish (Native) · English (Technical)' }}
            </p>
          </div>
        </div>

        <!-- Right Column: Interactive Terminal Action Box -->
        <div class="lg:col-span-7 terminal-box p-4 sm:p-5 border border-[color:var(--line)] bg-[rgba(6,8,11,0.5)] flex flex-col justify-between">
          <div class="terminal-top flex items-center justify-between pb-3 border-b border-[color:var(--line)] mb-4 font-mono text-[0.72rem] text-[color:var(--muted)]">
            <div class="flex items-center gap-2">
              <Icon icon="lucide:terminal" width="13" height="13" class="text-[color:var(--accent)]" />
              <span>contact_channel.sh</span>
            </div>
            <span class="channel-status">[ 200 OK ]</span>
          </div>

          <div class="terminal-content font-mono text-[0.8rem] mb-5">
            <div class="text-[color:var(--muted)] mb-1">
              <span class="text-[color:var(--accent)]">$</span> cat &lt;&lt; 'EOF'
            </div>
            <div class="email-preview p-3 my-2 bg-[rgba(255,255,255,0.02)] border border-[color:var(--line)] rounded-[2px] flex items-center justify-between gap-3">
              <div class="flex items-center gap-2 truncate">
                <Icon icon="lucide:mail" width="16" height="16" class="text-[color:var(--accent)] shrink-0" />
                <span class="email-address text-[color:var(--fg)] font-semibold truncate">{{ social.email }}</span>
              </div>
              <button
                type="button"
                class="copy-btn"
                :class="{ copied }"
                @click="copyEmail"
                :title="lang === 'es' ? 'Copiar correo al portapapeles' : 'Copy email to clipboard'"
                :aria-label="lang === 'es' ? 'Copiar correo al portapapeles' : 'Copy email to clipboard'"
              >
                <Icon :icon="copied ? 'lucide:check' : 'lucide:copy'" width="13" height="13" />
                <span>{{ copied ? (lang === 'es' ? '¡Copiado!' : 'Copied!') : (lang === 'es' ? 'Copiar' : 'Copy') }}</span>
              </button>
            </div>
            <div class="text-[color:var(--muted)]">EOF</div>
          </div>

          <!-- Action Buttons using CyberButton -->
          <div class="action-row flex flex-col sm:flex-row gap-3">
            <CyberButton
              :href="`mailto:${social.email}`"
              variant="primary"
              size="md"
              icon="lucide:send"
              class="flex-1"
            >
              {{ t.sections.contact_btn }}
            </CyberButton>

            <CyberButton
              :href="social.github"
              variant="secondary"
              size="md"
              icon="lucide:github"
              target="_blank"
            >
              GitHub
            </CyberButton>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.section-title {
  justify-content: flex-start;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.3rem 0.65rem;
  background: rgba(74, 222, 128, 0.08);
  border: 1px solid rgba(74, 222, 128, 0.3);
  border-radius: 2px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.72rem;
  color: var(--accent);
}

.status-pulse {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 8px var(--accent);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(0.85); }
}

.info-item {
  padding: 0.65rem 0.85rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--line);
  border-radius: 2px;
}

.info-text {
  margin: 0;
  line-height: 1.4;
}

.terminal-box {
  border-radius: 2px;
}

.channel-status {
  color: var(--accent);
  font-weight: 600;
}

.copy-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.6rem;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.7rem;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--line);
  color: var(--fg);
  border-radius: 2px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease;
}

.copy-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
  background: rgba(74, 222, 128, 0.08);
}

.copy-btn.copied {
  background: var(--accent);
  border-color: var(--accent);
  color: #06080b;
}
</style>