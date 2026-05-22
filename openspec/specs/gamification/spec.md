# Gamification Specification v2 — Comprehensive Redesign

## Purpose

Make financial discipline addictive. Every action in the app feeds the gamification engine: logging transactions, rejecting impulse purchases, staying under budget, building streaks, and progressing toward goals. The system is inspired by Duolingo (streaks, daily goals), Habitica (XP/leveling), and Long Game (savings rewards).

## Core Principles

1. **Every meaningful action earns XP** — not just wishlist rejections
2. **Streak = engagement anchor** — daily login/transaction logging maintains a fire streak
3. **Status is earned, not auto-calculated** — milestones tied to real financial behavior
4. **Achievements are tiered** — Bronze → Silver → Gold → Platinum for each category
5. **Visual feedback everywhere** — XP bar, streak counter, level-up celebration, achievement toast
6. **Frontend syncs from backend** — single source of truth, no client-side XP math

---

## 1. XP Economy

### XP Sources (per action)

| Action | Base XP | Notes |
|--------|---------|-------|
| Log transaction | 5 | Any transaction (income or expense) |
| Reject wishlist item | 25 + price/1000 | Bonus proportional to amount saved |
| Purchase wishlist item | 5 | Small — still an action |
| Stay under budget (end of month) | 30 per budget | Checked monthly |
| Add goal | 5 | |
| Contribute to goal | 10 | |
| Complete goal | 50 | Big reward |
| Daily streak milestone (7/14/30/60/90/180/365) | 50/100/200/400/800/1500/3000 | Exponential growth |
| Set hourly rate | 10 | First time only |
| Create first budget | 15 | One-time |
| Create first wishlist item | 10 | One-time |

### Streak Multiplier

- 0-day streak (no active streak): 1.0x
- 1-6 day streak: 1.0x
- 7-13 day streak: 1.5x
- 14-29 day streak: 2.0x
- 30-59 day streak: 2.5x
- 60+ day streak: 3.0x

A "day" counts if the user logs at least 1 transaction OR makes 1 gamification action (reject, goal contribution, etc.). Streak resets to 0 if no action for 36 hours.

### Level Formula

```
level = floor(sqrt(xp / 100)) + 1
xpForLevel(n) = (n-1)^2 * 100
```

Levels 1-6 map to statuses. After level 6, levels continue infinitely (status stays FINANCIAL_ARCHITECT).

### Status Mapping

| Level Range | Status | Description |
|-------------|--------|-------------|
| 1 | CONSUMER_DRONE | Default. Just started. |
| 2 | AWAKENED | Logging transactions, set hourly rate |
| 3-4 | ASCETIC | Regular tracking, wishlist discipline |
| 5-7 | STRATEGIST | Budgets under control, goals progressing |
| 8-12 | CAPITALIST | Significant savings, long streaks |
| 13+ | FINANCIAL_ARCHITECT | Mastery — long-term financial health |

---

## 2. Streak System

### Daily Streak

- **Tracked in `UserGamification.currentStreak` and `longestStreak`**
- Each day the user performs at least 1 tracked action → streak increments
- **Grace window**: 36 hours from last action before streak breaks
- **Streak freeze**: User can keep streak alive once per 7 days even without action (auto-consumed)
- On streak break: reset `currentStreak` to 0, notify user

### Tracked Actions for Streak

- Log a transaction
- Reject/purchase wishlist item
- Contribute to a goal
- Add a budget

### Streak Display

- Fire icon + number on Home screen (top-right of RPG card)
- Color: gray (0), orange (1-6), amber (7-13), gold (14-29), diamond-blue (30+)
- Calendar view in profile showing last 30 days (filled circles for active days)

---

## 3. Achievement System

### Achievement Categories

Each category has 4 tiers: Bronze, Silver, Gold, Platinum.

#### Category: Streak Master
| Tier | Condition | XP Reward |
|------|-----------|-----------|
| Bronze | 7-day streak | 50 |
| Silver | 30-day streak | 200 |
| Gold | 90-day streak | 500 |
| Platinum | 365-day streak | 2000 |

