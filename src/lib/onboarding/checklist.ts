import { BookOpen, ClipboardCheck, CreditCard, FileText, GraduationCap, Home, Landmark, Mail, ShieldCheck, Star } from 'lucide-svelte'
import type { Role } from '$lib/types'
import type { ChecklistItem, RoleOnboarding } from './types'

export const roleOnboarding: Partial<Record<Role, RoleOnboarding>> = {
  applicant: {
    title: 'Your Admissions Path',
    subtitle: 'Start with application status, then work through aid and scholarship steps.',
    focus: ['Check missing documents', 'Apply for financial aid', 'Learn the next admissions steps'],
  },
  accepted_student: {
    title: 'Your New Student Setup',
    subtitle: 'Move from accepted to ready for classes by setting up money, housing, email, and student systems.',
    focus: ['Confirm money and billing', 'Set up campus accounts', 'Learn where classes and records live'],
  },
}

export const roleChecklists: Partial<Record<Role, ChecklistItem[]>> = {
  applicant: [
    { id: 'app-status', label: 'Check My Application Status', category: 'Admissions', description: 'Track your application and missing documents', what: 'Application Status is the place to see where your admissions file stands.', why: 'If a transcript, score, form, or other document is missing, this is usually where you find out first.', next: 'Open it and look for any missing documents or next steps before moving on.', toolId: 'application-status', icon: ClipboardCheck, urgency: 'high' },
    { id: 'app-fafsa', label: 'Apply for FAFSA', category: 'Financial aid', description: 'Federal student aid application', what: 'FAFSA is the federal financial aid application used to review grants, loans, and work-study eligibility.', why: 'Many aid offers start with FAFSA, so completing it early can prevent delays.', next: 'Open FAFSA, start or continue your application, then come back here when it is submitted.', toolId: 'fafsa', icon: FileText },
    { id: 'app-tap', label: 'Apply for NYS TAP', category: 'Financial aid', description: 'New York State Tuition Assistance', what: 'TAP is New York State aid for eligible students attending college in New York.', why: 'It may reduce what you owe, but it is separate from FAFSA.', next: 'Open the TAP application and use the same name and details you used on FAFSA.', toolId: 'nys-tap', icon: Landmark },
    { id: 'app-scholarships', label: 'Search for Scholarships', category: 'Financial aid', description: 'ScholarshipUniverse and more', what: 'ScholarshipUniverse helps match you with scholarship opportunities.', why: 'Scholarships can lower costs and may have deadlines before classes begin.', next: 'Open it, complete your profile, and save scholarships you may qualify for.', toolId: 'scholarshipuniverse', icon: Star },
    { id: 'app-financial-aid', label: 'Learn How Financial Aid Works', category: 'Financial aid', description: 'FAFSA, TAP, Excelsior Scholarship', what: 'The financial aid page collects the major aid tasks and explanations in one place.', why: 'Applicants often see several aid names at once. This gives you the map before you start clicking around.', next: 'Use it to confirm which aid steps apply to you.', toolId: 'financial-aid', icon: CreditCard },
    { id: 'app-costs', label: 'Review Costs & Aid Requirements', category: 'Planning', description: 'Estimated costs and required forms', what: 'Cost and aid requirements help you understand the money side before enrollment.', why: 'Knowing estimated costs, deposits, and required forms makes later decisions easier.', next: 'Review the requirements and write down anything you need help understanding.', toolId: 'cost-aid-requirements', icon: BookOpen },
  ],
  accepted_student: [
    { id: 'acc-status', label: 'Check My Application Status', category: 'Enrollment', description: 'Track enrollment steps and missing documents', what: 'Application Status continues to matter after acceptance because it can show enrollment steps and missing items.', why: 'Small missing items can block later setup, housing, or registration tasks.', next: 'Open it first and clear any required items you see.', toolId: 'application-status', icon: ClipboardCheck, urgency: 'high' },
    { id: 'acc-aid', label: 'Review & Accept Financial Aid Offer', category: 'Money', description: 'Accept or decline your awards', what: 'Your financial aid offer shows the aid Alfred State can apply to your costs.', why: 'Some awards may need a decision before they can be applied.', next: 'Open your offer, review each award, and ask for help before declining anything you do not understand.', toolId: 'financial-aid-offer', icon: CreditCard, urgency: 'high' },
    { id: 'acc-bill', label: 'Pay Enrollment Deposit / Bill', category: 'Money', description: 'Check balance and payment options', what: 'Billing tools show balances, due dates, payment options, and deposit steps.', why: 'A balance or deposit can affect your ability to move forward.', next: 'Open billing and check whether there is an amount due or a required deposit.', toolId: 'pay-bill', icon: CreditCard, urgency: 'high' },
    { id: 'acc-housing', label: 'Apply for Housing', category: 'Campus life', description: 'Select room and meal plan', what: 'Housing selection is where residential students handle room and meal plan steps.', why: 'Housing and meal choices can have deadlines and may affect your first semester costs.', next: 'Open housing selection and check whether you need to complete an application.', toolId: 'erez-life', icon: Home, urgency: 'high' },
    { id: 'acc-email', label: 'Set Up My Alfred State Email', category: 'Accounts', description: 'Outlook email and Microsoft 365', what: 'Your Alfred State email is the main channel for official college messages.', why: 'Important notices about classes, billing, aid, and campus updates may go there.', next: 'Open email, confirm you can sign in, and check for unread setup messages.', toolId: 'email', icon: Mail },
    { id: 'acc-account', label: 'Learn Bannerweb / Student Account', category: 'Accounts', description: 'Records, billing, registration, and profile details', what: 'Bannerweb is the student records system behind your account, schedule, bill, and registration details.', why: 'You will return to it often, so learning the name now saves confusion later.', next: 'Open Bannerweb and look for your profile, holds, bill, and registration areas.', toolId: 'bannerweb', icon: ShieldCheck },
    { id: 'acc-learning', label: 'Learn My Learning', category: 'Classes', description: 'Online coursework and class materials', what: 'My Learning is where many courses post materials, assignments, announcements, and grades.', why: 'Once classes begin, this is one of the first places to check each day.', next: 'Open My Learning and confirm whether any courses or orientation materials are visible.', toolId: 'my-learning', icon: BookOpen },
    { id: 'acc-degreeworks', label: 'Learn DegreeWorks', category: 'Classes', description: 'Degree progress and requirements', what: 'DegreeWorks tracks how your courses apply to degree requirements.', why: 'It helps you understand what you have completed and what still remains.', next: 'Open DegreeWorks and scan the requirement sections without worrying about every detail yet.', toolId: 'degreeworks', icon: GraduationCap },
  ],
}
