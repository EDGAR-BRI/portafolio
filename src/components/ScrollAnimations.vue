<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';

let mm: { revert: () => void } | null = null;
let removeBootListener: (() => void) | null = null;

async function initAnimations() {
  if (typeof window === 'undefined') return;

  const gsapModule = await import('gsap');
  const stModule = await import('gsap/ScrollTrigger');
  const gsap = gsapModule.gsap;
  const ScrollTrigger = stModule.ScrollTrigger ?? (stModule as any).default?.ScrollTrigger;

  gsap.registerPlugin(ScrollTrigger);

  if (mm) {
    mm.revert();
  }

  mm = gsap.matchMedia();

  mm.add(
    {
      reduceMotion: '(prefers-reduced-motion: reduce)',
      noPreference: '(prefers-reduced-motion: no-preference)',
    },
    (context) => {
      const { reduceMotion } = context.conditions as { reduceMotion: boolean };
      if (reduceMotion) return;

      // 1. Projects Section & Cards Stagger Entrance
      const projectCards = document.querySelectorAll('#projects .project-card');
      const projectHeaderEls = document.querySelectorAll(
        '#projects .section-label, #projects .section-title, #projects .section-sub, #projects .filter-chip'
      );

      if (projectCards.length) {
        const projectsTl = gsap.timeline({
          scrollTrigger: {
            trigger: '#projects',
            start: 'top 82%',
            once: true,
          },
        });

        if (projectHeaderEls.length) {
          projectsTl.from(projectHeaderEls, {
            opacity: 0,
            y: 18,
            duration: 0.45,
            stagger: 0.05,
            ease: 'power2.out',
            clearProps: 'opacity,transform',
          });
        }

        projectsTl.from(
          projectCards,
          {
            opacity: 0,
            y: 30,
            duration: 0.55,
            stagger: 0.07,
            ease: 'power2.out',
            clearProps: 'opacity,transform',
          },
          projectHeaderEls.length ? '-=0.2' : 0
        );
      }

      // 2. Other sections reveal on scroll (Live, GitHub Stack, Skills, Contact)
      const otherSections = document.querySelectorAll(
        '#live, #github-stack, #skills, #contact'
      );
      otherSections.forEach((section) => {
        gsap.from(section, {
          opacity: 0,
          y: 28,
          duration: 0.6,
          ease: 'power2.out',
          clearProps: 'opacity,transform',
          scrollTrigger: {
            trigger: section,
            start: 'top 85%',
            once: true,
          },
        });
      });

      // 3. Subtle parallax on background grid
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

      ScrollTrigger.refresh();
    }
  );
}

onMounted(() => {
  if (typeof window === 'undefined') return;

  if (window.sessionStorage.getItem('portfolio.booted') === '1') {
    initAnimations();
    return;
  }

  const onBootDone = () => {
    setTimeout(() => {
      initAnimations();
    }, 60);
  };

  window.addEventListener('portfolio:boot-done', onBootDone, { once: true });
  removeBootListener = () => window.removeEventListener('portfolio:boot-done', onBootDone);
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