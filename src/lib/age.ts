// Age ranges asked in onboarding. The MVP is for adults; 'under18' stops onboarding.
export const AGE_RANGES = [
  { id: '18-24', label: '18–24' },
  { id: '25-34', label: '25–34' },
  { id: '35-44', label: '35–44' },
  { id: '45-54', label: '45–54' },
  { id: '55-64', label: '55–64' },
  { id: '65+', label: '65 or older' },
] as const

export type AgeRange = (typeof AGE_RANGES)[number]['id']

export function ageLabel(range: AgeRange | null): string {
  return AGE_RANGES.find((r) => r.id === range)?.label ?? 'Not set'
}