#### Category: Wishlist Warrior
| Tier | Condition | XP Reward |
|------|-----------|-----------|
| Bronze | Reject 3 items | 30 |
| Silver | Reject 10 items | 100 |
| Gold | Reject 25 items | 300 |
| Platinum | Reject 50 items | 800 |

#### Category: Budget Guardian
| Tier | Condition | XP Reward |
|------|-----------|-----------|
| Bronze | Stay under budget 1 month | 40 |
| Silver | Stay under budget 3 consecutive months | 150 |
| Gold | Stay under budget 6 consecutive months | 400 |
| Platinum | Stay under budget 12 consecutive months | 1000 |

#### Category: Tracker
| Tier | Condition | XP Reward |
|------|-----------|-----------|
| Bronze | Log 50 transactions | 25 |
| Silver | Log 200 transactions | 100 |
| Gold | Log 500 transactions | 250 |
| Platinum | Log 1000 transactions | 600 |

#### Category: Goal Crusher
| Tier | Condition | XP Reward |
|------|-----------|-----------|
| Bronze | Complete 1 goal | 50 |
| Silver | Complete 3 goals | 150 |
| Gold | Complete 5 goals | 400 |
| Platinum | Complete 10 goals | 1000 |

#### Category: Conscious Spender
| Tier | Condition | XP Reward |
|------|-----------|-----------|
| Bronze | Save 10,000 RUB via rejections | 30 |
| Silver | Save 50,000 RUB via rejections | 100 |
| Gold | Save 200,000 RUB via rejections | 300 |
| Platinum | Save 500,000 RUB via rejections | 800 |

#### Category: Night Owl / Early Bird
| Tier | Condition | XP Reward |
|------|-----------|-----------|
| Bronze | Use app 7 different days | 20 |
| Silver | Use app 30 different days | 80 |
| Gold | Use app 100 different days | 200 |
| Platinum | Use app 365 different days | 500 |

### Achievement Logic

- **Checked after every gamification-relevant action** (transaction, wishlist decision, goal progress, budget check)
- **Auto-awarded**: no manual claim — achievement triggers immediately when condition met
- **XP from achievements IS affected by streak multiplier**
- **Notification**: ACHIEVEMENT_EARNED notification with achievement name and XP
- **Toast on mobile**: "Achievement unlocked! {name} +{xp} XP"

---

## 4. Level-Up System

### Level-Up Trigger

- After every XP addition, check if `sqrt(newXp / 100) + 1 > currentLevel`
- If level up:
  1. Update `UserGamification.level` and `status` (if status tier changes)
  2. Create LEVEL_UP notification
  3. Return `levelUp: true` in API response for the triggering action

### Level-Up Celebration (Frontend)

- Full-screen overlay with:
  - New level number (large, animated)
  - New status name
  - XP progress bar reset animation
  - "Continue" button
- Auto-dismiss after 5 seconds if user doesn't interact

---

## 5. API Design

### GET /gamification/profile

Returns the full gamification state:
```json
{
  "level": 3,
  "xp": 450,
  "status": "ASCETIC",
  "statusLabel": "Аскет",
  "currentStreak": 14,
  "longestStreak": 14,
  "streakMultiplier": 2.0,
  "savedAmountRub": 15000,
  "nextLevelXp": 900,
  "currentLevelXp": 400,
  "progressToNext": 8.33,
  "xpToday": 15,
  "achievements": {
    "total": 24,
    "earned": 3,
    "recent": [
      { "code": "wishlist_warrior_bronze", "name": "...", "tier": "BRONZE", "earnedAt": "..." }
    ]
  },
  "stats": {
    "totalTransactions": 45,
    "totalRejected": 5,
    "totalPurchased": 2,
    "totalGoalsCompleted": 0,
    "budgetsUnderLimit": 2
  }
}
```

### GET /gamification/achievements

