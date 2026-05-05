import type { Announcement, AppData, Category, Role, Tool, User, UserPreference } from '../types'

const now = new Date().toISOString()

export const roles: Role[] = ['applicant', 'accepted_student', 'student', 'staff', 'admin']

export const roleLabels: Record<Role, string> = {
  applicant: 'Applicant',
  accepted_student: 'Accepted Student',
  student: 'Student',
  staff: 'Staff',
  admin: 'Admin'
}

export const users: User[] = roles.map((role) => ({
  id: `user-${role}`,
  name: roleLabels[role],
  email: `${role.replace('_', '.')}@alfredgo.local`,
  role,
  createdAt: now,
  updatedAt: now
}))

export const categories: Category[] = [
  { id: 'academics', name: 'Academics', description: 'Courses, grades, advising, and registration.', sortOrder: 10, createdAt: now, updatedAt: now },
  { id: 'community', name: 'Community', description: 'Campus announcements, events, directory, and public services.', sortOrder: 20, createdAt: now, updatedAt: now },
  { id: 'financial', name: 'Finances', description: 'Billing, aid, payments, scholarships, and student accounts.', sortOrder: 30, createdAt: now, updatedAt: now },
  { id: 'my-account', name: 'My Account', description: 'Personal links, tasks, mail, and account details.', sortOrder: 40, createdAt: now, updatedAt: now },
  { id: 'resources', name: 'Resources', description: 'Technology, printing, emergency alerts, and self-service tools.', sortOrder: 50, createdAt: now, updatedAt: now },
  { id: 'student-life', name: 'Student Life', description: 'Housing, dining, safety, wellness, travel, and campus involvement.', sortOrder: 60, createdAt: now, updatedAt: now },
  { id: 'staff', name: 'Staff Resources', description: 'Employee tools and administrative systems.', sortOrder: 70, createdAt: now, updatedAt: now }
]

export const announcements: Announcement[] = [
  {
    id: 'announcement-1',
    title: 'Finals Week Is Here — Good Luck!',
    body: 'Final exams run through Friday. Remember to check your exam schedule, get plenty of rest, and use the Success Center and library for last-minute study support.',
    tone: 'reminder',
    filter: 'reminders',
    actionLabel: 'Academic Calendar',
    toolId: 'academic-calendar',
    sortOrder: 10,
    isActive: true,
    createdAt: now,
    updatedAt: now
  },
  {
    id: 'announcement-2',
    title: 'Hinkle Library Extended Hours',
    body: 'The library is open until midnight this week with extra study rooms and quiet zones reserved for finals. Snacks and coffee provided after 8 PM.',
    tone: 'reminder',
    filter: 'updates',
    actionLabel: 'Visit Library',
    toolId: 'hinkle-library',
    sortOrder: 20,
    isActive: true,
    createdAt: now,
    updatedAt: now
  },
  {
    id: 'announcement-3',
    title: 'Banner and DegreeWorks Maintenance',
    body: 'Banner and DegreeWorks will be unavailable tonight from 2:00 AM to 6:00 AM for scheduled system maintenance. Plan your work accordingly.',
    tone: 'urgent',
    filter: 'updates',
    actionLabel: 'View DegreeWorks',
    toolId: 'degreeworks',
    sortOrder: 30,
    isActive: true,
    createdAt: now,
    updatedAt: now
  },
  {
    id: 'announcement-4',
    title: 'Grade Submission Deadline for Faculty',
    body: 'All final grades must be submitted in Banner by Tuesday at 5:00 PM. Contact the Registrar with questions or extensions.',
    tone: 'deadline',
    filter: 'deadlines',
    actionLabel: 'Bannerweb',
    url: 'https://banner.alfredstate.edu/StudentSelfService/ssb/studentProfile',
    sortOrder: 40,
    isActive: true,
    createdAt: now,
    updatedAt: now
  },
  {
    id: 'announcement-5',
    title: 'Summer & Fall Registration Opens Soon',
    body: 'Registration for summer and fall terms opens next Monday. Meet with your advisor and review your DegreeWorks audit before your time slot.',
    tone: 'deadline',
    filter: 'deadlines',
    actionLabel: 'Schedule Planner',
    toolId: 'schedule-planner',
    sortOrder: 50,
    isActive: true,
    createdAt: now,
    updatedAt: now
  },
  {
    id: 'announcement-6',
    title: 'Dining Hours Adjusted for Finals',
    body: 'Pioneer Café and other dining locations have extended hours this week. Check the Dining Services page for the full finals-week schedule.',
    tone: 'reminder',
    filter: 'updates',
    actionLabel: 'Dining Services',
    toolId: 'dining',
    sortOrder: 60,
    isActive: true,
    createdAt: now,
    updatedAt: now
  },
  {
    id: 'announcement-7',
    title: 'Check In With Yourself This Week',
    body: 'Finals can be stressful. The 988 Lifeline and Health Portal are available 24/7 if you need support. You have got this!',
    tone: 'reminder',
    filter: 'reminders',
    actionLabel: 'Health & Wellness',
    toolId: 'health-wellness',
    sortOrder: 70,
    isActive: true,
    createdAt: now,
    updatedAt: now
  },
  {
    id: 'announcement-8',
    title: 'Financial Aid Documents Due',
    body: 'Several outstanding financial aid documents are due by the end of the month. Log in to view your requirements and submit any missing paperwork.',
    tone: 'deadline',
    filter: 'deadlines',
    actionLabel: 'Financial Aid',
    toolId: 'financial-aid-offers',
    sortOrder: 80,
    isActive: true,
    createdAt: now,
    updatedAt: now
  }
]

