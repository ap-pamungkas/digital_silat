# AGENTS.md

# Digital Pencak Silat Scoring System

Instructions for AI coding agents working on this repository.

This file defines how an AI agent must inspect, modify, implement, test, and document this project.

---

# 1. READ FIRST
Before making any changes, the agent MUST read:
```text
AGENTS.md
DESIGN.md
PRISMA.md
README.md
package.json
```

If the requested task relates to an existing feature, inspect the relevant source files before modifying anything.

Do not assume the project structure.

---

# 2. PROJECT PURPOSE

This project is a Digital Pencak Silat Scoring System.

The system provides:

* Judge scoring
* Operator control
* Match management
* Tournament management
* Athlete management
* Judge management
* Arena management
* Match timer
* Penalty management
* Real-time scoring
* Live scoreboard
* OBS streaming overlay
* Match history
* Reports
* Authentication
* Audit logging

The system is designed for real-world Pencak Silat competitions.

---

# 3. PRIMARY TECHNOLOGY

The project uses:

```text
Next.js
React
TypeScript
Tailwind CSS
PostgreSQL
Supabase
Prisma
```

Use the existing versions defined in:

```text
package.json
```

Do not upgrade major dependencies unless explicitly requested.

Do not introduce another frontend framework.

---

# 4. GENERAL AGENT RULES

Before implementing anything:

1. Understand the requested feature.
2. Inspect the existing architecture.
3. Search for existing components/functions.
4. Reuse existing implementations where possible.
5. Check DESIGN.md for UI rules.
6. Check database schema before modifying data-related features.
7. Check existing API patterns.
8. Implement the smallest correct change.
9. Test the change.
10. Report what was changed.

Do not rewrite unrelated code.

---

# 5. DO NOT GUESS

If something already exists in the repository:

```text
Use it.
```

Do not create another version without checking first.

Examples:

If a Button component already exists:

```text
components/ui/Button.tsx
```

do not create:

```text
components/common/CustomButton.tsx
```

unless there is a clear architectural reason.

---

# 6. SOURCE OF TRUTH

Priority:

```text
1. Explicit user instruction
2. AGENTS.md
3. DESIGN.md
4. Existing architecture
5. Existing implementation patterns
6. General best practices
```

If an explicit user instruction conflicts with this document, follow the explicit user instruction.

---

# 7. DESIGN RULES

All UI work MUST follow:

```text
DESIGN.md
```

Do not create UI independently from DESIGN.md.

Important visual rules:

* Dark theme
* Red / Blue competition semantics
* High contrast
* Professional sports technology aesthetic
* Large scoring controls
* Responsive design
* Accessibility
* Reusable components

Red always represents Red Corner.

Blue always represents Blue Corner.

---

# 8. NEXT.JS ARCHITECTURE

Use Next.js App Router.

Recommended structure:

```text
app/
├── (auth)/
│   └── login/
│
├── (dashboard)/
│   ├── dashboard/
│   ├── tournaments/
│   ├── athletes/
│   ├── categories/
│   ├── matches/
│   ├── arenas/
│   ├── judges/
│   ├── reports/
│   └── settings/
│
├── judge/
│   ├── home/
│   ├── matches/
│   ├── scoring/
│   └── history/
│
├── display/
│   └── [arenaId]/
│
├── overlay/
│   └── [arenaId]/
│
└── api/
```

Do not reorganize routes unnecessarily.

---

# 9. SERVER VS CLIENT COMPONENTS

Use Server Components by default.

Use `"use client"` only when required for:

* User interaction
* Browser APIs
* Realtime subscriptions
* WebSocket
* Local storage
* Device APIs
* Client-side state

Do not turn an entire page into a Client Component if only a small component needs client-side behavior.

Prefer:

```text
Server Component
    ↓
Client Component
```

instead of:

```text
Entire Page = Client Component
```

---

# 10. COMPONENT RULES

Use reusable components.

Suggested structure:

```text
components/
├── ui/
├── layout/
├── dashboard/
├── judge/
├── scoring/
├── match/
├── athlete/
├── tournament/
├── display/
└── overlay/
```

Before creating a component:

1. Search existing components.
2. Determine whether an existing component can be reused.
3. Extend the component if appropriate.
4. Create a new component only when necessary.

Avoid duplicated components.

---

# 11. TYPESCRIPT RULES

TypeScript must remain strongly typed.

Avoid:

```ts
any
```

unless absolutely necessary.

Prefer:

```ts
type
interface
enum
```

where appropriate.

Do not silence errors with:

```ts
// @ts-ignore
```

or:

```ts
// @ts-expect-error
```

unless there is a documented reason.

---

# 12. DATABASE

The project uses:

```text
PostgreSQL
+
Supabase
+
Prisma
```

Prisma is the application ORM.

Do not access the database directly from UI components.

Use an appropriate server-side layer.

---

# 13. DATABASE CHANGES

Before changing the database:

1. Inspect Prisma schema.
2. Understand existing relationships.
3. Check migrations.
4. Determine whether existing data is affected.
5. Update Prisma schema.
6. Create migration.
7. Update seed data if necessary.
8. Run Prisma validation.
9. Test affected functionality.

Never casually delete or rename database columns.

---

# 14. DATABASE DOMAIN

Core entities include:

```text
User
Tournament
Arena
Category
Athlete
Match
Judge
ScoreEvent
Penalty
Timer
AuditLog
```

Use the existing schema as the source of truth.

Do not create duplicate entities representing the same domain concept.

---

# 15. SCORING DOMAIN

Scoring is a critical domain.

Example scoring actions:

```text
+1 PUKULAN
+2 TENDANGAN
+3 JATUHAN
```

A score event should contain enough information to determine:

```text
Match
Judge
Corner / Athlete
Action
Point
Timestamp
Status
```

Do not directly mutate the final score without maintaining the underlying scoring event when the domain requires event tracking.

---

# 16. SCORE EVENT PRINCIPLE

Prefer event-based scoring.

Conceptually:

```text
Judge Action
      ↓
Score Event
      ↓
Validation
      ↓
Score Calculation
      ↓
Match State
      ↓
Realtime Broadcast
```

Avoid scattered score mutations throughout the application.

The scoring logic should have a clear single source of truth.

---

# 17. REALTIME

Realtime is a core system feature.

The expected flow:

```text
Judge
   ↓
API / Realtime
   ↓
Score Engine
   ↓
Database
   ↓
Realtime Event
   ↓
Operator
   ↓
Score Display
   ↓
OBS Overlay
```

Realtime UI must distinguish between:

```text
Submitting
Synced
Failed
Retrying
Offline
```

Never pretend an event was successfully synchronized when it was not confirmed.

---

# 18. JUDGE APPLICATION

The Judge application is the highest-priority feature.

The judge must be able to:

```text
Login
↓
Select / receive match
↓
Enter match
↓
Submit score
↓
View score state
↓
View event history
↓
Submit penalty
↓
Finish match
```

During active scoring:

* Minimize navigation.
* Keep scoring controls visible.
* Use large touch targets.
* Avoid unnecessary dialogs.
* Provide immediate feedback.
* Display connection status.

---

# 19. SCORING PERFORMANCE

Scoring interactions must be fast.

Normal scoring:

```text
Tap
↓
Immediate UI feedback
↓
Submit event
↓
Synchronize
```

Do not add unnecessary confirmation dialogs for normal scoring.

Confirmation is required for dangerous actions such as:

```text
Penalty
Reset
End Match
Reject Score
```

---

# 20. TIMER

The match timer is a critical shared state.

Do not implement independent timers on every client that can drift apart.

Prefer a server-authoritative timer model.

Clients should derive/display timer state from synchronized match state.

Timer states:

```text
READY
RUNNING
PAUSED
FINISHED
```

---

# 21. OPERATOR

Operator has authority over match state.

Operator functions include:

```text
Start Match
Pause Match
Resume Match
Reset Match
End Round
End Match
Verify Score
Reject Score
Apply Penalty
```

Dangerous operations must require confirmation.

---

# 22. JUDGE MONITORING

The operator should be able to see all five judges:

```text
JURI 1
JURI 2
JURI 3
JURI 4
JURI 5
```

Each should expose relevant state:

```text
ONLINE
OFFLINE
SYNCING
LAST ACTIVE
```

Do not expose sensitive device information unnecessarily.

---

# 23. SCORE DISPLAY

The score display is a presentation-only interface.

Route:

```text
/display/[arenaId]
```

It should prioritize:

```text
Athlete
Score
Timer
Round
Penalty
```

Avoid administrative controls on the public scoreboard.

---

# 24. OBS OVERLAY

Route:

```text
/overlay/[arenaId]
```

The overlay should be:

* Lightweight
* Transparent
* Readable
* Broadcast friendly
* 16:9

Do not include operator controls.

---

# 25. AUTHENTICATION

Authentication must be handled through the project's configured authentication system.

Do not:

* Store plaintext passwords.
* Expose tokens in UI.
* Hardcode credentials.
* Put secrets in client-side code.

Never expose:

```text
DATABASE_URL
SUPABASE_SERVICE_ROLE_KEY
PRIVATE_API_KEYS
JWT_SECRET
```

to browser/client code.

Only public environment variables may use:

```text
NEXT_PUBLIC_
```

when appropriate.

---

# 26. ENVIRONMENT VARIABLES

Never hardcode environment-specific values.

Use:

```text
.env.local
```

for local development.

Never commit secrets.

Do not modify `.env` files with fake production credentials.

---

# 27. API RULES

API endpoints must:

* Validate input.
* Authenticate where required.
* Authorize based on role.
* Return predictable responses.
* Handle errors.
* Avoid exposing sensitive data.

Prefer structured responses such as:

```ts
{
  success: true,
  data: ...
}
```

or the project's established response format.

Follow existing API conventions instead of inventing a new response format.

---

# 28. VALIDATION

Validate user input at the server boundary.

Use the existing validation library if the project already has one.

Validation should cover:

* Required fields
* Data types
* IDs
* Score values
* Match state
* Permissions
* Business rules

Never rely only on frontend validation.

---

# 29. AUTHORIZATION

Roles may include:

```text
ADMIN
OPERATOR
JUDGE
REFEREE
```

Do not rely only on hiding UI controls.

Server-side authorization is mandatory.

Example:

A Judge may submit scoring events for an assigned match.

A Judge should not be able to:

```text
Delete Tournament
Delete Athlete
Reset unrelated Match
Manage Users
```

unless explicitly authorized.

---

# 30. ERROR HANDLING

Never expose raw technical errors to users.

Bad:

```text
PrismaClientKnownRequestError
```

Good:

```text
Unable to save the score.
Please try again.
```

Technical error details should be logged server-side.

---

# 31. LOGGING

Log important system events.

Examples:

```text
Login
Logout
Score submitted
Penalty submitted
Score verified
Score rejected
Match started
Match paused
Match ended
User permission changes
```

Do not log:

* Passwords
* Access tokens
* Secrets
* Sensitive credentials

---

# 32. AUDITABILITY

Scoring actions must be traceable.

Important events should contain:

```text
Who
What
When
Match
Affected Athlete / Corner
Device / Session where appropriate
```

Do not silently overwrite important competition events.

---

# 33. RESPONSIVE DESIGN

Judge:

```text
Mobile first
```

Operator:

```text
Desktop first
```

Score Display:

```text
16:9
```

OBS:

```text
16:9
```

Target judge sizes:

```text
360 × 800
390 × 844
430 × 932
```

Target desktop:

```text
1440 × 1024
```

Target display:

```text
1920 × 1080
```

---

# 34. ACCESSIBILITY

All interfaces should support:

* Keyboard navigation where applicable
* Visible focus
* Semantic HTML
* Accessible labels
* Sufficient contrast
* Large touch targets
* Screen-reader-friendly labels

Do not rely solely on color.

---

# 35. PERFORMANCE

Prefer:

* Server Components
* Server-side data fetching
* Optimized images
* Dynamic imports where useful
* Minimal client-side JavaScript
* Reusable components
* Efficient realtime subscriptions

Avoid unnecessary:

* Dependencies
* Global state
* Client Components
* Re-renders
* API requests
* Large bundle additions

---

# 36. STATE MANAGEMENT

Use the simplest state mechanism appropriate for the feature.

Prefer:

```text
Local React state
```

when state is local.

Use shared state only when multiple components genuinely need it.

Do not introduce Redux/Zustand/etc. unless the project already uses it or the requirement clearly justifies it.

---

# 37. DATA FETCHING

Use the existing project data-fetching pattern.

Do not introduce multiple competing patterns.

Before adding a new data-fetching solution:

1. Inspect existing implementation.
2. Reuse existing utilities.
3. Determine whether the new requirement truly needs another approach.

---

# 38. FILE NAMING

Use the existing project naming convention.

Prefer descriptive names.

Examples:

```text
ScoreButton.tsx
MatchCard.tsx
JudgeStatus.tsx
LiveScore.tsx
MatchTimer.tsx
```

Avoid:

```text
Thing.tsx
Data.tsx
Component1.tsx
NewCard.tsx
Test2.tsx
```

---

# 39. COMMITS / CHANGES

Keep changes focused.

A task such as:

```text
Add penalty confirmation
```

should not also:

* Redesign dashboard
* Upgrade Next.js
* Change database architecture
* Replace the UI framework

unless required.

---

# 40. Testing

Before completing a task, run appropriate checks.

At minimum where available:

```bash
npm run lint
npm run build
```

Also run project-specific tests.

For database changes:

```bash
npx prisma validate
```

and appropriate migration checks.

Do not claim tests passed if they were not executed.

---

# 41. Browser Testing

For UI changes, verify:

* Desktop
* Mobile
* Responsive layout
* Loading state
* Error state
* Empty state
* Interactive state

For Judge UI specifically verify:

* Scoring buttons
* Timer
* Connection state
* Score update
* Penalty dialog

---

# 42. No Unrelated Changes

Do not modify files unrelated to the requested task.

If an unrelated problem is discovered:

1. Mention it.
2. Do not silently rewrite it.
3. Fix it only if it blocks the requested task.

---

# 43. Dependency Rules

Before installing a dependency:

1. Check whether an existing dependency already solves the problem.
2. Check package.json.
3. Prefer lightweight dependencies.
4. Avoid duplicate libraries with overlapping functionality.

Do not add dependencies merely for convenience.

---

# 44. Documentation

When implementing a significant feature, update appropriate documentation.

Examples:

```text
README.md
DESIGN.md
API documentation
Database documentation
```

Do not create documentation for trivial internal changes unless required.

---

# 45. AI IMPLEMENTATION WORKFLOW

For every task, follow:

```text
1. Understand
       ↓
2. Inspect
       ↓
3. Plan
       ↓
4. Implement
       ↓
5. Validate
       ↓
6. Test
       ↓
7. Review
       ↓
8. Report
```

---

# 46. INSPECT PHASE

Before editing:

Check:

```text
package.json
app/
components/
lib/
prisma/
public/
```

Search for:

* Related components
* Related API routes
* Existing hooks
* Existing utilities
* Existing database models
* Existing types

---

# 47. PLAN PHASE

For medium or large changes, define:

```text
Goal
Files affected
Data flow
UI changes
Backend changes
Database changes
Testing
```

Do not start large architectural changes without understanding the current system.

---

# 48. IMPLEMENT PHASE

Implementation rules:

* Follow existing patterns.
* Keep changes minimal.
* Reuse components.
* Keep types strict.
* Validate input.
* Handle errors.
* Maintain responsive behavior.
* Follow DESIGN.md.

---

# 49. REVIEW PHASE

Before finishing, inspect the diff.

Check:

```text
Did I modify unrelated files?

Did I introduce duplicated code?

Did I break existing routes?

Did I break TypeScript?

Did I introduce a new dependency?

Did I violate DESIGN.md?

Did I expose secrets?

Did I break mobile layout?

Did I handle loading/error states?
```

---

# 50. REPORT PHASE

When completing a task, report:

```text
Implemented:
- ...

Modified:
- ...

Database:
- ...

Testing:
- ...

Known issues:
- ...
```

Keep the report concise and factual.

Do not claim functionality that was not implemented.

---

# 51. CRITICAL SCORING RULE

The scoring system is competition-critical.

Never casually modify:

```text
Score Calculation
Score Event
Timer
Penalty
Match State
Judge Assignment
Winner Calculation
```

Before changing scoring logic:

1. Understand current implementation.
2. Identify all consumers.
3. Check database implications.
4. Check realtime implications.
5. Check Judge UI.
6. Check Operator UI.
7. Check Score Display.
8. Check OBS Overlay.
9. Test the complete flow.

---

# 52. END-TO-END SCORING FLOW

The expected system flow is:

```text
JUDGE MOBILE

Tap +1 PUKULAN

        ↓

Score Event

        ↓

Validation

        ↓

Score Engine

        ↓

Database

        ↓

Realtime Event

        ├───────────────┐
        ↓               ↓
Operator          Score Display
        │               │
        └───────┬───────┘
                ↓
           OBS Overlay
```

Any modification to scoring should preserve this conceptual flow unless explicitly redesigned.

---

# 53. DESIGN SOURCE OF TRUTH

For all visual implementation:

```text
DESIGN.md
```

For coding and architecture:

```text
AGENTS.md
```

For product requirements:

```text
PRD / project documentation
```

For database:

```text
Prisma schema + migrations
```

Do not contradict these sources without explicit instruction.

---

# 54. FINAL PRINCIPLE

Build the smallest reliable solution that satisfies the requirement.

Prefer:

```text
Simple
Typed
Reusable
Testable
Responsive
Accessible
Maintainable
```

over:

```text
Complex
Duplicated
Over-engineered
Hard to test
Hard to maintain
```

The system is a real-time competition application.

Reliability and scoring accuracy are more important than visual complexity.

The final product must feel:

```text
FAST
PRECISE
RELIABLE
REAL-TIME
PROFESSIONAL
```
