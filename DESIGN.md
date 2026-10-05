# DESIGN.md

# Digital Pencak Silat Scoring System

Design and frontend implementation rules for the Digital Pencak Silat Scoring System.

This document is the primary design and UI/UX source of truth for the Next.js application.

Any AI agent, developer, or design-generation tool working on this project MUST follow these rules unless explicitly instructed otherwise.

---

# 1. Project Overview

Digital Pencak Silat Scoring System is a real-time web-based tournament scoring platform.

The system consists of:

1. Operator Dashboard
2. Judge Mobile Web Application
3. Live Score Display
4. OBS Streaming Overlay
5. Authentication
6. Tournament Management
7. Match Management
8. Athlete Management
9. Judge Management
10. Scoring System
11. Penalty System
12. Match Timer
13. Real-time Event Monitoring
14. Reports and Match History

The application is built using:

* Next.js
* React
* TypeScript
* Tailwind CSS
* PostgreSQL
* Supabase
* Prisma
* WebSocket / realtime communication

---

# 2. Primary Product Goal

The UI must make scoring during a live Pencak Silat match:

* Fast
* Accurate
* Easy to understand
* Difficult to misuse
* Highly readable
* Responsive
* Reliable

The Judge interface is the highest-priority interface.

The Operator interface is the second priority.

The Score Display and OBS Overlay are display-focused interfaces.

---

# 3. Design Philosophy

The design combines:

* Modern sports technology
* Cyber sports
* Neo-brutalism
* Professional tournament software
* High contrast interfaces
* Clean information architecture

The application must NOT look like a generic:

* CRM
* ERP
* Finance dashboard
* Corporate SaaS
* Admin template

The interface should feel like professional sports competition software.

---

# 4. Design Priorities

Always prioritize:

```text
1. Functionality
2. Readability
3. Speed
4. Accuracy
5. Consistency
6. Accessibility
7. Visual polish
```

Never sacrifice usability for visual effects.

---

# 5. Technology Rules

Frontend:

```text
Next.js
React
TypeScript
Tailwind CSS
```

Use the existing project stack.

Do NOT introduce another frontend framework unless explicitly requested.

Do NOT introduce unnecessary UI frameworks.

Prefer:

```text
Tailwind CSS
+
Reusable React Components
```

---

# 6. Next.js Rules

Use the existing Next.js App Router architecture.

Recommended structure:

```text
app/
├── (auth)/
│   ├── login/
│   └── ...
│
├── (dashboard)/
│   ├── dashboard/
│   ├── tournaments/
│   ├── athletes/
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
│   └── [arena]/
│
├── overlay/
│   └── [arena]/
│
└── api/
```

Do not reorganize the application structure without a clear reason.

---

# 7. Component Architecture

Use reusable components.

Recommended:

```text
components/
├── ui/
│   ├── Button
│   ├── Card
│   ├── Badge
│   ├── Dialog
│   ├── Input
│   ├── Select
│   ├── Tabs
│   └── Toast
│
├── scoring/
│   ├── ScoreButton
│   ├── ScoreBoard
│   ├── Timer
│   ├── PenaltyButton
│   └── ScoreEvent
│
├── match/
│   ├── MatchCard
│   ├── AthleteCard
│   ├── MatchHeader
│   └── MatchStatus
│
├── judge/
│   ├── JudgeStatus
│   └── JudgeCard
│
├── dashboard/
│   ├── Sidebar
│   ├── Header
│   ├── StatCard
│   └── DataTable
│
└── display/
    ├── LiveScore
    ├── AthleteScore
    └── MatchTimer
```

Do not duplicate components when an existing reusable component can be used.

---

# 8. Design Tokens

## Background

```text
background-primary: #0F1115
background-surface: #1A1D24
background-elevated: #222630
```

## Competition Colors

```text
red-primary: #D32F2F
red-dark: #9B1C1C

blue-primary: #1565C0
blue-dark: #0D47A1
```

## Status

```text
success: #4CAF50
warning: #FFC107
danger: #F44336
info: #2196F3
```

## Text

```text
text-primary: #FFFFFF
text-secondary: #B0B7C3
text-muted: #737985
```

## Border

```text
border: #30343D
```

Do not introduce random colors.

---

# 9. Red and Blue Rules

Red and Blue have semantic meaning.

RED always represents:

```text
Red Corner
Red Athlete
Red Score
Red Scoring Controls
```

BLUE always represents:

```text
Blue Corner
Blue Athlete
Blue Score
Blue Scoring Controls
```

