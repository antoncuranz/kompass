# Extended Pricing Implementation Plan

## Overview

Replace simple `price: number` field with a `PricingEntity` that supports:
- Amount paid (cents, no currency)
- Amount remaining (cents)
- Due currency (free-text, only for remaining amount)
- Due date

**Computed total**: `paid + remaining` (only when `dueCurrency` is not set)

---

## Schema Design

### PricingEntity

```typescript
export const PricingEntity = co.map({
  amountPaid: z.number().optional(),
  amountRemaining: z.number().optional(),
  dueCurrency: z.string().optional(),  // free-text, not ISO 4217
  dueDate: z.iso.date().optional(),
})
```

### Affected Entities

Replace `price: z.number().optional()` with `pricing: PricingEntity.optional()` on:
- `ActivityEntity`
- `AccommodationEntity`
- `FlightEntity`
- `TrainEntity`
- `GenericTransportationEntity`

---

## UI Design: Progressive Disclosure

### State 1: Simple price (default)
```
┌─────────────────────────────────────────────────────────────┐
│ Price   [ 150.00 ]                                    [⋮]   │
└─────────────────────────────────────────────────────────────┘
```
- `[⋮]` kebab menu opens dropdown with toggle options
- Stores: `amountPaid=15000, amountRemaining=0`

**Menu options:**
- ○ Add Due Date
- ○ Add Partial Payment

### State 2: With Due Date
```
┌─────────────────────────────────────────────────────────────┐
│ Price   [ 150.00 ]                                    [⋮]   │
│ Due     [ May 15, 2026 ]                                    │
└─────────────────────────────────────────────────────────────┘
```
- Menu shows: ✓ Add Due Date
- Stores: `amountPaid=15000, amountRemaining=0, dueDate=...`

### State 3: With Partial Payment (same currency)
```
┌─────────────────────────────────────────────────────────────┐
│ Price   [ 150.00 ]                                    [⋮]   │
│ Paid    [ 50.00 ]      Remaining: 100.00 [¤]                │
└─────────────────────────────────────────────────────────────┘
```
- `Remaining` is read-only, calculated as `Price - Paid`
- `[¤]` is muted currency icon (always visible, clickable)
- Stores: `amountPaid=5000, amountRemaining=10000`

### State 4: Multi-currency
After clicking `[¤]` and selecting a currency:
```
┌─────────────────────────────────────────────────────────────┐
│ Paid      [ 50.00 ]                                   [⋮]   │
│ Remaining [ 80.00 ]   [USD ▾]                               │
└─────────────────────────────────────────────────────────────┘
```
- `Price` row disappears (no meaningful total with mixed currencies)
- `Remaining` becomes editable
- Clearing currency reverts to State 3
- Stores: `amountPaid=5000, amountRemaining=8000, dueCurrency="USD"`

### State Combinations

States 2 and 3/4 can be combined (Due Date + Partial Payment).

### State Transitions

| Action | Data Transform |
|--------|----------------|
| Toggle Due Date ON | Add `dueDate` |
| Toggle Due Date OFF | Remove `dueDate` |
| Toggle Partial Payment ON | `remaining = paid`, `paid = 0` |
| Toggle Partial Payment OFF | `paid += remaining`, `remaining = 0` |
| Set currency | Add `dueCurrency`, remaining becomes manual |
| Clear currency | Remove `dueCurrency`, recalc `remaining = total - paid` |

---

## Implementation Steps

### Step 1: Schema Changes

#### 1.1 Add PricingEntity to common schema
**File:** `src/repo/common/schema.ts`

Add:
```typescript
export const PricingEntity = co.map({
  amountPaid: z.number().optional(),
  amountRemaining: z.number().optional(),
  dueCurrency: z.string().optional(),
  dueDate: z.iso.date().optional(),
})
```

#### 1.2 Update ActivityEntity
**File:** `src/repo/activity/schema.ts`

- Remove `price: z.number().optional()`
- Add `pricing: PricingEntity.optional()`
- Add migration with unique key:

```typescript
.withMigration(entity => {
  if (!entity.$jazz.has("pricing") && entity.price !== undefined) {
    const group = Group.create()
    group.addMember(entity.$jazz.owner)
    
    const pricing = PricingEntity.create({
      amountPaid: entity.price,
      amountRemaining: 0,
    }, {
      owner: group,
      unique: `pricing_${entity.$jazz.id}`,
    })
    entity.$jazz.set("pricing", pricing)
  }
})
```

