# Extended Pricing Implementation Progress

## Status: Implementation Complete ✅

### Completed Steps

#### ✅ Step 1: Schema Changes
- Added `PricingEntity` to `src/repo/common/schema.ts`
- Updated `ActivityEntity` to use `pricing: PricingEntity.optional()` instead of `price`
- Updated `AccommodationEntity` to use `pricing: PricingEntity.optional()` instead of `price`
- Updated `FlightEntity`, `TrainEntity`, and `GenericTransportationEntity` to use `pricing: PricingEntity.optional()` instead of `price`
- All entities now include `pricing` in their `.resolved()` queries

#### ✅ Step 2: Domain Types
- Added `Pricing` type, `CreatePricing` type to `src/domain/common.ts`
- Added `getPricingTotal(p?: Pricing): number | undefined` helper function
- Added `isOverdue(p?: Pricing): boolean` helper function
- Updated all domain types (Activity, Accommodation, Flight, Train, GenericTransportation) to use `pricing: Pricing.optional()` instead of `price: z.number().optional()`

#### ✅ Step 3: Repository Updates
- Added `mapPricing()` function to `src/repo/common/mappers.ts`
- Updated all mappers (Activity, Accommodation, Flight, Train, GenericTransportation) to map pricing using `mapPricing(entity.pricing)`
- Repositories now properly handle pricing field via spread operators and the new mapping function

#### ✅ Step 4: Permission Tests
- Updated `src/test/trip-loader.ts` to include pricing in resolve queries:
  - Added `PricingEntity.resolveQuery` to `flightResolveQuery`
  - Created new `trainResolveQuery` with pricing
  - Created new `genericTransportResolveQuery` with pricing
  - Updated `sharedTripResolveQuery` to include pricing for activities and accommodation
- Updated `src/test/permissions.ts`:
  - Added pricing access checks for all entity types (activities, accommodation, flights, trains, generic transportation) in `buildAccessMatrix()`
  - Updated train case to use `trainResolveQuery` and check `train.pricing`
  - Updated generic case to use `genericTransportResolveQuery` and check `generic.pricing`
  - Updated flight case to check `flight.pricing`
  - Added pricing groups to `collectTripGroups()` for all entity types
- ✅ `bun typecheck` passes
- ✅ `bun lint` passes

#### ✅ Step 5: UI Components
- Created `CurrencyCombobox.tsx` component with free-text input and alphabetically sorted currency suggestions
- Created `PricingInput.tsx` component with full progressive disclosure UI:
  - State 1: Simple price with kebab menu
  - State 2: With due date
  - State 3: Partial payment (paid + remaining, same currency)
  - State 4: Multi-currency (paid + remaining with different currency)
- Updated all 5 dialog components to use `PricingInput` and `Pricing` schema:
  - `ActivityDialog.tsx` - replaced AmountInput with PricingInput
  - `AccommodationDialog.tsx` - replaced AmountInput with PricingInput
  - `FlightDialog.tsx` - replaced AmountInput with PricingInput
  - `TrainDialog.tsx` - replaced AmountInput with PricingInput
  - `TransportationDialog.tsx` - replaced AmountInput with PricingInput
- Removed temporary compatibility layer (simple price inputs)

#### ✅ Step 6: Cost Display Enhancements
- `CostTypes.tsx` already using `isOverdue()` helper
- Updated `CostTable.tsx` to:
  - Show paid/remaining breakdown for items with partial payments (same currency)
  - Display multi-currency remaining amounts with currency code
  - Add yellow alert icon and text for overdue items
  - Increased price column width to accommodate breakdown display

### Verification Status
- ✅ `bun typecheck` passes (all steps)
- ✅ `bun lint` passes (all steps)
- ✅ All 10 tasks completed successfully

### File Changes Summary

**Modified Files:**
- `src/repo/common/schema.ts` - Added PricingEntity
- `src/repo/common/mappers.ts` - Added mapPricing function
- `src/repo/activity/schema.ts` - Replaced price with pricing
- `src/repo/activity/mappers.ts` - Map pricing field
- `src/repo/accommodation/schema.ts` - Replaced price with pricing
- `src/repo/accommodation/mappers.ts` - Map pricing field
- `src/repo/transportation/schema.ts` - Replaced price with pricing on all 3 types
- `src/repo/transportation/mappers.ts` - Map pricing field for all types
- `src/domain/common.ts` - Added Pricing type + helpers
- `src/domain/activity.ts` - Use pricing type
- `src/domain/accommodation.ts` - Use pricing type
- `src/domain/flight.ts` - Use pricing type
- `src/domain/train.ts` - Use pricing type
- `src/domain/transportation.ts` - Use pricing type
- `src/components/cost/CostTypes.tsx` - Use Pricing type and getPricingTotal()
- `src/components/cost/CostTable.tsx` - Display pricing with breakdown and overdue indicators
- `src/components/dialog/ActivityDialog.tsx` - Use PricingInput and Pricing schema
- `src/components/dialog/AccommodationDialog.tsx` - Use PricingInput and Pricing schema
- `src/components/dialog/FlightDialog.tsx` - Use PricingInput and Pricing schema
- `src/components/dialog/TrainDialog.tsx` - Use PricingInput and Pricing schema
- `src/components/dialog/TransportationDialog.tsx` - Use PricingInput and Pricing schema
- `src/test/trip-loader.ts` - Added pricing to resolve queries
- `src/test/permissions.ts` - Updated for pricing with access checks and group collection

**New Files:**
- `src/components/dialog/input/CurrencyCombobox.tsx` - Currency selection with suggestions
- `src/components/dialog/input/PricingInput.tsx` - Progressive disclosure pricing input

### Notes
- No migration code added yet (schema changes are backward compatible due to optional fields)
- Repository create/update methods automatically handle nested pricing entities via Jazz framework
- All type errors resolved by using `getPricingTotal()` as compatibility layer
- The implementation follows a pragmatic approach: get core changes working first, then enhance UI progressively
- Fixed: Price in simple mode now correctly saves with `amountRemaining: 0` instead of `undefined`
- Fixed: Dropdown menu z-index increased from `z-50` to `z-[100]` to appear above dialog modals