Never swap these meanings.

Do not use Red and Blue randomly for decorative elements.

---

# 10. Typography

Primary font:

```text
Inter
```

Fallback:

```text
system-ui
```

Typography hierarchy:

```text
Display
H1
H2
H3
Body Large
Body
Body Small
Caption
```

Critical values such as scores and timers must use bold typography.

---

# 11. Score Display

Scores are one of the most important UI elements.

Mobile:

```text
48–72px
```

Desktop:

```text
64–96px
```

Large scoreboard:

```text
96–180px
```

Use responsive typography.

Never make scores visually secondary.

---

# 12. Timer

The timer must always be highly visible during an active match.

Example:

```text
01:30
```

Timer states:

```text
RUNNING
PAUSED
WARNING
CRITICAL
FINISHED
```

Visual states must be distinguishable.

Example:

```text
RUNNING
01:30

PAUSED
01:30
PAUSED

FINISHED
00:00
ROUND FINISHED
```

---

# 13. Judge Mobile UI

The Judge UI is optimized for:

```text
360 × 800
390 × 844
430 × 932
```

It must also support tablets.

Primary screen:

```text
Judge Scoring
```

Required elements:

```text
Judge Identity
Arena
Match Number
Timer
Round
Red Athlete
Red Score
Red Scoring Buttons
Blue Athlete
Blue Score
Blue Scoring Buttons
Penalty
Connection Status
```

---

# 14. Judge Scoring Layout

Mobile portrait:

```text
┌─────────────────────────────┐
│ ARENA 01       JURI 1       │
├─────────────────────────────┤
│                             │
│          01:30              │
│        ROUND 2 / 3           │
│                             │
├─────────────────────────────┤
│ RED                         │
│ BIMA SAKTI                  │
│          23                 │
│                             │
│ [ +1 PUKULAN ]              │
│ [ +2 TENDANGAN ]            │
│ [ +3 JATUHAN ]              │
│                             │
├─────────────────────────────┤
│ BLUE                        │
│ ADITYA PRATAMA              │
│          27                 │
│                             │
│ [ +1 PUKULAN ]              │
│ [ +2 TENDANGAN ]            │
│ [ +3 JATUHAN ]              │
└─────────────────────────────┘
```

Buttons must be large.

Avoid tiny icon-only controls.

---

# 15. Touch Target

Minimum:

```text
48 × 48px
```

Recommended for scoring actions:

```text
64px+
```

The scoring interface should favor large controls.

---

# 16. Scoring Interaction

When a judge presses:

```text
+1 PUKULAN
+2 TENDANGAN
+3 JATUHAN
```

The UI should immediately provide feedback.

Example:

```text
+1
REGISTERED
```

Do not use long animations.

Feedback should be approximately:

```text
150–300ms
```

---

# 17. Penalty

Penalty is a critical action.

Never immediately execute a penalty without confirmation.

Flow:

```text
Penalty
↓
Select Penalty
↓
Confirmation
↓
Submit
```

Example:

```text
Apply P1 penalty to RED?

[ CANCEL ]

[ CONFIRM ]
```

---

# 18. Connection Status

Always show connection state on Judge UI.

Possible states:

```text
ONLINE
SYNCING
RECONNECTING
OFFLINE
```

Use:

```text
Icon + Text + Color
```

Never rely only on color.

---

# 19. Operator Dashboard

Target:

```text
1440 × 1024
```

Structure:

```text
Sidebar
Header
Main Content
```

Navigation:

```text
Dashboard
Tournament
Athletes
Categories
Matches
Arenas
Judges
Live Scoring
Penalties
Reports
Settings
```

---

# 20. Operator Dashboard Cards

Important dashboard metrics:

```text
Active Matches
Active Arenas
Connected Judges
Upcoming Matches
Completed Matches
System Status
```

Use reusable statistic cards.

---

# 21. Live Match Operator

The operator must see:

```text
Match
Red Athlete
Blue Athlete
Score
Round
Timer
Judges
Score Events
Penalties
```

Controls:

```text
START
PAUSE
RESUME
RESET
END ROUND
END MATCH
```

Destructive actions require confirmation.

---

# 22. Judge Monitoring

Display:

```text
JURI 1 — ONLINE
JURI 2 — ONLINE
JURI 3 — ONLINE
JURI 4 — ONLINE
JURI 5 — ONLINE
```

Each judge should have:

* Connection status
* Last activity
* Device status
* Current match

---