- Update `.resolved()` to include pricing

#### 1.3 Update AccommodationEntity
**File:** `src/repo/accommodation/schema.ts`

Same pattern as Activity.

#### 1.4 Update Transportation Entities
**File:** `src/repo/transportation/schema.ts`

Update `FlightEntity`, `TrainEntity`, `GenericTransportationEntity` with same pattern.

---

### Step 2: Domain Types

#### 2.1 Add Pricing type
**File:** `src/domain/common.ts`

```typescript
export const Pricing = z.object({
  amountPaid: z.number().optional(),
  amountRemaining: z.number().optional(),
  dueCurrency: z.string().optional(),
  dueDate: z.iso.date().optional(),
})
export type Pricing = z.infer<typeof Pricing>

export const CreatePricing = Pricing
export type CreatePricing = z.infer<typeof CreatePricing>

export function getPricingTotal(p?: Pricing): number | undefined {
  if (!p) return undefined
  if (p.dueCurrency) return undefined  // No total for multi-currency
  const paid = p.amountPaid ?? 0
  const remaining = p.amountRemaining ?? 0
  return paid + remaining || undefined
}

export function isOverdue(p?: Pricing): boolean {
  if (!p?.dueDate || !p.amountRemaining) return false
  return new Date(p.dueDate) < new Date() && p.amountRemaining > 0
}
```

#### 2.2 Update Activity domain
**File:** `src/domain/activity.ts`

- Remove `price: z.number().optional()`
- Add `pricing: Pricing.optional()`
- Update `CreateActivity` and `UpdateActivity`

#### 2.3 Update Accommodation domain
**File:** `src/domain/accommodation.ts`

Same pattern.

#### 2.4 Update Transportation domain
**File:** `src/domain/transportation.ts`

Update `GenericTransportation` type.

#### 2.5 Update Flight domain
**File:** `src/domain/flight.ts`

Update `Flight` type.

#### 2.6 Update Train domain
**File:** `src/domain/train.ts`

Update `Train` type.

---

### Step 3: Repository Updates

#### 3.1 Update Activity repository
**File:** `src/repo/activity/repository.ts`

Update `create` to handle pricing:
```typescript
const activity = ActivityEntity.create({
  ...values,
  pricing: values.pricing ? (() => {
    const pricingGroup = Group.create()
    pricingGroup.addMember(group)
    return PricingEntity.create(values.pricing, pricingGroup)
  })() : undefined,
}, group)
```

Update `update` to handle pricing changes.

#### 3.2 Update Activity mappers
**File:** `src/repo/activity/mappers.ts`

Map pricing field from entity to domain.

#### 3.3 Update Accommodation repository & mappers
**Files:** `src/repo/accommodation/repository.ts`, `src/repo/accommodation/mappers.ts`

Same pattern.

#### 3.4 Update Transportation repository & mappers
**Files:** `src/repo/transportation/repository.ts`, `src/repo/transportation/mappers.ts`

Same pattern for all three transportation types.

---

### Step 4: Permission Tests

**File:** `src/test/permissions.ts`

#### 4.1 Update collectTripGroups

Add pricing groups for each entity type:
```typescript
// For activities
sharedTrip.trip.activities.forEach((activity, index) => {
  // ... existing code ...
  if (activity.pricing) {
    groups.push({
      name: `activity[${index}].pricing`,
      id: activity.pricing.$jazz.owner.$jazz.id,
    })
  }
})

// Same for accommodation and all transportation types
```

#### 4.2 Update buildAccessMatrix

Add pricing access checks:
```typescript
// Pricing has same access as parent entity
sharedTrip.trip.activities.forEach(activity => {
  // ... existing code ...
  if (activity.pricing) {
    checks.set(activity.pricing, tripAccess)
  }
})

// Same for accommodation (tripAccess) and transportation (transportAccess)
```

---

### Step 5: UI Components

#### 5.1 Create CurrencyCombobox
**File:** `src/components/dialog/input/CurrencyCombobox.tsx`

- Free-text input with suggestions dropdown
- Alphabetically sorted suggestions: `["AUD", "CAD", "CHF", "EUR", "GBP", "JPY", "USD", ...]`
- Props: `value?: string`, `onChange: (currency?: string) => void`