export const tools: Tool[] = [
  tool('my-learning', 'My Learning', 'Online coursework, class materials, assignments, and grades.', 'https://my.alfredstate.edu', 'academics', ['learning', 'courses', 'assignments', 'grades'], ['student', 'staff'], true, 'BookOpen', {
    notes: 'Your central hub for all coursework. Grades are typically posted within 48 hours of submission.',
    helpUrl: 'https://alfredstate.teamdynamix.com/TDClient/277/Portal/KB/ArticleDet?ID=10521',
    contactInfo: 'Academic Success Center: success@alfredstate.edu',
    status: 'online',
    requirements: 'Alfred State Microsoft login',
    liveData: {
      currentTerm: 'Spring 2026',
      enrolledCourses: 5,
      upcomingAssignments: 3,
      currentGPA: '3.42',
      nextDeadline: 'May 8 — CISY 7203 Final Project',
      recentGrades: [
        { course: 'CISY 7203', assignment: 'Midterm Exam', grade: '88%' },
        { course: 'MATH 2043', assignment: 'Problem Set 7', grade: '92%' },
      ]
    }
  }),
  tool('degreeworks', 'DegreeWorks', 'Track degree progress, requirements, credits, and audits.', 'https://my.alfredstate.edu', 'academics', ['degreeworks', 'degree', 'audit', 'progress'], ['student', 'staff'], true, 'GraduationCap', {
    notes: 'DegreeWorks is refreshed nightly from Banner. If you see discrepancies, contact the Registrar.',
    helpUrl: 'https://www.alfredstate.edu/registrar/degreeworks',
    contactInfo: 'Registrar: registrar@alfredstate.edu | (607) 587-4020',
    status: 'online',
    requirements: 'Alfred State Microsoft login',
    liveData: {
      degreeProgress: 72,
      creditsEarned: 86,
      creditsRequired: 120,
      major: 'B.T. in Information Technology',
      concentration: 'Web Development',
      advisor: 'Dr. Sarah Mitchell',
      auditDate: 'May 5, 2026',
      flags: ['Missing 3 credits of upper-level electives']
    }
  }),
  tool('class-schedule', 'Class Schedule', 'View the current weekly class schedule and term calendar.', 'https://my.alfredstate.edu', 'academics', ['schedule', 'classes', 'calendar'], ['student', 'staff'], true, 'Clock3', {
    notes: 'Schedule updates in real-time. Last day of classes is May 9. Finals run May 12–16.',
    helpUrl: 'https://www.alfredstate.edu/registrar/academic-calendar',
    contactInfo: 'Registrar: registrar@alfredstate.edu',
    status: 'online',
    requirements: 'Alfred State Microsoft login',
    liveData: {
      currentTerm: 'Spring 2026',
      nextClass: {
        course: 'CISY 7203',
        time: '2:00 PM — 4:50 PM',
        location: 'Business Building 204',
        days: 'Tuesday, Thursday'
      },
      classesToday: 3,
      totalCredits: 15
    }
  }),
  tool('classes', 'Classes', 'Review enrolled courses, meeting times, locations, and instructors.', 'https://my.alfredstate.edu', 'academics', ['classes', 'courses', 'term'], ['student', 'staff'], true, 'ClipboardList', {
    notes: 'Instructor contact info and syllabi are available for each course.',
    status: 'online',
    requirements: 'Alfred State Microsoft login',
    liveData: {
      courses: [
        { code: 'CISY 7203', name: 'Web Development', instructor: 'Prof. James Chen', grade: 'A-' },
        { code: 'MATH 2043', name: 'Calculus II', instructor: 'Dr. Lisa Park', grade: 'B+' },
        { code: 'ENGL 2083', name: 'Technical Writing', instructor: 'Prof. Mark Torres', grade: 'A' },
        { code: 'PHYS 1023', name: 'Physics I', instructor: 'Dr. Anna Reed', grade: 'B' },
        { code: 'BUSN 3013', name: 'Project Management', instructor: 'Prof. David Kim', grade: 'A-' },
      ]
    }
  }),
  tool('register-for-classes', 'Register for Classes', 'DegreeWorks, schedule planning, advisor verification, and SSB registration.', 'https://my.alfredstate.edu', 'academics', ['registration', 'degreeworks', 'advisor'], ['student', 'staff'], true, 'FileCheck', {
    notes: 'Registration for Summer/Fall 2026 opens May 12. Meet with your advisor before your time slot.',
    helpUrl: 'https://www.alfredstate.edu/registrar/registration',
    contactInfo: 'Registrar: registrar@alfredstate.edu',
    status: 'online',
    requirements: 'Advisor hold clearance + Alfred State Microsoft login',
    liveData: {
      registrationWindow: 'May 12, 2026 at 8:00 AM',
      advisorHold: 'Cleared',
      balanceHold: 'None',
      plannedCourses: 6,
      creditsPlanned: 18
    }
  }),
  tool('academic-resources', 'Academic Resources', 'Catalog, Academic Advising Center, Student Success Center, and tutoring supports.', 'https://my.alfredstate.edu', 'academics', ['catalog', 'advising', 'tutoring', 'success'], ['student', 'staff'], false, 'BookOpen'),
  tool('academic-forms', 'Academic Forms', 'Add/drop, enrollment verification, transcript requests, and degree program changes.', 'https://my.alfredstate.edu', 'academics', ['forms', 'transcript', 'enrollment'], ['student', 'staff'], false, 'FileCheck'),
  tool('academic-calendar', 'Academic Calendar', 'Final exam matrix, withdrawal dates, and academic deadlines.', 'https://my.alfredstate.edu', 'academics', ['calendar', 'deadlines', 'exams'], ['student', 'staff'], false, 'Clock3'),
  tool('student-announcements', 'Student Announcements', 'Campus notices, dining-hour updates, and student event announcements.', 'https://my.alfredstate.edu', 'community', ['announcements', 'events', 'campus'], ['student', 'staff'], true, 'Bell'),
  tool('campus-events', 'Campus Events', 'Important dates, deadlines, and campus event listings.', 'https://my.alfredstate.edu', 'community', ['events', 'deadlines'], ['student', 'staff'], false, 'Clock3'),
  tool('directory', 'Directory', 'Find faculty and staff contact information.', 'https://my.alfredstate.edu', 'community', ['directory', 'contacts'], ['student', 'staff', 'admin'], false, 'User'),
  tool('facilities-services', 'Facilities Services', 'Facility work order requests, MSDS Online, and facilities reports.', 'https://my.alfredstate.edu', 'community', ['facilities', 'work order', 'services'], ['student', 'staff'], false, 'Home'),
  tool('financial-aid', 'Apply for Financial Aid', 'FAFSA, NYS TAP, Excelsior Scholarship, and aid requirements.', 'https://www.alfredstate.edu/financial-aid', 'financial', ['aid', 'fafsa', 'tap', 'scholarships'], ['applicant', 'accepted_student', 'student'], true, 'BadgeDollarSign', {
    notes: 'Priority deadline for FAFSA is March 1. NYS TAP requires a separate application.',
    helpUrl: 'https://www.alfredstate.edu/financial-aid',
    contactInfo: 'Financial Aid Office: finaid@alfredstate.edu | (607) 587-4022',
    status: 'online',
    requirements: 'Social Security Number + tax documents',
    liveData: {
      fafsaStatus: 'Submitted',
      tapStatus: 'Submitted',
      excelsiorStatus: 'Eligible — Pending Verification',
      documentsNeeded: 1,
      nextDeadline: 'June 30, 2026 — FAFSA final deadline'
    }
  }),
  tool('financial-aid-offer', 'View My Financial Aid Offer', 'Review, accept, or decline financial aid offers.', 'https://my.alfredstate.edu', 'financial', ['aid', 'offer', 'awards'], ['accepted_student', 'student'], true, 'BadgeDollarSign', {
    notes: 'Accept or decline each award individually. Loans require additional entrance counseling.',
    helpUrl: 'https://www.alfredstate.edu/financial-aid/accepting-aid',
    contactInfo: 'Financial Aid Office: finaid@alfredstate.edu',
    status: 'online',
    requirements: 'Alfred State Microsoft login',
    liveData: {
      totalOffered: '$18,450',
      totalAccepted: '$14,200',
      pendingAction: 2,
      breakdown: [
        { type: 'Federal Pell Grant', amount: '$4,200', status: 'Accepted' },
        { type: 'NYS TAP', amount: '$3,100', status: 'Accepted' },
        { type: 'Federal Direct Subsidized Loan', amount: '$3,500', status: 'Pending' },
        { type: 'Federal Direct Unsubsidized Loan', amount: '$2,000', status: 'Pending' },
        { type: 'Alfred State Merit Scholarship', amount: '$5,650', status: 'Accepted' },
      ]
    }
  }),
  tool('pay-bill', 'Pay Bill', 'Billing steps, housing and meal plan choices, options, and Nelnet payment access.', 'https://my.alfredstate.edu', 'financial', ['billing', 'payments', 'nelnet'], ['accepted_student', 'student'], true, 'CreditCard', {
    notes: 'Payment plans available through Nelnet. Late fees apply after the 15th of each month.',
    helpUrl: 'https://www.alfredstate.edu/student-accounts',
    contactInfo: 'Student Accounts: studentaccounts@alfredstate.edu | (607) 587-4021',
    status: 'online',
    requirements: 'Alfred State Microsoft login',
    liveData: {
      currentBalance: '$1,240.00',
      dueDate: 'May 15, 2026',
      lastPayment: '$3,500.00 on April 12, 2026',
      paymentPlan: 'Active — 4 installments remaining',
      nextInstallment: '$310.00 on May 15, 2026'
    }
  }),
  tool('scholarships', 'Scholarships', 'Alfred State scholarship opportunities, ScholarshipUniverse, and NYS scholarships.', 'https://my.alfredstate.edu', 'financial', ['scholarships', 'aid'], ['applicant', 'accepted_student', 'student'], false, 'BadgeDollarSign', {
    notes: 'Check ScholarshipUniverse regularly for new opportunities. External scholarships must be reported to Financial Aid.',
    helpUrl: 'https://www.alfredstate.edu/financial-aid/scholarships',
    contactInfo: 'Financial Aid Office: finaid@alfredstate.edu',
    status: 'online'
  }),
  tool('financial-forms', 'Financial Aid & Billing Forms', 'Bill extension, loan change request, BCC application, and additional forms.', 'https://my.alfredstate.edu', 'financial', ['forms', 'billing', 'loan'], ['accepted_student', 'student'], false, 'FileCheck', {
    status: 'online',
    requirements: 'Alfred State Microsoft login'
  }),
  tool('cost-aid-requirements', 'Cost & Aid Requirements', 'Estimated costs, college cost comparison, aid requirements, and student forms.', 'https://my.alfredstate.edu', 'financial', ['costs', 'requirements', 'forms'], ['applicant', 'accepted_student', 'student'], false, 'CreditCard', {
    status: 'online'
  }),
  tool('web-links', 'Web Links', 'Personal saved links and quick shortcuts.', 'https://my.alfredstate.edu', 'my-account', ['links', 'bookmarks'], ['student', 'staff', 'admin'], false, 'Star'),
  tool('todo-list', 'To-Do List', 'Create and manage personal tasks and reminders.', 'https://my.alfredstate.edu', 'my-account', ['tasks', 'to do', 'reminders'], ['student', 'staff', 'admin'], false, 'ClipboardList'),
  tool('mail-packages', 'Mail and Packages', 'Mailbox number and campus mailing address information.', 'https://my.alfredstate.edu', 'my-account', ['mail', 'packages', 'mailbox'], ['student'], false, 'Mail'),
  tool('email', 'Outlook Email', 'Check Alfred State email via Outlook.', 'https://outlook.office.com', 'resources', ['email', 'outlook', 'microsoft'], ['accepted_student', 'student', 'staff', 'admin'], true, 'Mail', {
    notes: 'All official college communications are sent to your Alfred State email. Check it daily.',
    helpUrl: 'https://alfredstate.teamdynamix.com/TDClient/277/Portal/KB/ArticleDet?ID=10482',
    contactInfo: 'IT Help Desk: helpdesk@alfredstate.edu | (607) 587-4357',
    status: 'online',
    requirements: 'Alfred State Microsoft login',
    liveData: {
      unreadCount: 12,
      lastSync: '2 minutes ago',
      storageUsed: '4.2 GB',
      storageTotal: '50 GB',
      quickLinks: ['Inbox', 'Calendar', 'Sent Items', 'Drafts']
    }
  }),
  tool('microsoft-products', 'Microsoft Products', 'Word, Excel, PowerPoint, OneNote, Outlook, Teams, SharePoint, OneDrive, and Microsoft 365.', 'https://www.microsoft365.com', 'resources', ['microsoft', 'office', 'onedrive', 'teams'], ['accepted_student', 'student', 'staff', 'admin'], true, 'Grid2X2', {
    notes: 'Download Office apps on up to 5 devices. OneDrive provides 1 TB of cloud storage.',
    helpUrl: 'https://alfredstate.teamdynamix.com/TDClient/277/Portal/KB/ArticleDet?ID=10491',
    contactInfo: 'IT Help Desk: helpdesk@alfredstate.edu',
    status: 'online',
    requirements: 'Alfred State Microsoft login',
    liveData: {
      installedApps: ['Word', 'Excel', 'PowerPoint', 'Teams', 'OneDrive'],
      oneDriveUsed: '12.4 GB',
      oneDriveTotal: '1 TB',
      devicesActive: 3
    }
  }),
  tool('helpdesk', 'IT Help Desk', 'Help Desk home, device registration overview, and technology support.', 'https://alfredstate.teamdynamix.com/TDClient/277/Portal/Home/?ToUrl=%2fTDClient%2f277%2fPortal%2fHome%2f', 'resources', ['support', 'password', 'devices', 'help desk'], ['applicant', 'accepted_student', 'student', 'staff', 'admin'], true, 'LifeBuoy', {
    notes: 'Submit tickets for tech issues, password resets, and device problems. Walk-in support available in Engineering Technology Building.',
    helpUrl: 'https://alfredstate.teamdynamix.com/TDClient/277/Portal/Home/',
    contactInfo: 'IT Help Desk: helpdesk@alfredstate.edu | (607) 587-4357 | ET Building Room 102',
    status: 'online',
    requirements: 'Alfred State login or guest ticket creation',
    liveData: {
      openTickets: 1,
      lastTicket: 'Wi-Fi connection issue in Library — In Progress',
      avgResponseTime: 'Under 2 hours',
      walkInHours: 'Mon–Fri 8:00 AM – 5:00 PM'
    }
  }),
  tool('pharos-printing', 'Pharos Printing', 'My Print Center, Pharos packages, and Pharos help.', 'https://my.alfredstate.edu', 'resources', ['printing', 'pharos'], ['student', 'staff'], false, 'FileCheck', {
    notes: 'Each student receives $25 in print credits per semester. Black & white: $0.05/page. Color: $0.25/page.',
    helpUrl: 'https://alfredstate.teamdynamix.com/TDClient/277/Portal/KB/ArticleDet?ID=10714',
    contactInfo: 'IT Help Desk: helpdesk@alfredstate.edu',
    status: 'online',
    liveData: {
      printBalance: '$18.45',
      pagesPrinted: 131,
      colorPages: 12,
      nearestPrinter: 'Library 1st Floor — Online'
    }
  }),
  tool('rave-alert', 'RAVE Alert', 'Emergency and closing text alerts for your phone.', 'https://my.alfredstate.edu', 'resources', ['alerts', 'emergency'], ['student', 'staff'], false, 'Bell', {
    notes: 'Keep your phone number updated to receive emergency alerts. Text STOP to 226787 to opt out.',
    contactInfo: 'University Police: (607) 587-3999',
    status: 'online',
    liveData: {
      registeredNumber: '(607) ***-4821',
      alertsThisMonth: 2,
      lastAlert: 'Test alert — April 15, 2026'
    }
  }),
  tool('student-self-service', 'Student Self-Service', 'Quick access to student information and student dashboard tools.', 'https://my.alfredstate.edu', 'resources', ['self service', 'student dashboard'], ['student', 'staff'], false, 'User', {
    status: 'online',
    requirements: 'Alfred State Microsoft login',
    liveData: {
      holds: 0,
      gpa: '3.42',
      academicStanding: 'Good Standing',
      lastLogin: 'Today at 9:15 AM'
    }
  }),
  tool('housing-dining', 'Housing & Dining Services', 'Housing and dining plan selections, meal plans, and account information.', 'https://my.alfredstate.edu', 'student-life', ['housing', 'dining', 'meal plans'], ['accepted_student', 'student'], true, 'Home', {
    notes: 'Housing selection for Fall 2026 opens March 15. Meal plan changes must be made within the first two weeks of term.',
    helpUrl: 'https://www.alfredstate.edu/student-life/housing-dining',
    contactInfo: 'Residential Life: reslife@alfredstate.edu | (607) 587-4214',
    status: 'online',
    requirements: 'Alfred State Microsoft login',
    liveData: {
      currentRoom: 'MacKenzie East 312',
      roomType: 'Double',
      mealPlan: 'Unlimited + $200 Dining Dollars',
      diningDollarsRemaining: '$87.30',
      housingContract: 'Active through Spring 2026'
    }
  }),
  tool('dining', 'Dining Services', 'Dining, eAccounts, meal balances, menus, and campus dining details.', 'https://www.alfredstate.edu/dining', 'student-life', ['dining', 'meals', 'menus', 'eaccounts'], ['accepted_student', 'student', 'staff'], true, 'Utensils', {
    notes: 'Pioneer Café is open 7 AM – 10 PM on weekdays. Check the website for finals week extended hours.',
    helpUrl: 'https://www.alfredstate.edu/dining',
    contactInfo: 'Dining Services: dining@alfredstate.edu | (607) 587-4215',
    status: 'online',
    liveData: {
      currentMealPeriod: 'Dinner',
      pioneerCafeStatus: 'Open until 10:00 PM',
      todaysSpecial: 'Grilled Chicken Alfredo',
      mealSwipesUsedToday: 2,
      diningDollarsBalance: '$87.30'
    }
  }),
  tool('health-wellness', 'Health & Wellness', '988 Crisis, Health Portal, and health and wellness resources.', 'https://my.alfredstate.edu', 'student-life', ['health', 'wellness', '988'], ['student'], false, 'LifeBuoy', {
    notes: 'The Health Portal is for non-emergency appointments. For emergencies, call 911 or University Police.',
    helpUrl: 'https://www.alfredstate.edu/student-life/health-wellness',
    contactInfo: 'Health Center: (607) 587-4200 | Counseling: (607) 587-4218',
    status: 'online',
    requirements: 'Alfred State login for Health Portal',
    liveData: {
      healthCenterHours: 'Mon–Fri 8:00 AM – 4:30 PM',
      upcomingAppointment: 'Physical — May 10 at 10:00 AM',
      immunizationsComplete: true,
      insuranceOnFile: true
    }
  }),
  tool('safety-security', 'Safety and Security', 'On-call support, University Police, and Title IX resources.', 'https://my.alfredstate.edu', 'student-life', ['safety', 'security', 'police', 'title ix'], ['student', 'staff'], false, 'Shield', {
    notes: 'Blue light emergency phones are located across campus. University Police is available 24/7.',
    helpUrl: 'https://www.alfredstate.edu/university-police',
    contactInfo: 'Emergency: 911 | University Police: (607) 587-3999 | Title IX: titleix@alfredstate.edu',
    status: 'online',
    liveData: {
      campusAlertLevel: 'Normal',
      universityPoliceStatus: '24/7 Active',
      escortService: 'Available — Call (607) 587-3999',
      blueLightPhones: 18
    }
  }),
  tool('career-development', 'Career Development', 'Joblink, Skills First, and career development resources.', 'https://my.alfredstate.edu', 'student-life', ['career', 'jobs', 'skills'], ['student'], false, 'Briefcase'),
  tool('travel', 'Travel', 'Transportation, rental cars, escort, and parking on campus.', 'https://my.alfredstate.edu', 'student-life', ['travel', 'transportation', 'parking'], ['student', 'staff'], false, 'Map'),
  tool('student-clubs-orgs', 'Student Clubs & Orgs', 'CORQ event registration, Pioneer Link, and campus organization discovery.', 'https://my.alfredstate.edu', 'student-life', ['clubs', 'organizations', 'events'], ['student'], false, 'Map'),
  tool('employee-portal', 'Employee Portal', 'Staff services, time, benefits, and internal resources.', 'https://my.alfredstate.edu', 'staff', ['employee', 'hr', 'time'], ['staff', 'admin'], true, 'Briefcase'),
  tool('admin-tools', 'AlfredGO Admin', 'Manage tools, categories, dashboard defaults, and role visibility.', '/admin', 'staff', ['admin', 'tools', 'categories'], ['admin'], true, 'Settings'),
  // Real portal links from links.csv
  tool('erez-life', 'eRez Life', 'Select your housing and meal plan.', 'https://alfredstate.erezlife.com/', 'student-life', ['housing', 'meal plan', 'residential'], ['student'], false, 'Home'),
  tool('starfish', 'Starfish', 'Schedule meetings with faculty and academic advisors.', 'https://alfredstate.starfishsolutions.com/starfish-ops', 'academics', ['advising', 'faculty', 'meetings', 'success'], ['student', 'staff'], false, 'Star'),
  tool('tutor-request', 'Tutor Request', 'Schedule a tutoring appointment through the Success Center.', 'https://alfredstate.mywconline.com/', 'academics', ['tutoring', 'academic support', 'success'], ['student'], false, 'BookOpen'),
  tool('clockwork', 'Clockwork', 'Schedule a proctored test or exam accommodation.', 'https://clockwork.alfredstate.edu/ClockWork/custom/misc/home.aspx', 'academics', ['testing', 'proctor', 'accommodation'], ['student', 'staff'], false, 'Clock3'),
  tool('alfred-catalogue', 'Alfred Catalogue', 'List of courses and programs offered by Alfred State.', 'https://catalog2.alfredstate.edu/', 'academics', ['catalog', 'courses', 'programs', 'catalogue'], ['student', 'staff'], false, 'BookOpen'),
  tool('fitness-center', 'Fitness Center Membership', 'Sign up for fitness center access and memberships.', 'https://federation.ngwebsolutions.com/sp/startSSO.ping?PartnerIdpId=https://sts.windows.net/9847450c-4365-4e32-b26e-b73baa0ea04b/&SpSessionAuthnAdapterId=alfredstateDF&TargetResource=https%3a%2f%2fdynamicforms.ngwebsolutions.com%2fSubmit%2fStart%2f6dcc23ee-5211-4d13-9c2c-d3df93c8ff9c', 'student-life', ['gym', 'workout', 'fitness', 'membership'], ['student'], false, 'Home'),
  tool('intramurals', 'Intramurals', 'View athletic and socially engaging activities offered by Alfred State.', 'https://pioneerlink.alfredstate.edu/organization/intramurals', 'student-life', ['sports', 'activities', 'athletics'], ['student'], false, 'Home'),
  tool('order-books', 'Order Books', 'View and purchase textbooks for your classes.', 'https://banner.alfredstate.edu/BannerExtensibility/customPage/page/alf_bookstore_auth', 'resources', ['textbooks', 'bookstore', 'supplies'], ['student'], false, 'BookOpen'),
  tool('pharos-packages', 'Pharos Packages', 'Download software and drivers to use campus printers.', 'https://alfredstateedu14176.sharepoint.com/sites/PharosPackages', 'resources', ['printing', 'printers', 'drivers', 'software'], ['student', 'staff'], false, 'Grid2X2'),
  tool('pharos-help', 'Pharos Help', 'Guide to using campus printers and troubleshooting printing issues.', 'https://alfredstate.teamdynamix.com/TDClient/277/Portal/KB/ArticleDet?ID=10714', 'resources', ['printing', 'printers', 'help', 'support'], ['student', 'staff'], false, 'LifeBuoy'),
  tool('university-police', 'University Police', 'View information about university police and campus safety.', 'https://www.alfredstate.edu/university-police', 'student-life', ['safety', 'security', 'police'], ['student', 'staff'], false, 'Shield'),
  tool('title-ix', 'Title IX', 'Read about Title IX policies and reporting procedures.', 'https://www.alfredstate.edu/title-ix', 'student-life', ['title ix', 'discrimination', 'reporting'], ['student', 'staff'], false, 'Shield'),
  tool('988-hotline', '988 Hotline', 'Suicide and crisis lifeline available 24/7.', 'https://988lifeline.org', 'student-life', ['crisis', 'mental health', 'suicide', 'hotline', 'support'], ['student', 'staff'], false, 'LifeBuoy'),
  tool('scholarshipuniverse', 'ScholarshipUniverse', 'Apply for scholarships and view offers through Alfred State.', 'https://alfredstate.scholarshipuniverse.com/', 'financial', ['scholarships', 'aid', 'universe'], ['applicant', 'accepted_student', 'student'], false, 'BadgeDollarSign'),
  tool('formal-academic-complaint', 'Formal Academic Complaint', 'PDF form for filing academic complaints.', 'https://www.alfredstate.edu/sites/default/files/2025-12/academic-complaint-form.pdf', 'academics', ['complaint', 'form', 'academic'], ['student', 'staff'], false, 'FileCheck'),
  tool('rental-cars', 'Rental Cars', 'Rent vehicles on campus with low rates that include fuel.', 'https://www.enterprisecarshare.com/us/en/programs/university/alfred-state.html', 'student-life', ['transportation', 'cars', 'rental', 'enterprise'], ['student', 'staff'], false, 'Map'),
  tool('campus-parking', 'Campus Parking Information', 'Parking permits, rules, and campus parking details.', 'https://www.alfredstate.edu/university-police/parking-campus', 'student-life', ['parking', 'transportation', 'permits'], ['student', 'staff'], false, 'Map'),
  tool('financial-aid-offers', 'Financial Aid Offers', 'Accept and decline Federal Direct Loans offered to you.', 'https://banner.alfredstate.edu/StudentSelfService/ssb/financialAid#!/dashboard/home/2627', 'financial', ['financial aid', 'loans', 'offers', 'awards'], ['accepted_student', 'student'], false, 'BadgeDollarSign'),
  tool('bannerweb', 'Bannerweb', 'Dashboard for student information, registration, and records.', 'https://banner.alfredstate.edu/StudentSelfService/ssb/studentProfile', 'my-account', ['student', 'dashboard', 'ssb', 'banner'], ['student', 'staff', 'admin'], false, 'User'),
  tool('health-portal', 'Health Portal', 'Portal for Alfred State health and wellness services.', 'https://alfredst.studenthealthportal.com/', 'student-life', ['health', 'wellness', 'portal', 'medical'], ['student'], false, 'LifeBuoy'),
  tool('excelsior-scholarship', 'Excelsior Scholarship Application', 'Apply for the New York State Excelsior Scholarship.', 'https://hesc.ny.gov/find-aid/nys-grants-scholarships/excelsior-scholarship-program', 'financial', ['scholarships', 'aid', 'excelsior', 'state'], ['applicant', 'accepted_student', 'student'], false, 'BadgeDollarSign'),
  tool('fafsa', 'FAFSA Application', 'Apply for federal student aid through the Free Application for Federal Student Aid.', 'https://studentaid.gov/h/apply-for-aid/fafsa', 'financial', ['fafsa', 'federal aid', 'student aid'], ['applicant', 'accepted_student', 'student'], false, 'BadgeDollarSign'),
  tool('nys-tap', 'NYS TAP Application', 'Apply for New York State Tuition Assistance Program.', 'https://www.tap.hesc.ny.gov/totw/', 'financial', ['tap', 'state aid', 'tuition'], ['applicant', 'accepted_student', 'student'], false, 'BadgeDollarSign'),
  tool('joblink', 'JobLink', 'View employment and internship opportunities.', 'https://alfredstate-csm.symplicity.com/students/?signin_tab=0', 'student-life', ['jobs', 'employment', 'career', 'internships'], ['student'], false, 'Briefcase'),
  tool('skills-first', 'Skills First', 'AI powered resume builder and career preparation tool.', 'https://skillsfirst.com/organizations/alfredstate', 'student-life', ['resume', 'career', 'ai', 'skills'], ['student'], false, 'Briefcase'),
  tool('campus-store', 'Campus Store', 'Shop textbooks and supplies from the campus bookstore.', 'https://www.alfredstatebookstore.com/home', 'student-life', ['textbooks', 'supplies', 'bookstore', 'merchandise'], ['student', 'staff'], false, 'BookOpen'),
  tool('financial-aid-guides', 'Financial Aid Guides', 'Financial aid guides, resources, and reference documents.', 'https://alfredstateedu14176.sharepoint.com/sites/Finances', 'financial', ['financial aid', 'guides', 'resources'], ['student', 'staff'], false, 'BadgeDollarSign'),
  tool('schedule-planner', 'Schedule Planner', 'Register for classes and plan your schedule for upcoming semesters.', 'https://alfredstate.collegescheduler.com/', 'academics', ['registration', 'classes', 'planner', 'schedule'], ['student', 'staff'], false, 'Clock3'),
  tool('veteran-certification', 'Veteran Certification Form', 'Get benefits for military service and veteran status.', 'https://federation.ngwebsolutions.com/sp/ACS.saml2', 'staff', ['veterans', 'military', 'benefits', 'certification'], ['staff', 'admin'], false, 'FileCheck'),
  tool('veteran-services', 'Veteran Services and Benefits', 'View veteran benefits and services offered by Alfred State.', 'https://www.alfredstate.edu/admissions/applying-alfred/veterans-military', 'student-life', ['veterans', 'military', 'benefits', 'services'], ['student', 'staff'], false, 'Shield'),
  tool('pioneer-link', 'Pioneer Link', 'Find events, organizations, and news happening at Alfred State.', 'https://pioneerlink.alfredstate.edu/', 'student-life', ['events', 'organizations', 'news', 'campus life'], ['student'], false, 'Map'),
  tool('microsoft-teams', 'Microsoft Teams', 'Chat and collaborate with Alfred State faculty and students.', 'https://teams.microsoft.com/v2/', 'my-account', ['microsoft', 'chat', 'communication', 'collaboration'], ['accepted_student', 'student', 'staff', 'admin'], false, 'Grid2X2'),
  tool('formal-administrative-complaint', 'Formal Administrative Complaint', 'PDF form for filing administrative complaints.', 'https://www.alfredstate.edu/sites/default/files/2025-12/administrative-complaint-form.pdf', 'staff', ['complaint', 'form', 'administrative'], ['staff', 'admin'], false, 'FileCheck'),
  tool('commencement-info', 'Commencement Information', 'Information about commencement ceremonies and graduation.', 'https://www.alfredstate.edu/commencement', 'academics', ['graduation', 'ceremony', 'commencement'], ['student', 'staff'], false, 'GraduationCap'),
  tool('pay-commencement-fee', 'Pay Commencement Fee', 'Pay your commencement ceremony fee online.', 'https://federation.ngwebsolutions.com/sp/startSSO.ping?PartnerIdpId=https://sts.windows.net/9847450c-4365-4e32-b26e-b73baa0ea04b/&SpSessionAuthnAdapterId=alfredstateDF&TargetResource=https%3a%2f%2fdynamicforms.ngwebsolutions.com%2fSubmit%2fStart%2fd52b16b1-4cf0-4e7c-9846-41289bcfb807', 'academics', ['graduation', 'ceremony', 'payment', 'fee'], ['student'], false, 'CreditCard'),
  tool('hinkle-library', 'Hinkle Library', 'Search and request books from the Hinkle Memorial Library.', 'https://library.alfredstate.edu/c.php?g=372677', 'academics', ['books', 'research', 'library', 'hinkle'], ['student', 'staff'], false, 'BookOpen')
]

