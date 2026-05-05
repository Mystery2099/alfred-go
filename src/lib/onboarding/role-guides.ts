import { ClipboardCheck, GraduationCap, ShieldCheck, UserRound } from 'lucide-svelte'
import type { LoginRoleExplainer } from './types'

export const loginRoleExplainers: Record<string, LoginRoleExplainer> = {
  applicant: { helper: 'Use this to learn admissions status, missing documents, FAFSA, TAP, and scholarships.', icon: ClipboardCheck },
  accepted_student: { helper: 'Use this to set up aid, billing, housing, email, Bannerweb, and class systems.', icon: GraduationCap },
  student: { helper: 'Use this for daily class, account, favorites, grades, dining, and campus resources.', icon: UserRound },
  staff: { helper: 'Use this to preview student resources and staff-facing tools.', icon: ShieldCheck },
  admin: { helper: 'Use this to manage prototype resources, categories, and visibility.', icon: ShieldCheck },
}