Returns all achievements with user's progress:
```json
{
  "categories": [
    {
      "code": "streak_master",
      "name": "Streak Master",
      "tiers": [
        { "tier": "BRONZE", "name": "7-Day Streak", "condition": "Reach 7-day streak", "xpReward": 50, "earned": true, "earnedAt": "2026-04-20", "progress": 7, "target": 7 },
        { "tier": "SILVER", "name": "30-Day Streak", "condition": "Reach 30-day streak", "xpReward": 200, "earned": false, "earnedAt": null, "progress": 14, "target": 30 }
      ]
    }
  ]
}
```

### POST /gamification/action (internal)

Called by other services to record a gamification action:
```json
{
  "action": "TRANSACTION_CREATED",
  "metadata": { "categoryId": "...", "amount": 500000 }
}
```

Response includes:
```json
{
  "xpEarned": 5,
  "totalXp": 455,
  "level": 3,
  "levelUp": false,
  "achievementsUnlocked": [],
  "streakUpdated": true,
  "currentStreak": 14
}
```

### GET /gamification/streak-calendar?month=2026-04

Returns daily activity for streak visualization:
```json
{
  "streak": 14,
  "days": {
    "2026-04-01": true,
    "2026-04-02": true,
    "2026-04-03": false,
    ...
  }
}
```

---

## 6. Database Changes

### UserGamification — add fields

```
model UserGamification {
  // ... existing fields ...
  currentStreak    Int      @default(0)
  longestStreak    Int      @default(0)
  lastActionAt     DateTime?
  streakFreezeUsed Boolean  @default(false)  // consumed this week?
  totalTransactions Int     @default(0)
  totalRejected     Int     @default(0)
  totalPurchased    Int     @default(0)
  totalGoalsCompleted Int   @default(0)
  consecutiveBudgetMonths Int @default(0)
}
```

### New model: XpEvent (audit trail)

```
model XpEvent {
  id          String   @id @default(uuid())
  userId      String
  action      String   // TRANSACTION_CREATED, WISHLIST_REJECTED, etc.
  baseXp      Int
  multiplier  Float    @default(1.0)
  totalXp     Int
  metadata    Json?
  createdAt   DateTime @default(now())

  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, createdAt])
  @@map("xp_events")
}
```

### New model: StreakDay

```
model StreakDay {
  id          String   @id @default(uuid())
  userId      String
  date        String   // YYYY-MM-DD
  actionCount Int      @default(0)
  createdAt   DateTime @default(now())

  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, date])
  @@map("streak_days")
}
```

---

## 7. Achievement Seed Data

7 categories x 4 tiers = 28 achievements total. Seeded via Prisma seed script.

Codes follow pattern: `{category}_{tier}` — e.g., `streak_master_bronze`, `streak_master_silver`, etc.

Categories:
1. `streak_master` — streak milestones
2. `wishlist_warrior` — wishlist rejections
3. `budget_guardian` — budgets under limit
4. `tracker` — transaction logging
5. `goal_crusher` — goal completion
6. `conscious_spender` — money saved via rejections
7. `night_owl` — app usage days

---

## 8. Frontend Integration

### Data Flow

1. `fetchGamification()` calls `GET /gamification/profile` — populates full gamification state
2. `initializeData()` calls `fetchGamification()`
3. Every action (transaction, wishlist, goal) → backend returns XP info → frontend updates state
4. XP bar on Home + Profile always reflects backend truth

### Home Screen — RPG Card Enhancement

- Level number in avatar circle
- Status label
- XP progress bar (current level XP → next level XP)
- **Streak fire icon** with count (top-right of card)
- Streak multiplier badge (if > 1.0x)

### Home Screen — Streak Widget (below RPG card)

- Last 7 days: row of circles (filled = active, empty = missed)
- Current streak count + fire icon
- "Keep it going!" or motivational message

### Profile Screen — Enhanced

- Hero card: avatar + level + status + XP bar (unchanged)
- **Streak section**: current streak, longest streak, 30-day calendar
- **Stats section**: rejections, saved amount, goals completed (enhanced)
- **Achievements section**: horizontal scroll of recent achievements → tap opens full gallery
- Roadmap: unchanged (status ladder)

### Achievement Gallery Screen (new: /main/achievements)

- Tabs: All | Earned | Locked
- Grid of achievement cards (2 columns)
- Each card: icon, name, tier badge, progress bar, XP reward
- Earned cards: colored, with earned date
- Locked cards: grayed out, with progress indicator