export const preferences: UserPreference[] = users.map((user) => ({
  id: `pref-${user.id}`,
  userId: user.id,
  dashboardLayout: 'standard',
  theme: 'system',
  preferredRoleView: user.role,
  notificationSettings: {
    'Academic deadlines': true,
    'Campus service updates': true,
    'Financial aid tasks': true,
    'Favorite resource changes': true,
  },
  accessibilitySettings: {
    reducedMotion: false,
    highContrast: false,
    compactDensity: false,
  },
  createdAt: now,
  updatedAt: now
}))

export const seedData: AppData = {
  users,
  categories,
  tools,
  favorites: [
    { id: 'fav-student-my-learning', userId: 'user-student', toolId: 'my-learning', createdAt: now },
    { id: 'fav-student-email', userId: 'user-student', toolId: 'email', createdAt: now },
    { id: 'fav-accepted-financial-aid', userId: 'user-accepted_student', toolId: 'financial-aid', createdAt: now }
  ],
  preferences,
  announcements,
  activities: []
}

function tool(
  id: string,
  name: string,
  description: string,
  url: string,
  categoryId: string,
  tags: string[],
  audienceRoles: Role[],
  isFeatured: boolean,
  icon: string,
  extras?: Partial<Omit<Tool, 'id' | 'name' | 'description' | 'url' | 'categoryId' | 'tags' | 'audienceRoles' | 'isFeatured' | 'icon' | 'createdAt' | 'updatedAt'>>
): Tool {
  return { id, name, description, url, categoryId, icon, tags, audienceRoles, isFeatured, isActive: true, createdAt: now, updatedAt: now, ...extras }
}
