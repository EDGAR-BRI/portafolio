<script setup lang="ts">
import { ref, computed } from 'vue';
import { Icon } from '@iconify/vue';
import { useLang } from '../stores/lang';
import { translations, social } from '../data/site';

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
    <div class="contact-card corner relative p-6 sm:p-8 md:p-10 bg-[color:var(--bg-soft)] border border-[color:var(--line)]">
      <div class="section-label">[ contact ]</div>

      <!-- Top Header & Live Status Badge -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 class="section-title">
            <span class="hash">#</span> {{ t.sections.contact_title }}
          </h2>
          <p class="section-sub mb-0">{{ t.sections.contact_subtitle }}</p>
        </div>
      </div>

      <!-- 2-Column Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch mt-6">
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

          <!-- Action Buttons -->
          <div class="action-row flex flex-col sm:flex-row gap-3">
            <a
              :href="`mailto:${social.email}`"
              class="contact-btn-primary flex-1"
            >
              <Icon
                icon="lucide:send"
                width="15"
                height="15"
                class="contact-btn-icon"
              />
              <span class="contact-btn-text">{{ t.sections.contact_btn }}</span>
            </a>

            <a
              :href="social.github"
              target="_blank"
              rel="noopener noreferrer"
              class="contact-btn-secondary"
            >
              <Icon icon="lucide:github" width="15" height="15" class="github-icon" />
              <span class="github-text">GitHub</span>
              <Icon icon="lucide:external-link" width="12" height="12" class="external-icon" />
            </a>
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

.contact-btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  padding: 0.65rem 1.25rem;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.88rem;
  font-weight: 600;
  letter-spacing: 0.03em;
  text-decoration: none;
  border: 1px solid var(--accent);
  background: rgba(74, 222, 128, 0.1);
  color: var(--fg);
  border-radius: 2px;
  transition: background 0.18s ease, color 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
  cursor: pointer;
}

.contact-btn-primary .contact-btn-icon {
  color: var(--accent);
  transition: color 0.18s ease, transform 0.18s ease;
  flex-shrink: 0;
}

.contact-btn-primary .contact-btn-text {
  color: var(--fg);
  transition: color 0.18s ease;
}

.contact-btn-primary:hover {
  background: var(--accent);
  border-color: var(--accent);
  box-shadow: 0 0 16px rgba(74, 222, 128, 0.35);
}

.contact-btn-primary:hover .contact-btn-icon,
.contact-btn-primary:hover .contact-btn-text {
  color: #06080b !important;
}

.contact-btn-primary:hover .contact-btn-icon {
  transform: translateX(2px);
}

.contact-btn-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
  padding: 0.65rem 1.15rem;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.88rem;
  font-weight: 600;
  letter-spacing: 0.03em;
  text-decoration: none;
  border: 1px solid var(--line);
  background: rgba(255, 255, 255, 0.02);
  color: var(--fg);
  border-radius: 2px;
  transition: all 0.18s ease;
  cursor: pointer;
}

.contact-btn-secondary .github-icon {
  color: var(--accent);
  flex-shrink: 0;
}

.contact-btn-secondary .github-text {
  color: var(--fg);
  transition: color 0.18s ease;
}

.contact-btn-secondary .external-icon {
  color: var(--muted);
  transition: color 0.18s ease;
  flex-shrink: 0;
}

.contact-btn-secondary:hover {
  border-color: var(--accent);
  background: rgba(74, 222, 128, 0.08);
}

.contact-btn-secondary:hover .github-text,
.contact-btn-secondary:hover .external-icon {
  color: var(--accent);
}
</style>