# 23. Score Event Log

Show:

```text
TIME
JUDGE
CORNER
ACTION
POINT
STATUS
```

Example:

```text
10:23:12
JURI 3
RED
PUKULAN
+1
VERIFIED
```

Operator actions:

```text
VERIFY
REJECT
UNDO
INSPECT
```

---

# 24. Score Display

Route:

```text
/display/[arena]
```

Target:

```text
1920 × 1080
```

Designed for:

* TV
* LED Screen
* HDMI Monitor

Priorities:

```text
Score
Athlete Name
Timer
Round
Corner
```

Use extremely large typography.

---

# 25. OBS Overlay

Route:

```text
/overlay/[arena]
```

Target:

```text
1920 × 1080
```

Must support transparent background.

Show:

```text
RED
BIMA SAKTI
23

BLUE
ADITYA PRATAMA
27

ROUND 2 / 3
01:30
```

Do not obstruct the main match footage.

---

# 26. Responsive Design

Use responsive breakpoints.

Suggested:

```text
sm
md
lg
xl
2xl
```

Do not design desktop-only layouts.

Judge:

```text
Mobile first
```

Operator:

```text
Desktop first
```

Display:

```text
Fixed 16:9
```

---

# 27. Mobile First Rule

All judge interfaces must be designed mobile-first.

Do not simply shrink the desktop dashboard to mobile.

The mobile experience must have its own optimized layout.

---

# 28. Dark Mode

Primary product theme:

```text
Dark
```

Dark mode should be the default.

Avoid pure black backgrounds.

Use:

```text
#0F1115
```

as the primary background.

Use elevated surfaces for hierarchy.

---

# 29. Borders

Use subtle borders:

```text
#30343D
```

Do not outline every element.

Use borders only where they improve grouping or separation.

---

# 30. Border Radius

Use:

```text
8px
12px
16px
20px
```

Use larger radius for major cards.

Avoid excessive pill-shaped components.

---

# 31. Spacing

Use an 8px spacing system.

Primary spacing:

```text
4
8
16
24
32
40
48
64
```

Avoid arbitrary spacing values.

---

# 32. Animation

Animations should communicate state.

Allowed:

* Score update
* Button press
* Match state
* Timer warning
* Connection state
* Page transition

Avoid:

* Excessive animations
* Decorative motion
* Long transitions
* Distracting effects during scoring

Recommended:

```text
150–300ms
```

---

# 33. Accessibility

Required:

* High contrast
* Large touch targets
* Keyboard navigation where applicable
* Visible focus states
* Semantic HTML
* Accessible labels
* Do not rely solely on color

Critical buttons must have accessible labels.

---

# 34. Component Reuse

Before creating a new component:

1. Search existing components.
2. Reuse if possible.
3. Extend if necessary.
4. Create a new component only when justified.

Do not create multiple components with the same purpose.

---

# 35. Tailwind Rules

Use Tailwind utility classes consistently.

Prefer design tokens over arbitrary values.

Prefer:

```text
bg-background
text-foreground
border-border
```

when project tokens are available.

Avoid excessive:

```text
bg-[#123456]
```

unless the color is part of the approved design system.

Do not create random styling per page.

---

# 36. UI States

Every interactive component should consider:

```text
Default
Hover
Focus
Pressed
Disabled
Loading
Success
Error
```

For network-dependent interfaces also consider:

```text
Offline
Syncing
Reconnecting
```

---

# 37. Error Messages

Never expose raw backend errors to users.

Bad:

```text
PrismaClientKnownRequestError
```

Good:

```text
Unable to save the score.

Please try again.
```

Technical details belong in logs, not normal UI.

---

# 38. Loading

Every data-dependent screen must have a loading state.

Use:

* Skeleton
* Spinner
* Progress indicator

Avoid blank screens.

---

# 39. Empty State

Example:

```text
No Upcoming Matches

There are currently no matches assigned to this judge.
```

Provide an appropriate action if possible.

---

# 40. Confirmation

Confirmation is required for:

```text
Delete
Reset Match
End Match
Apply Penalty
Reject Score
Logout
```

Normal scoring does NOT require confirmation.

Scoring must remain fast.

---

# 41. Data Visualization

Charts should only be used when they provide meaningful information.

Operator dashboard may use:

* Match statistics
* Score statistics
* Tournament statistics
* Judge activity

Do not add charts merely for decoration.

---

# 42. Forms

Forms must:

* Have clear labels
* Have validation
* Show errors near the field
* Preserve entered values when possible
* Use appropriate input types
* Avoid unnecessary fields

---

# 43. Tables

Operator tables should support:

* Sorting where useful
* Filtering
* Search
* Pagination where necessary
* Responsive behavior

Mobile users should not be forced to interact with extremely wide tables.

---

# 44. Naming

Use clear domain terminology.

Preferred:

```text
Match
Athlete
Judge
Arena
Tournament
Round
Score
Penalty
Score Event
```

Avoid vague names such as:

```text
Item
Data
Object
Thing
Record
```

---

# 45. Route Naming

Use predictable route naming.

Example:

```text
/login

/dashboard

/tournaments
/tournaments/[id]

/athletes
/athletes/[id]

/matches
/matches/[id]

/arenas
/arenas/[id]

/judges
/judges/[id]

/judge

/judge/matches
/judge/matches/[id]

/judge/scoring/[matchId]

/display/[arenaId]

/overlay/[arenaId]
```

---

# 46. Security UI

Authentication-related screens must not expose sensitive information.

Do not display:

* Passwords
* Access tokens
* Secret keys
* Database credentials

Session state should be represented only through appropriate user information.

---

# 47. Performance

UI must remain lightweight.

Avoid:

* Huge client-side dependencies
* Unnecessary animations
* Excessive re-renders
* Large images without optimization
* Client components when Server Components are sufficient

Use Next.js features appropriately.

Prefer Server Components by default.

Use Client Components only when interaction or browser APIs require them.

---

# 48. Real-Time UI

Real-time updates must be visually predictable.

When score changes:

```text
Judge
↓
Backend
↓
Database / Realtime
↓
Operator
↓
Score Display
↓
OBS Overlay
```

Do not visually simulate a realtime update if the backend has not confirmed it.

Show appropriate states:

```text
Submitting
Synced
Failed
Retrying
```

---

# 49. Judge Offline Behavior

The UI should clearly communicate if the device is offline.

If offline scoring is supported:

```text
Score saved locally
Waiting for synchronization
```

Do not silently pretend the score has been synchronized.

---

# 50. Design Consistency

All platforms must feel like one product.

Mobile:

```text
Fast competition tool
```

Operator:

```text
Tournament control center
```

Display:

```text
Official competition scoreboard
```

OBS:

```text
Professional sports broadcast graphics
```

They may have different layouts but must share:

* Colors
* Typography
* Iconography
* Visual language
* Red / Blue semantics
* Component behavior

---

# 51. Do Not Modify Existing Design Without Reason

When modifying an existing screen:

1. Preserve existing layout where possible.
2. Preserve existing components.
3. Preserve existing tokens.
4. Preserve existing interactions.
5. Change only what is necessary.

Do not redesign an entire page when the request only concerns one component.

---

# 52. AI Agent Rules

When an AI coding/design agent works on this project:

1. Read this DESIGN.md first.
2. Inspect existing components before creating new ones.
3. Reuse the existing design system.
4. Do not invent colors.
5. Do not invent typography.
6. Do not introduce unrelated UI patterns.
7. Do not modify unrelated screens.x
8. Do not remove existing functionality.
9. Keep mobile and desktop behavior intentional.
10. Keep scoring interactions extremely fast.
11. Preserve Red / Blue semantics.
12. Maintain accessibility.
13. Maintain responsive behavior.
14. Do not introduce unnecessary dependencies.

---

# 53. Definition of Done — UI

A UI implementation is complete when:

* [ ] Matches the approved design direction.
* [ ] Uses the design tokens.
* [ ] Uses reusable components.
* [ ] Responsive layout works.
* [ ] Mobile layout works.
* [ ] Loading state exists.
* [ ] Empty state exists where required.
* [ ] Error state exists.
* [ ] Disabled state exists.
* [ ] Accessibility is considered.
* [ ] No console errors.
* [ ] No unnecessary duplicated components.
* [ ] Red / Blue semantics are correct.
* [ ] Critical actions are clearly visible.
* [ ] Existing functionality remains intact.

---

# 54. Final Product Experience

The final product should communicate:

```text
FAST
PRECISE
RELIABLE
REAL-TIME
PROFESSIONAL
```

The Judge interface should feel like a specialized professional scoring device.

The Operator dashboard should feel like a tournament control center.

The Score Display should feel like an official sports scoreboard.

The OBS Overlay should feel like professional sports broadcasting graphics.

All interfaces must feel like parts of the same Digital Pencak Silat Scoring System.
