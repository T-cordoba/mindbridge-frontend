'use client';

import { ReactNode, useEffect, useRef, useState } from 'react';

interface FadeInSectionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  yOffset?: number;
  threshold?: number;
  once?: boolean;
}

export default function FadeInSection({
  children,
  className = '',
  delay = 0,
  duration = 380,
  yOffset = 10,
  threshold = 0.14,
  once = true,
}: FadeInSectionProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');

    const syncPreference = () => {
      setReducedMotion(media.matches);
    };

    syncPreference();

    if (media.addEventListener) {
      media.addEventListener('change', syncPreference);
    } else {
      media.addListener(syncPreference);
    }

    return () => {
      if (media.addEventListener) {
        media.removeEventListener('change', syncPreference);
      } else {
        media.removeListener(syncPreference);
      }
    };
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      setIsVisible(true);
      return;
    }

    const node = elementRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            if (once) observer.unobserve(entry.target);
          } else if (!once) {
            setIsVisible(false);
          }
        });
      },
      {
        threshold,
        rootMargin: '0px 0px -8% 0px',
      }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [once, threshold, reducedMotion]);

  const animatedStyle = reducedMotion
    ? undefined
    : {
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translateY(0)' : `translateY(${yOffset}px)`,
      transitionProperty: 'opacity, transform',
      transitionDuration: `${duration}ms`,
      transitionTimingFunction: 'ease-out',
      transitionDelay: `${delay}ms`,
      willChange: 'opacity, transform',
    };

  return (
    <div ref={elementRef} className={className} style={animatedStyle}>
      {children}
    </div>
  );
}