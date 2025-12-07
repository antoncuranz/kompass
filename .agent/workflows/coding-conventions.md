---
description: app/ codebase conventions and patterns
---

# Jazz Framework Rules
- Always check `$isLoaded` for `MaybeLoaded<T>` types before accessing properties
- Use `$jazz.ensureLoaded({ resolve: {...} })` to load nested data
- Use `loadTransportation(t)` from `@/lib/utils` to resolve transportation discriminated unions
- Use `useTransportation()` hook for already-loaded transportation array
- **Never use `as any`** - load data properly or find the correct type
- **Never use `as Type`** casts - prefer loading data with ensureLoaded

# Type Conventions
- Use `Array<T>` syntax, not `T[]`
- Don't write accommodations or transportations, always use singular
- Use discriminated union checks (`in` operator) instead of type assertions

# Existing Utilities to Reuse
- `@/lib/utils`: `getDepartureDateTime()`, `getArrivalDateTime()`, `getTransportationName()`, `getTransportationShortName()`, `loadTransportation()`, `downloadBlob()`
- `@/components/util`: `formatDateShort()`, `dateFromString()`, `dateToString()`
- `@/components/provider/TripProvider`: `useTrip()`, `useTransportation()`

# UI Patterns
- Use `basecn` components
- Use existing `Button` component variants for consistent styling