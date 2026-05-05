import type { ToolOnboardingGuide } from './types'

export const toolOnboardingGuides: Record<string, ToolOnboardingGuide> = {
  'application-status': {
    label: 'Admissions tracker',
    what: 'This shows where your application or enrollment file stands, including missing documents and next steps.',
    useWhen: 'Use it first when you are unsure what Alfred State still needs from you.',
    firstStep: 'Check the status message, then look for missing or pending checklist items.',
  },
  fafsa: {
    label: 'Federal aid application',
    what: 'FAFSA is the main federal financial aid application for grants, loans, and work-study review.',
    useWhen: 'Use it when you are starting or updating financial aid for the year.',
    firstStep: 'Start the FAFSA, submit it, then return to AlfredGO to continue state aid and scholarship steps.',
  },
  'nys-tap': {
    label: 'New York State aid',
    what: 'TAP is a New York State tuition assistance application separate from FAFSA.',
    useWhen: 'Use it if you may qualify for New York State aid.',
    firstStep: 'Apply with the same identity details you used for FAFSA.',
  },
  scholarshipuniverse: {
    label: 'Scholarship search',
    what: 'ScholarshipUniverse helps match you with scholarship opportunities.',
    useWhen: 'Use it when you want to find additional aid that may not appear automatically.',
    firstStep: 'Complete your profile so the system can suggest better matches.',
  },
  'financial-aid-offer': {
    label: 'Aid decision area',
    what: 'This is where accepted students review aid offers and decide what to accept or decline.',
    useWhen: 'Use it before making billing or payment decisions.',
    firstStep: 'Review each award carefully and ask for help before declining aid you do not understand.',
  },
  'pay-bill': {
    label: 'Billing and payments',
    what: 'This helps you review balances, due dates, deposits, and payment options.',
    useWhen: 'Use it when you need to understand what is owed or whether a payment step is blocking you.',
    firstStep: 'Look for a current balance, due date, and any payment or deposit instructions.',
  },
  email: {
    label: 'Official college email',
    what: 'Your Alfred State email is where important college messages are sent.',
    useWhen: 'Use it any time you need to check official updates about classes, billing, aid, or campus services.',
    firstStep: 'Confirm you can sign in, then check unread setup messages.',
  },
  bannerweb: {
    label: 'Student records system',
    what: 'Bannerweb is the system behind your student account, schedule, billing, records, holds, and registration.',
    useWhen: 'Use it when you need official account or academic record information.',
    firstStep: 'Open it and locate your profile, holds, bill, and registration areas.',
  },
  'my-learning': {
    label: 'Course workspace',
    what: 'My Learning is where many courses post materials, assignments, announcements, and grades.',
    useWhen: 'Use it once classes or orientation materials are available.',
    firstStep: 'Check whether any courses are listed, then open the most recent announcement or assignment.',
  },
  degreeworks: {
    label: 'Degree progress map',
    what: 'DegreeWorks shows how your courses apply to degree requirements.',
    useWhen: 'Use it to understand what you have completed and what remains.',
    firstStep: 'Scan the requirement sections first; the details will make more sense over time.',
  },
  'erez-life': {
    label: 'Housing setup',
    what: 'eRez Life handles housing and room-related steps for residential students.',
    useWhen: 'Use it when you need to apply for housing or review room and meal plan information.',
    firstStep: 'Check whether an application or selection step is available.',
  },
}

export const categoryOnboardingGuides: Record<string, ToolOnboardingGuide> = {
  financial: {
    label: 'Money and aid resource',
    what: 'Financial resources help with aid, billing, scholarships, deposits, and payment decisions.',
    useWhen: 'Use this when a task affects what you owe or what aid you may receive.',
    firstStep: 'Read the description, then look for a balance, due date, offer, or required form.',
  },
  academics: {
    label: 'Academic resource',
    what: 'Academic resources help with classes, grades, schedules, registration, advising, and degree progress.',
    useWhen: 'Use this when you are trying to understand courses or academic requirements.',
    firstStep: 'Open the tool and look for your current term, course list, or next required action.',
  },
  'my-account': {
    label: 'Account resource',
    what: 'Account resources connect you to identity, records, email, and student profile systems.',
    useWhen: 'Use this when you need to sign in, verify personal details, or check account status.',
    firstStep: 'Confirm you can access the system and look for alerts, holds, or unread messages.',
  },
  'student-life': {
    label: 'Campus life resource',
    what: 'Campus life resources cover housing, dining, safety, wellness, events, transportation, and community needs.',
    useWhen: 'Use this when you are planning life outside the classroom.',
    firstStep: 'Check for deadlines, eligibility, hours, or location details before taking action.',
  },
}

export function getToolOnboardingGuide(id: string, categoryId: string) {
  return toolOnboardingGuides[id] ?? categoryOnboardingGuides[categoryId] ?? null
}
