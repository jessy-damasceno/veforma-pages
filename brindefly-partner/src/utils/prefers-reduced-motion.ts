// Leitura pontual (só no cliente) da preferência do sistema por menos movimento.
export const prefersReducedMotion = (): boolean => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
