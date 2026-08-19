<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

interface Props {
  words: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseTime?: number;
}

const props = withDefaults(defineProps<Props>(), {
  typingSpeed: 80,
  deletingSpeed: 40,
  pauseTime: 2500,
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
    <span class="text">{{ display }}</span>
    <span class="cursor-block" aria-hidden="true"></span>
  </span>
</template>

<style scoped>
.typewriter {
  display: inline-flex;
  align-items: center;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  color: var(--accent);
  min-height: 1.2em;
}

.cursor-block {
  display: inline-block;
  width: 0.52em;
  height: 1.1em;
  background-color: var(--accent);
  margin-left: 4px;
  vertical-align: -0.12em;
  animation: blink 1s steps(2, start) infinite;
  box-shadow: 0 0 6px var(--accent);
  border-radius: 1px;
}

@keyframes blink {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}
</style>