'use client';

/**
 * Theme switcher — intentionally renders nothing.
 *
 * SURGE now ships one mid-tone theme, so there is nothing to switch. The
 * component (and its props) is kept so every place that mounts <ThemeToggle />
 * keeps compiling; remove those usages whenever convenient.
 */
export function ThemeToggle(_props: { className?: string; showLabels?: boolean }) {
  return null;
}
