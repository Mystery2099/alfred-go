<script lang="ts">
  import { AlertTriangle, CheckCircle2, Clock, Mail, MapPin, XCircle } from 'lucide-svelte'

  interface Props {
    liveData?: Record<string, any> | null
  }

  let { liveData }: Props = $props()

  const genericExcludedKeys = [
    'currentBalance', 'dueDate', 'unreadCount', 'degreeProgress', 'creditsEarned', 'creditsRequired',
    'storageUsed', 'storageTotal', 'courses', 'upcomingAssignments', 'recentGrades', 'recentEmails',
    'breakdown', 'paymentHistory', 'tickets', 'locations', 'nextClass', 'openTickets', 'lastTicket',
    'diningDollarsRemaining', 'diningDollarsSpentThisMonth', 'currentRoom', 'roomType', 'mealPlan',
    'roommates', 'printBalance', 'pagesPrinted', 'campusAlertLevel', 'registrationWindow',
    'advisorHold', 'balanceHold', 'holds', 'flags', 'quickLinks', 'currentGPA', 'gpa', 'semesterGPA',
    'enrolledCourses', 'creditsEnrolled', 'plannedCourses', 'classesToday', 'applicationStatus',
    'submittedDate', 'lastUpdated', 'checklistItems', 'nextSteps', 'documentsNeeded',
  ]

  function genericEntries(ld: Record<string, any>) {
    return Object.entries(ld).filter(([key, value]) =>
      !genericExcludedKeys.includes(key) &&
      (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean')
    )
  }

  function labelForKey(key: string) {
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())
  }
</script>

