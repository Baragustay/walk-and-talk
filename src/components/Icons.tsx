// Simple, slightly rounded line icons. Decorative: the label next to them carries the meaning.
const base = {
  width: 26,
  height: 26,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
}

export const HomeIcon = () => (
  <svg {...base}><path d="M4 11.5 12 5l8 6.5" /><path d="M6.5 10v9h11v-9" /><path d="M10 19v-5h4v5" /></svg>
)
export const WordsIcon = () => (
  <svg {...base}><rect x="4" y="6" width="13" height="14" rx="2.5" /><path d="M8 3.5h9.5A2.5 2.5 0 0 1 20 6v11" /><path d="M7.5 11h6M7.5 15h4" /></svg>
)
export const MeIcon = () => (
  <svg {...base}><circle cx="12" cy="8.5" r="3.5" /><path d="M5 20c1-3.5 3.8-5.5 7-5.5s6 2 7 5.5" /></svg>
)
export const GearIcon = () => (
  <svg {...base}><circle cx="12" cy="12" r="3" /><path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M5.6 18.4l1.8-1.8M16.6 7.4l1.8-1.8" /></svg>
)
export const PhoneIcon = ({ size = 26 }: { size?: number }) => (
  <svg {...base} width={size} height={size}><path d="M6.5 4h3l1.5 4-2 1.5a10 10 0 0 0 5.5 5.5l1.5-2 4 1.5v3a2 2 0 0 1-2 2A15 15 0 0 1 4.5 6a2 2 0 0 1 2-2Z" /></svg>
)
export const CameraIcon = () => (
  <svg {...base}><path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2l1.5-2h6l1.5 2h2A1.5 1.5 0 0 1 20 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5Z" /><circle cx="12" cy="13" r="3.5" /></svg>
)
export const CloseIcon = () => (
  <svg {...base}><path d="M6 6l12 12M18 6 6 18" /></svg>
)
export const BackIcon = () => (
  <svg {...base}><path d="M15 5l-7 7 7 7" /></svg>
)
export const SpeakerIcon = () => (
  <svg {...base}><path d="M4 10v4h4l5 4V6L8 10Z" /><path d="M16.5 9a4 4 0 0 1 0 6M19 6.5a7.5 7.5 0 0 1 0 11" /></svg>
)