#### 5.2 Create PricingInput
**File:** `src/components/dialog/input/PricingInput.tsx`

Main component managing all 4 states:
- Props: `value?: Pricing`, `onChange: (p?: Pricing) => void`, `disabled?: boolean`
- Internal state: `hasDueDate`, `hasPartialPayment`
- Derived state: `hasCustomCurrency` (from `value?.dueCurrency`)

Sub-components:
- Price row with kebab menu
- Paid + Remaining row (inline)
- Due date row
- Currency combobox (in remaining)

#### 5.3 Update form schemas
**Files:** All dialog files

Update Zod form schema:
```typescript
// Before
price: z.number().optional(),

// After
pricing: Pricing.optional(),
```

#### 5.4 Update ActivityDialog
**File:** `src/components/dialog/ActivityDialog.tsx`

Replace `<AmountInput name="price" />` with `<PricingInput />`.

#### 5.5 Update AccommodationDialog
**File:** `src/components/dialog/AccommodationDialog.tsx`

Same pattern.

#### 5.6 Update FlightDialog
**File:** `src/components/dialog/FlightDialog.tsx`

Same pattern.

#### 5.7 Update TrainDialog
**File:** `src/components/dialog/TrainDialog.tsx`

Same pattern.

#### 5.8 Update TransportationDialog (generic)
**File:** `src/components/dialog/TransportationDialog.tsx`

Same pattern.

---

### Step 6: Cost Display

#### 6.1 Update CostTypes
**File:** `src/components/cost/CostTypes.tsx`

- Update `CostItem` type: replace `price?: number` with `pricing?: Pricing`
- Update `createCostItems` to map pricing
- Update `calculateTotals` to use `getPricingTotal()`
- Add `isOverdue()` helper usage

#### 6.2 Update CostTable
**File:** `src/components/cost/CostTable.tsx`

- Show paid/remaining breakdown where applicable
- Add yellow warning icon + text for overdue items (`isOverdue()` returns true)

---

## Files Summary

| File | Action |
|------|--------|
| `src/repo/common/schema.ts` | Add `PricingEntity` |
| `src/repo/activity/schema.ts` | Replace `price` → `pricing` + migration |
| `src/repo/accommodation/schema.ts` | Replace `price` → `pricing` + migration |
| `src/repo/transportation/schema.ts` | Replace `price` → `pricing` on 3 entities + migrations |
| `src/domain/common.ts` | Add `Pricing` type + helpers |
| `src/domain/activity.ts` | Replace `price` → `pricing` |
| `src/domain/accommodation.ts` | Replace `price` → `pricing` |
| `src/domain/transportation.ts` | Replace `price` → `pricing` |
| `src/domain/flight.ts` | Replace `price` → `pricing` |
| `src/domain/train.ts` | Replace `price` → `pricing` |
| `src/repo/activity/repository.ts` | Handle pricing create/update |
| `src/repo/activity/mappers.ts` | Map pricing |
| `src/repo/accommodation/repository.ts` | Handle pricing create/update |
| `src/repo/accommodation/mappers.ts` | Map pricing |
| `src/repo/transportation/repository.ts` | Handle pricing create/update |
| `src/repo/transportation/mappers.ts` | Map pricing |
| `src/test/permissions.ts` | Add pricing to group/access checks |
| `src/components/dialog/input/PricingInput.tsx` | **New** |
| `src/components/dialog/input/CurrencyCombobox.tsx` | **New** |
| `src/components/dialog/ActivityDialog.tsx` | Use `PricingInput` |
| `src/components/dialog/AccommodationDialog.tsx` | Use `PricingInput` |
| `src/components/dialog/FlightDialog.tsx` | Use `PricingInput` |
| `src/components/dialog/TrainDialog.tsx` | Use `PricingInput` |
| `src/components/dialog/TransportationDialog.tsx` | Use `PricingInput` |
| `src/components/cost/CostTypes.tsx` | Update for pricing model |
| `src/components/cost/CostTable.tsx` | Show paid/remaining, overdue indicator |

---

## Verification

After implementation:
1. Run `npm run lint` - no errors
2. Run `npm run build` - successful build
3. Run repository tests - all pass, including permission checks
4. Manual testing of all 4 UI states in dialogs
5. Verify cost table displays correctly with various pricing configurations
