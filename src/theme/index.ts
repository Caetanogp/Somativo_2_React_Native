/**
 * Paleta escura "Digivice". Razões de contraste WCAG calculadas (texto precisa de >= 4.5:1):
 *   text/background 17.1 · text/surface 14.0 · textMuted/background 12.0 · textMuted/surface 9.9 ·
 *   onPrimary/primary 6.3 · primary/surface 5.2 · danger/surface 7.7 · success/surface 10.4.
 * Elementos gráficos (precisam de >= 3:1): border (campos) 3.7 sobre surface e 4.5 sobre background ·
 *   heart/surface 5.4 · starEmpty/surface 5.7. `divider` é só decorativo (separadores).
 */
export const colors = {
  background: '#0F172A',
  surface: '#1E293B',
  surfaceAlt: '#273449',
  border: '#708199',
  divider: '#334155',
  text: '#F8FAFC',
  textMuted: '#CBD5E1',
  primary: '#F97316',
  onPrimary: '#111827',
  danger: '#FCA5A5',
  success: '#86EFAC',
  star: '#FACC15',
  starEmpty: '#94A3B8',
  heart: '#FB7185',
  overlay: 'rgba(15, 23, 42, 0.78)',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
} as const;

/** Texto corrido (descrições, golpes). Sem altura fixa: cresce com a fonte do sistema. */
export const bodyText = { color: colors.textMuted, fontSize: 16, lineHeight: 24 } as const;

/** Tamanho mínimo de área de toque recomendado (iOS/Android): 44×44 pt. */
export const MIN_TOUCH = 44;

/** `hitSlop` que amplia ícones pequenos sem alterar o layout. */
export const hitSlop = { top: 8, bottom: 8, left: 8, right: 8 } as const;
