import {
  Bell,
  CalendarClock,
  Eye,
  Gauge,
  KeyRound,
  MonitorSmartphone,
  Shield,
  SlidersHorizontal,
  Star,
  Type,
} from 'lucide-svelte'

export const notificationOptions = [
  ['Academic deadlines', 'Withdrawal dates, final exam reminders, and registration windows.', CalendarClock],
  ['Campus service updates', 'Banner, DegreeWorks, printing, and network maintenance notices.', MonitorSmartphone],
  ['Financial aid tasks', 'Aid offers, billing reminders, scholarships, and required forms.', Bell],
  ['Favorite resource changes', 'Updates related to resources you have pinned.', Star],
] as const

export const securityItems = [
  ['Password protected login', 'Test accounts authenticate with PBKDF2 password hashes stored in SQLite.', KeyRound],
  ['HTTP-only session cookie', 'The browser session is owned by the server and is not stored in localStorage.', Shield],
  ['Role-limited admin tools', 'Tool and category management require an authenticated admin role on the server.', SlidersHorizontal],
] as const

export const helpItems = [
  ['IT Help Desk', 'Use the Help Desk resource for account, device, and campus technology support.', 'https://alfredstate.teamdynamix.com/TDClient/277/Portal/Home/?ToUrl=%2fTDClient%2f277%2fPortal%2fHome%2f'],
  ['Directory', 'Find faculty and staff contact information when you need a specific office.', 'https://my.alfredstate.edu'],
  ['University Police', 'Emergency and non-emergency contact for campus safety and security.', 'https://www.alfredstate.edu/university-police'],
  ['Title IX', 'Read about Title IX policies and reporting procedures.', 'https://www.alfredstate.edu/title-ix'],
  ['988 Hotline', 'Suicide and crisis lifeline available 24/7.', 'https://988lifeline.org'],
  ['Feedback for AlfredGO', 'For the prototype, collect comments about missing links, confusing categories, and role visibility.', null],
] as const

export const accessibilityItems = [
  ['Reduced motion', 'Disable animations and transitions across the interface.', Gauge, 'reducedMotion'],
  ['High contrast', 'Increase border and text contrast for better readability.', Eye, 'highContrast'],
  ['Compact density', 'Reduce padding and spacing to show more content at once.', Type, 'compactDensity'],
] as const