{#if liveData && Object.keys(liveData).length > 0}
  {@const ld = liveData}
  <div>
    <p class="mb-3 text-xs font-extrabold uppercase tracking-[0.18em] text-text-muted">At a Glance</p>
    <div class="overflow-hidden rounded-2xl bg-surface shadow-sm ring-1 ring-border">
      <div class="px-6 py-5 sm:px-8">
        {#if ld.currentGPA || ld.gpa || ld.semesterGPA || ld.enrolledCourses !== undefined || ld.creditsEnrolled !== undefined || ld.plannedCourses !== undefined || ld.classesToday !== undefined}
          <div class="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {#if ld.currentGPA || ld.gpa}
              <div class="rounded-xl bg-muted px-4 py-3 text-center">
                <span class="block text-2xl font-extrabold text-text">{ld.currentGPA || ld.gpa}</span>
                <span class="block text-[10px] font-extrabold uppercase tracking-wider text-text-soft">GPA</span>
              </div>
            {/if}
            {#if ld.semesterGPA}
              <div class="rounded-xl bg-muted px-4 py-3 text-center">
                <span class="block text-2xl font-extrabold text-text">{ld.semesterGPA}</span>
                <span class="block text-[10px] font-extrabold uppercase tracking-wider text-text-soft">This Term</span>
              </div>
            {/if}
            {#if ld.enrolledCourses !== undefined}
              <div class="rounded-xl bg-muted px-4 py-3 text-center">
                <span class="block text-2xl font-extrabold text-text">{ld.enrolledCourses}</span>
                <span class="block text-[10px] font-extrabold uppercase tracking-wider text-text-soft">Courses</span>
              </div>
            {/if}
            {#if ld.creditsEnrolled !== undefined}
              <div class="rounded-xl bg-muted px-4 py-3 text-center">
                <span class="block text-2xl font-extrabold text-text">{ld.creditsEnrolled}</span>
                <span class="block text-[10px] font-extrabold uppercase tracking-wider text-text-soft">Credits</span>
              </div>
            {/if}
            {#if ld.plannedCourses !== undefined}
              <div class="rounded-xl bg-muted px-4 py-3 text-center">
                <span class="block text-2xl font-extrabold text-text">{ld.plannedCourses}</span>
                <span class="block text-[10px] font-extrabold uppercase tracking-wider text-text-soft">Planned</span>
              </div>
            {/if}
            {#if ld.classesToday !== undefined}
              <div class="rounded-xl bg-muted px-4 py-3 text-center">
                <span class="block text-2xl font-extrabold text-text">{ld.classesToday}</span>
                <span class="block text-[10px] font-extrabold uppercase tracking-wider text-text-soft">Today</span>
              </div>
            {/if}
          </div>
        {/if}

        {#if ld.currentBalance !== undefined}
          <div class="mb-4 flex items-baseline justify-between">
            <span class="text-sm text-text-muted">Current Balance</span>
            <span class="text-2xl font-extrabold text-text">{ld.currentBalance}</span>
          </div>
          {#if ld.dueDate}
            <div class="mb-4 flex items-center justify-between rounded-xl bg-amber-50 px-4 py-3 dark:bg-amber-900/20">
              <span class="text-sm font-bold text-amber-700 dark:text-amber-300">Due Date</span>
              <span class="text-sm font-extrabold text-amber-800 dark:text-amber-200">{ld.dueDate}</span>
            </div>
          {/if}
        {/if}

        {#if ld.unreadCount !== undefined}
          <div class="mb-4 flex items-baseline justify-between">
            <span class="text-sm text-text-muted">Unread Messages</span>
            <span class="text-2xl font-extrabold text-text">{ld.unreadCount}</span>
          </div>
        {/if}

        {#if ld.degreeProgress !== undefined}
          <div class="mb-4">
            <div class="mb-2 flex items-baseline justify-between">
              <span class="text-sm text-text-muted">Degree Progress</span>
              <span class="text-2xl font-extrabold text-text">{ld.degreeProgress}%</span>
            </div>
            <div class="h-3 w-full overflow-hidden rounded-full bg-muted">
              <div class="h-full rounded-full bg-campus-blue transition-all" style="width: {ld.degreeProgress}%"></div>
            </div>
            {#if ld.creditsEarned && ld.creditsRequired}
              <p class="mt-2 text-xs text-text-muted">{ld.creditsEarned} of {ld.creditsRequired} credits earned</p>
            {/if}
          </div>
        {/if}

        {#if ld.storageUsed && ld.storageTotal}
          {@const usedNum = parseFloat(ld.storageUsed)}
          {@const totalNum = parseFloat(ld.storageTotal)}
          {@const pct = totalNum > 0 ? Math.round((usedNum / totalNum) * 100) : 0}
          <div class="mb-4">
            <div class="mb-2 flex items-baseline justify-between">
              <span class="text-sm text-text-muted">Storage Used</span>
              <span class="text-sm font-extrabold text-text">{ld.storageUsed} / {ld.storageTotal}</span>
            </div>
            <div class="h-3 w-full overflow-hidden rounded-full bg-muted">
              <div class="h-full rounded-full bg-campus-blue transition-all" style="width: {pct}%"></div>
            </div>
          </div>
        {/if}

        {#if ld.courses}
          <div class="mb-2 space-y-2">
            {#each ld.courses as course (`${course.code}-${course.name}`)}
              <div class="flex items-center justify-between rounded-xl bg-muted px-4 py-3">
                <div class="min-w-0 flex-1">
                  <span class="block text-sm font-extrabold text-text">{course.code}</span>
                  <span class="block text-xs text-text-muted">{course.name}{#if course.instructor} · {course.instructor}{/if}{#if course.credits} · {course.credits} cr{/if}</span>
                </div>
                <span class="shrink-0 text-sm font-extrabold text-campus-blue">{course.grade}</span>
              </div>
            {/each}
          </div>
        {/if}

        {#if ld.upcomingAssignments && Array.isArray(ld.upcomingAssignments)}
          <div class="mb-2 space-y-2">
            {#each ld.upcomingAssignments as assignment (`${assignment.course}-${assignment.name}-${assignment.due}`)}
              <div class="flex items-start justify-between gap-4 rounded-xl bg-muted px-4 py-3">
                <div class="min-w-0 flex-1">
                  <span class="block text-sm font-extrabold text-text">{assignment.name}</span>
                  <span class="block text-xs text-text-muted">{assignment.course} · Due {assignment.due}</span>
                </div>
                <span class="shrink-0 rounded-full bg-campus-blue/10 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-campus-blue">{assignment.type}</span>
              </div>
            {/each}
          </div>
        {/if}

        {#if ld.recentGrades}
          <div class="mb-2 space-y-2">
            {#each ld.recentGrades as grade (`${grade.course}-${grade.assignment}`)}
              <div class="flex items-center justify-between rounded-xl bg-muted px-4 py-3">
                <div class="min-w-0 flex-1">
                  <span class="block text-sm font-bold text-text">{grade.course}</span>
                  <span class="block text-xs text-text-muted">{grade.assignment}</span>
                </div>
                <span class="shrink-0 text-sm font-extrabold text-campus-blue">{grade.grade}</span>
              </div>
            {/each}
          </div>
        {/if}

        {#if ld.recentEmails && Array.isArray(ld.recentEmails)}
          <div class="mb-2 space-y-2">
            {#each ld.recentEmails as email (`${email.sender}-${email.subject}-${email.time}`)}
              <div class="flex items-start gap-3 rounded-xl bg-muted px-4 py-3">
                <div class="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg {email.unread ? 'bg-campus-blue text-white' : 'bg-surface text-text-soft ring-1 ring-border/60'}">
                  <Mail class="h-4 w-4" />
                </div>
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-2">
                    <span class="block text-sm font-bold text-text">{email.sender}</span>
                    {#if email.unread}<span class="h-2 w-2 shrink-0 rounded-full bg-campus-blue"></span>{/if}
                  </div>
                  <span class="block text-xs font-extrabold text-text">{email.subject}</span>
                  <span class="block truncate text-xs text-text-muted">{email.preview}</span>
                </div>
                <span class="shrink-0 text-xs text-text-soft">{email.time}</span>
              </div>
            {/each}
          </div>
        {/if}

        {#if ld.breakdown}
          <div class="mb-2 space-y-2">
            {#each ld.breakdown as item (`${item.type}-${item.amount}`)}
              <div class="flex items-center justify-between rounded-xl bg-muted px-4 py-3">
                <div class="min-w-0 flex-1">
                  <span class="block text-sm font-bold text-text">{item.type}</span>
                </div>
                <div class="flex items-center gap-3 shrink-0">
                  <span class="text-sm font-extrabold text-text">{item.amount}</span>
                  <span class="rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider {item.status === 'Accepted' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : item.status === 'Pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' : 'bg-muted text-text-muted'}">{item.status}</span>
                </div>
              </div>
            {/each}
          </div>
        {/if}

        {#if ld.paymentHistory && Array.isArray(ld.paymentHistory)}
          <div class="mb-2 space-y-2">
            {#each ld.paymentHistory as payment (`${payment.date}-${payment.method}-${payment.amount}`)}
              <div class="flex items-center justify-between rounded-xl bg-muted px-4 py-3">
                <div class="min-w-0 flex-1">
                  <span class="block text-sm font-bold text-text">{payment.date}</span>
                  <span class="block text-xs text-text-muted">{payment.method}</span>
                </div>
                <span class="shrink-0 text-sm font-extrabold text-emerald-600 dark:text-emerald-400">{payment.amount}</span>
              </div>
            {/each}
          </div>
        {/if}

        {#if ld.tickets && Array.isArray(ld.tickets)}
          <div class="mb-2 space-y-2">
            {#each ld.tickets as ticket (`${ticket.title}-${ticket.date}`)}
              <div class="flex items-center justify-between rounded-xl bg-muted px-4 py-3">
                <div class="min-w-0 flex-1">
                  <span class="block text-sm font-bold text-text">{ticket.title}</span>
                  <span class="block text-xs text-text-muted">{ticket.category} · {ticket.date}</span>
                </div>
                <span class="shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider {ticket.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : ticket.status === 'In Progress' ? 'bg-campus-blue/10 text-campus-blue' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'}">{ticket.status}</span>
              </div>
            {/each}
          </div>
        {/if}

        {#if ld.locations && Array.isArray(ld.locations)}
          <div class="mb-2 space-y-2">
            {#each ld.locations as location (location.name)}
              <div class="flex items-center justify-between rounded-xl bg-muted px-4 py-3">
                <div class="min-w-0 flex-1">
                  <span class="block text-sm font-bold text-text">{location.name}</span>
                  <span class="block text-xs text-text-muted">{location.hours}</span>
                </div>
                <div class="flex items-center gap-2 shrink-0">
                  <span class="h-2 w-2 rounded-full {location.status === 'Open' ? 'bg-emerald-500' : 'bg-rose-500'}"></span>
                  <span class="text-xs font-extrabold {location.status === 'Open' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}">{location.status}</span>
                  <span class="text-xs text-text-soft">{location.untilClose}</span>
                </div>
              </div>
            {/each}
          </div>
        {/if}

        {#if ld.nextClass}
          <div class="mb-2 rounded-xl bg-muted px-4 py-3">
            <span class="block text-xs font-bold uppercase tracking-wider text-text-soft">Next Class</span>
            <span class="mt-1 block text-lg font-extrabold text-text">{ld.nextClass.course}</span>
            <div class="mt-1 flex flex-wrap gap-x-4 text-sm text-text-muted">
              <span class="inline-flex items-center gap-1"><Clock class="h-3.5 w-3.5" /> {ld.nextClass.time}</span>
              <span class="inline-flex items-center gap-1"><MapPin class="h-3.5 w-3.5" /> {ld.nextClass.location}</span>
            </div>
          </div>
        {/if}

        {#if ld.openTickets !== undefined}
          <div class="mb-3 flex items-baseline justify-between">
            <span class="text-sm text-text-muted">Open Tickets</span>
            <span class="text-2xl font-extrabold text-text">{ld.openTickets}</span>
          </div>
          {#if ld.lastTicket}
            <div class="mb-2 rounded-xl bg-muted px-4 py-3">
              <span class="block text-xs font-bold uppercase tracking-wider text-text-soft">Latest Ticket</span>
              <span class="mt-1 block text-sm font-bold text-text">{ld.lastTicket}</span>
            </div>
          {/if}
        {/if}

        {#if ld.diningDollarsRemaining !== undefined}
          <div class="mb-4 flex items-baseline justify-between">
            <span class="text-sm text-text-muted">Dining Dollars</span>
            <span class="text-2xl font-extrabold text-text">{ld.diningDollarsRemaining}</span>
          </div>
          {#if ld.diningDollarsSpentThisMonth}
            <p class="mb-4 text-xs text-text-muted">{ld.diningDollarsSpentThisMonth} spent this month</p>
          {/if}
        {/if}

        {#if ld.currentRoom}
          <div class="mb-2 rounded-xl bg-muted px-4 py-3">
            <span class="block text-xs font-bold uppercase tracking-wider text-text-soft">Current Room</span>
            <span class="mt-1 block text-lg font-extrabold text-text">{ld.currentRoom}</span>
            <span class="block text-sm text-text-muted">{ld.roomType} · {ld.mealPlan}</span>
            {#if ld.roommates && Array.isArray(ld.roommates)}
              <span class="block text-xs text-text-muted">Roommates: {ld.roommates.join(', ')}</span>
            {/if}
          </div>
        {/if}

        {#if ld.printBalance !== undefined}
          <div class="mb-4 flex items-baseline justify-between">
            <span class="text-sm text-text-muted">Print Balance</span>
            <span class="text-2xl font-extrabold text-text">{ld.printBalance}</span>
          </div>
          {#if ld.pagesPrinted !== undefined}
            <p class="text-xs text-text-muted">{ld.pagesPrinted} pages printed this semester</p>
          {/if}
        {/if}

        {#if ld.campusAlertLevel}
          <div class="mb-2 flex items-center justify-between rounded-xl bg-muted px-4 py-3">
            <span class="text-sm font-bold text-text">Campus Alert Level</span>
            <span class="rounded-full bg-emerald-100 px-3 py-1 text-xs font-extrabold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">{ld.campusAlertLevel}</span>
          </div>
        {/if}

        {#if ld.registrationWindow}
          <div class="mb-2 rounded-xl bg-amber-50 px-4 py-3 dark:bg-amber-900/20">
            <span class="block text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">Registration Opens</span>
            <span class="mt-1 block text-lg font-extrabold text-amber-800 dark:text-amber-200">{ld.registrationWindow}</span>
            <div class="mt-2 flex flex-wrap gap-2 text-xs text-amber-700 dark:text-amber-300">
              {#if ld.advisorHold}<span>Advisor Hold: {ld.advisorHold}</span>{/if}
              {#if ld.balanceHold}<span>Balance Hold: {ld.balanceHold}</span>{/if}
            </div>
          </div>
        {/if}

        {#if ld.holds !== undefined}
          {#if Array.isArray(ld.holds) && ld.holds.length > 0}
            <div class="mb-2 space-y-2">
              {#each ld.holds as hold (hold)}
                <div class="flex items-start gap-2 rounded-xl bg-amber-50 px-4 py-3 dark:bg-amber-900/20">
                  <AlertTriangle class="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                  <span class="text-sm font-bold text-amber-800 dark:text-amber-200">{hold}</span>
                </div>
              {/each}
            </div>
          {:else if typeof ld.holds === 'number' && ld.holds > 0}
            <div class="mb-3 flex items-baseline justify-between">
              <span class="text-sm text-text-muted">Holds</span>
              <span class="text-2xl font-extrabold text-text">{ld.holds}</span>
            </div>
          {:else if typeof ld.holds === 'number' && ld.holds === 0}
            <div class="mb-2 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 dark:bg-emerald-900/20">
              <CheckCircle2 class="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span class="text-sm font-bold text-emerald-800 dark:text-emerald-200">No holds on your account</span>
            </div>
          {/if}
        {/if}

        {#if ld.applicationStatus}
          <div class="mb-4">
            <div class="mb-2 flex items-center justify-between rounded-xl {ld.applicationStatus === 'Accepted' || ld.applicationStatus === 'Complete' ? 'bg-emerald-50 dark:bg-emerald-900/20' : ld.applicationStatus === 'Under Review' ? 'bg-campus-blue/5 dark:bg-campus-blue/10' : 'bg-amber-50 dark:bg-amber-900/20'} px-4 py-3">
              <span class="text-sm font-bold text-text-muted">Application Status</span>
              <span class="text-sm font-extrabold {ld.applicationStatus === 'Accepted' || ld.applicationStatus === 'Complete' ? 'text-emerald-700 dark:text-emerald-300' : ld.applicationStatus === 'Under Review' ? 'text-campus-blue' : 'text-amber-700 dark:text-amber-300'}">{ld.applicationStatus}</span>
            </div>
            {#if ld.submittedDate}
              <div class="flex items-baseline justify-between px-1 text-sm">
                <span class="text-text-muted">Submitted</span>
                <span class="font-extrabold text-text">{ld.submittedDate}</span>
              </div>
            {/if}
            {#if ld.lastUpdated}
              <div class="flex items-baseline justify-between px-1 text-sm">
                <span class="text-text-muted">Last Updated</span>
                <span class="font-extrabold text-text">{ld.lastUpdated}</span>
              </div>
            {/if}
          </div>
        {/if}

        {#if ld.checklistItems && Array.isArray(ld.checklistItems)}
          <div class="mb-2">
            <p class="mb-2 text-xs font-extrabold uppercase tracking-[0.18em] text-text-muted">Application Checklist</p>
            <div class="space-y-1.5">
              {#each ld.checklistItems as item (item.label)}
                <div class="flex items-center gap-2.5 rounded-xl bg-muted px-4 py-2.5">
                  {#if item.status === 'complete'}
                    <CheckCircle2 class="h-4 w-4 shrink-0 text-emerald-500" />
                    <span class="text-sm text-text-muted line-through">{item.label}</span>
                  {:else if item.status === 'missing'}
                    <XCircle class="h-4 w-4 shrink-0 text-rose-500" />
                    <span class="text-sm font-bold text-rose-700 dark:text-rose-300">{item.label}</span>
                  {:else}
                    <Clock class="h-4 w-4 shrink-0 text-amber-500" />
                    <span class="text-sm font-bold text-text">{item.label}</span>
                  {/if}
                </div>
              {/each}
            </div>
          </div>
        {/if}

        {#if ld.nextSteps && Array.isArray(ld.nextSteps)}
          <div class="mb-2">
            <p class="mb-2 text-xs font-extrabold uppercase tracking-[0.18em] text-text-muted">Next Steps</p>
            <div class="space-y-2">
              {#each ld.nextSteps as step, i (step)}
                <div class="flex items-start gap-3 rounded-xl bg-muted px-4 py-3">
                  <span class="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-campus-blue text-xs font-extrabold text-white">{i + 1}</span>
                  <span class="text-sm text-text">{step}</span>
                </div>
              {/each}
            </div>
          </div>
        {/if}

        {#if ld.flags && Array.isArray(ld.flags)}
          <div class="mb-2 space-y-2">
            {#each ld.flags as flag (flag)}
              <div class="flex items-start gap-2 rounded-xl bg-amber-50 px-4 py-3 dark:bg-amber-900/20">
                <AlertTriangle class="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <span class="text-sm font-bold text-amber-800 dark:text-amber-200">{flag}</span>
              </div>
            {/each}
          </div>
        {/if}

        {#if ld.quickLinks && Array.isArray(ld.quickLinks)}
          <div class="mt-4 flex flex-wrap gap-2">
            {#each ld.quickLinks as link (link)}
              <span class="inline-flex items-center gap-1.5 rounded-lg bg-campus-blue/10 px-3 py-1.5 text-xs font-extrabold text-campus-blue">{link}</span>
            {/each}
          </div>
        {/if}

        {#if genericEntries(ld).length > 0}
          <div class="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {#each genericEntries(ld) as [key, value] (key)}
              <div class="flex items-center justify-between rounded-xl bg-muted px-4 py-3">
                <span class="text-sm text-text-muted">{labelForKey(key)}</span>
                <span class="text-sm font-extrabold text-text">{typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}</span>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}