### XP Toast (enhanced)

After any action that earns XP:
- Small toast at bottom: "+5 XP" (with streak multiplier if applicable)
- If achievement unlocked: "+50 XP — Streak Master: Bronze!"
- If level up: full-screen celebration overlay

### Level-Up Celebration (new component)

- Triggered when `levelUp: true` in API response
- Full-screen modal with dark overlay
- Large level number animation (scale from 0 → 1)
- Status name + "Level X" label
- XP bar fills from 0%
- "Continue" button
- Auto-dismiss after 5s

---

## 9. Gamification Action Types (enum)

```
TRANSACTION_CREATED
TRANSACTION_DELETED (no XP, just tracking)
WISHLIST_CREATED
WISHLIST_REJECTED
WISHLIST_PURCHASED
GOAL_CREATED
GOAL_CONTRIBUTED
GOAL_COMPLETED
BUDGET_CREATED
BUDGET_UNDER_LIMIT (monthly check)
HOURLY_RATE_SET (one-time)
```

---

## 10. Integration Points

### TransactionsService.create()
→ Call `gamification.recordAction(userId, 'TRANSACTION_CREATED', metadata)`
→ Return XP info in response

### WishlistService.reject()
→ Call `gamification.recordAction(userId, 'WISHLIST_REJECTED', { amount })`
→ Return XP info in response

### WishlistService.purchase()
→ Call `gamification.recordAction(userId, 'WISHLIST_PURCHASED', {})`

### GoalsService.addProgress() — when goal completes
→ Call `gamification.recordAction(userId, 'GOAL_COMPLETED', {})`

### GoalsService.create()
→ Call `gamification.recordAction(userId, 'GOAL_CREATED', {})`

### BudgetService — monthly cron
→ For each user, check budgets under limit
→ Call `gamification.recordAction(userId, 'BUDGET_UNDER_LIMIT', {})`

### UsersService.setHourlyRate()
→ Call `gamification.recordAction(userId, 'HOURLY_RATE_SET', {})`

---

## 11. Requirements (GIVEN/WHEN/THEN)

### Requirement: XP for all actions
- GIVEN a user creates a transaction
- WHEN the transaction is saved
- THEN award 5 XP (base) * streak multiplier
- AND record an XpEvent
- AND check achievements

### Requirement: Streak tracking
- GIVEN a user performs any tracked action
- WHEN the action is recorded
- THEN increment StreakDay.actionCount for today
- AND update UserGamification.lastActionAt
- AND if first action today and last action was yesterday, increment currentStreak
- AND if last action was >36h ago, reset currentStreak to 0 then set to 1

### Requirement: Streak freeze
- GIVEN a user has a streak >= 3
- WHEN a day passes with no action AND streak freeze is available (not used in last 7 days)
- THEN consume the freeze, keep streak alive
- AND set streakFreezeUsed = true

### Requirement: Achievement checking
- GIVEN a gamification action is recorded
- WHEN the action updates a counter (transactions, rejections, etc.)
- THEN check all achievement conditions for the relevant category
- AND if a threshold is met, create UserAchievement and award bonus XP

### Requirement: Level-up
- GIVEN XP is added to a user
- WHEN the new XP total crosses a level boundary
- THEN update the level
- AND if the new level maps to a new status, update the status
- AND return levelUp flag in the response

### Requirement: Budget month check (cron)
- GIVEN a new month begins
- WHEN the monthly cron runs
- THEN for each user with budgets, check if they stayed under all budgets
- AND if yes, award BUDGET_UNDER_LIMIT XP and check achievements

### Requirement: Gamification profile sync
- GIVEN the mobile app initializes
- WHEN fetchGamification() is called
- THEN call GET /gamification/profile
- AND populate the full gamification state (level, xp, streak, achievements, stats)

### Requirement: Achievement gallery
- GIVEN a user navigates to achievements
- WHEN the screen loads
- THEN display all 28 achievements grouped by category
- AND show progress toward each tier
- AND highlight earned achievements
