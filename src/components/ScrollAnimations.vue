<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';

let mm: { revert: () => void } | null = null;
let removeBootListener: (() => void) | null = null;

onMounted(async () => {
  if (typeof window === 'undefined') return;

  const gsapModule = await import('gsap');
  const stModule = await import('gsap/ScrollTrigger');
  const gsap = gsapModule.gsap;
  const ScrollTrigger = stModule.ScrollTrigger ?? (stModule as any).default?.ScrollTrigger;

  gsap.registerPlugin(ScrollTrigger);

  const refreshAfterBoot = () => ScrollTrigger.refresh();
  window.addEventListener('portfolio:boot-done', refreshAfterBoot);
  removeBootListener = () => window.removeEventListener('portfolio:boot-done', refreshAfterBoot);

  mm = gsap.matchMedia();

  mm.add(
    {
      reduceMotion: '(prefers-reduced-motion: reduce)',
      noPreference: '(prefers-reduced-motion: no-preference)',
    },
    (context) => {
      const { reduceMotion } = context.conditions as { reduceMotion: boolean };
      if (reduceMotion) return;

      // Section reveals (hero excluded, it has its own entrance)
      const sections = document.querySelectorAll('main > section:not(.hero), main > div > section:not(.hero)');
      sections.forEach((section) => {
        gsap.fromTo(
          section,
          { autoAlpha: 0.85, y: 32 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.7,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 80%',
              once: true,
            },
          }
        );
      });

      // Project cards stagger
      const projectCards = document.querySelectorAll('#projects .project-card');
      if (projectCards.length) {
        gsap.fromTo(
          projectCards,
          { autoAlpha: 0, y: 40 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.55,
            stagger: { each: 0.1, from: 'center' },
            ease: 'power2.out',
            scrollTrigger: {
              trigger: '#projects',
              start: 'top 75%',
              once: true,
            },
          }
        );
      }

      // Skill items stagger
      const skillItems = document.querySelectorAll('#skills .skill-item');
      if (skillItems.length) {
        gsap.fromTo(
          skillItems,
          { autoAlpha: 0, y: 24, scale: 0.96 },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.45,
            stagger: 0.05,
            ease: 'back.out(1.4)',
            scrollTrigger: {
              trigger: '#skills',
              start: 'top 75%',
              once: true,
            },
          }
        );
      }

      // Subtle parallax on hero
      const hero = document.querySelector('.hero');
      if (hero) {
        gsap.to(hero, {
          yPercent: 8,
          ease: 'none',
          scrollTrigger: {
            trigger: hero,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        });
      }

      // Subtle parallax on background grid (transform-based, compositor-friendly)
      const grid = document.querySelector('.bg-grid');
      if (grid) {
        gsap.to(grid, {
          y: 120,
          ease: 'none',
          scrollTrigger: {
            trigger: document.body,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1,
          },
        });
      }
    }
  );
});

onUnmounted(() => {
  removeBootListener?.();
  removeBootListener = null;
  mm?.revert();
  mm = null;
});
</script>

<template>
  <div aria-hidden="true"></div>
</template>