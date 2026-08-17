<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

interface Props {
  words: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseTime?: number;
}

const props = withDefaults(defineProps<Props>(), {
  typingSpeed: 90,
  deletingSpeed: 45,
  pauseTime: 1600,
});

const display = ref('');
const wordIndex = ref(0);
const charIndex = ref(0);
const isDeleting = ref(false);
let timer: ReturnType<typeof setTimeout> | null = null;

function tick() {
  const current = props.words[wordIndex.value];

  if (!isDeleting.value) {
    charIndex.value++;
    display.value = current.slice(0, charIndex.value);

    if (charIndex.value === current.length) {
      isDeleting.value = true;
      timer = setTimeout(tick, props.pauseTime);
      return;
    }
    timer = setTimeout(tick, props.typingSpeed);
  } else {
    charIndex.value--;
    display.value = current.slice(0, charIndex.value);

    if (charIndex.value === 0) {
      isDeleting.value = false;
      wordIndex.value = (wordIndex.value + 1) % props.words.length;
      timer = setTimeout(tick, props.typingSpeed);
      return;
    }
    timer = setTimeout(tick, props.deletingSpeed);
  }
}

onMounted(() => {
  timer = setTimeout(tick, props.typingSpeed);
});

onUnmounted(() => {
  if (timer) clearTimeout(timer);
});
</script>

<template>
  <span class="typewriter" aria-live="polite">
    <span>{{ display }}</span>
    <span class="caret" aria-hidden="true">▋</span>
  </span>
</template>

<style scoped>
.typewriter {
  display: inline-flex;
  align-items: baseline;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  color: var(--accent);
  min-height: 1.2em;
}

.caret {
  margin-left: 2px;
  color: var(--accent);
  animation: blink 1s steps(1) infinite;
}

@keyframes blink {
  50% { opacity: 0; }
}
</style>