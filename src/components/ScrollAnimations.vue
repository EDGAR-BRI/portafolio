<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';

let triggers: Array<{ kill: () => void }> = [];

onMounted(async () => {
  if (typeof window === 'undefined') return;

  const gsapModule = await import('gsap');
  const stModule = await import('gsap/ScrollTrigger');
  const gsap = gsapModule.gsap;
  const ScrollTrigger = stModule.ScrollTrigger ?? (stModule as any).default?.ScrollTrigger;

  gsap.registerPlugin(ScrollTrigger);

  const collected: Array<{ kill: () => void }> = [];

  // Section reveals
  const sections = document.querySelectorAll('main > section, main > div > section');
  sections.forEach((section) => {
    const tween = gsap.fromTo(
      section,
      { opacity: 0.85, y: 32 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      }
    );
    const st = tween.scrollTrigger;
    if (st) collected.push(st);
  });

  // Project cards stagger
  const projectCards = document.querySelectorAll('#projects .project-card');
  if (projectCards.length) {
    const tween = gsap.fromTo(
      projectCards,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.55,
        stagger: 0.1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '#projects',
          start: 'top 75%',
          toggleActions: 'play none none none',
        },
      }
    );
    const st = tween.scrollTrigger;
    if (st) collected.push(st);
  }

  // Skill items stagger
  const skillItems = document.querySelectorAll('#skills .skill-item');
  if (skillItems.length) {
    const tween = gsap.fromTo(
      skillItems,
      { opacity: 0, y: 24, scale: 0.96 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.45,
        stagger: 0.05,
        ease: 'back.out(1.4)',
        scrollTrigger: {
          trigger: '#skills',
          start: 'top 75%',
          toggleActions: 'play none none none',
        },
      }
    );
    const st = tween.scrollTrigger;
    if (st) collected.push(st);
  }

  // Subtle parallax on hero
  const hero = document.querySelector('.hero');
  if (hero) {
    const tween = gsap.to(hero, {
      yPercent: 8,
      ease: 'none',
      scrollTrigger: {
        trigger: hero,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    });
    const st = tween.scrollTrigger;
    if (st) collected.push(st);
  }

  // Subtle parallax on background grid
  const grid = document.querySelector('body');
  if (grid) {
    const tween = gsap.to(grid, {
      backgroundPositionY: '+=120px',
      ease: 'none',
      scrollTrigger: {
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1,
      },
    });
    const st = tween.scrollTrigger;
    if (st) collected.push(st);
  }

  triggers = collected;
});

onUnmounted(() => {
  triggers.forEach((st) => st.kill());
  triggers = [];
});
</script>

<template>
  <div aria-hidden="true"></div>
</template>