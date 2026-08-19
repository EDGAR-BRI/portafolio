<script setup lang="ts">
import { computed } from 'vue';
import { Icon } from '@iconify/vue';

interface Props {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  target?: string;
  rel?: string;
  icon?: string;
  iconRight?: string;
  external?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  block?: boolean;
  title?: string;
  ariaLabel?: string;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  type: 'button',
  block: false,
  disabled: false,
  external: false,
});

const isLink = computed(() => Boolean(props.href));

const computedRel = computed(() => {
  if (props.rel) return props.rel;
  if (props.target === '_blank') return 'noopener noreferrer';
  return undefined;
});

const computedIconRight = computed(() => {
  if (props.iconRight) return props.iconRight;
  if (props.external || props.target === '_blank') return 'lucide:external-link';
  return undefined;
});

const iconSize = computed(() => {
  switch (props.size) {
    case 'sm':
      return 13;
    case 'lg':
      return 17;
    default:
      return 15;
  }
});

const rightIconSize = computed(() => {
  switch (props.size) {
    case 'sm':
      return 11;
    case 'lg':
      return 14;
    default:
      return 12;
  }
});
</script>

<template>
  <component
    :is="isLink ? 'a' : 'button'"
    :href="href"
    :type="isLink ? undefined : type"
    :target="target"
    :rel="computedRel"
    :disabled="isLink ? undefined : disabled"
    :aria-disabled="isLink && disabled ? 'true' : undefined"
    :title="title"
    :aria-label="ariaLabel || title"
    class="cyber-btn"
    :class="[
      `variant-${variant}`,
      `size-${size}`,
      { 'is-block': block, 'is-disabled': disabled }
    ]"
  >
    <!-- Left Icon -->
    <slot name="icon">
      <Icon
        v-if="icon"
        :icon="icon"
        :width="iconSize"
        :height="iconSize"
        class="cyber-btn-icon left-icon shrink-0"
      />
    </slot>

    <!-- Main Content -->
    <span class="cyber-btn-label">
      <slot />
    </span>

    <!-- Right Icon -->
    <slot name="iconRight">
      <Icon
        v-if="computedIconRight"
        :icon="computedIconRight"
        :width="rightIconSize"
        :height="rightIconSize"
        class="cyber-btn-icon right-icon shrink-0"
      />
    </slot>
  </component>
</template>

<style scoped>
.cyber-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-weight: 600;
  letter-spacing: 0.03em;
  text-decoration: none;
  border-radius: 2px;
  cursor: pointer;
  white-space: nowrap;
  outline: none;
  box-sizing: border-box;
  transition: background 0.18s ease, color 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease;
}

.cyber-btn.is-block {
  display: flex;
  width: 100%;
}

.cyber-btn.is-disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

/* SIZES */
.size-sm {
  padding: 0.35rem 0.65rem;
  font-size: 0.74rem;
  gap: 0.4rem;
}

.size-md {
  padding: 0.55rem 1rem;
  font-size: 0.84rem;
  gap: 0.55rem;
}

.size-lg {
  padding: 0.7rem 1.35rem;
  font-size: 0.92rem;
  gap: 0.65rem;
}

/* PRIMARY VARIANT (Translucent green with neon glow & solid hover) */
.variant-primary {
  border: 1px solid var(--accent);
  background: rgba(74, 222, 128, 0.1);
  color: var(--fg);
}

.variant-primary .cyber-btn-icon {
  color: var(--accent);
  transition: color 0.18s ease, transform 0.18s ease;
}

.variant-primary .cyber-btn-label {
  color: var(--fg);
  transition: color 0.18s ease;
}

.variant-primary:hover:not(.is-disabled) {
  background: var(--accent);
  border-color: var(--accent);
  box-shadow: 0 0 16px rgba(74, 222, 128, 0.35);
}

.variant-primary:hover:not(.is-disabled) .cyber-btn-icon,
.variant-primary:hover:not(.is-disabled) .cyber-btn-label {
  color: #06080b !important;
}

.variant-primary:hover:not(.is-disabled) .left-icon {
  transform: translateX(2px);
}

/* SECONDARY VARIANT (Subtle cyber border with neon hover accent) */
.variant-secondary {
  border: 1px solid var(--line);
  background: rgba(255, 255, 255, 0.02);
  color: var(--fg);
}

.variant-secondary .left-icon {
  color: var(--accent);
  transition: color 0.18s ease;
}

.variant-secondary .right-icon {
  color: var(--muted);
  transition: color 0.18s ease;
}

.variant-secondary .cyber-btn-label {
  color: var(--fg);
  transition: color 0.18s ease;
}

.variant-secondary:hover:not(.is-disabled) {
  border-color: var(--accent);
  background: rgba(74, 222, 128, 0.08);
  box-shadow: 0 0 12px rgba(74, 222, 128, 0.15);
}

.variant-secondary:hover:not(.is-disabled) .cyber-btn-label,
.variant-secondary:hover:not(.is-disabled) .right-icon {
  color: var(--accent);
}
</style>
