import type { ReactNode } from 'react';

/**
 * The Simulation Replay area was designed dark-only (hard-coded dark surfaces,
 * light text, no light variants). Rather than editing every simulation component,
 * this route opts into Tailwind's `dark:` variants and the "Dusk" neutral scale
 * (see `.sim-theme` in globals.css) — the mid-tone counterpart of the app-wide
 * "Mist" theme. Nothing outside /simulation is affected.
 */
export default function SimulationLayout({ children }: { children: ReactNode }) {
  return <div className="dark sim-theme">{children}</div>;
}
