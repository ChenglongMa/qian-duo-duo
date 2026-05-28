# Frontend UX Checklist

Use this checklist for web app changes.

## Stack

- Vue 3 + Vite + TypeScript.
- Vue Router for route-level navigation.
- Pinia or documented equivalent for app state.
- Dexie for IndexedDB when offline sync is introduced.
- Typed API client uses shared response types.

## Usability

- Common workflows are efficient for repeated household bookkeeping.
- Offline state is visible when offline features exist.
- Conflict UI explains local and server differences.
- Destructive buttons communicate the destructive action clearly.
- Empty states are specific and useful.

## Accessibility

- Inputs have labels.
- Form errors are associated with fields.
- Critical flows support keyboard navigation.
- Focus states are visible.
- Contrast is suitable for normal use.
- No critical action is pointer-only.
- No keyboard traps.

## Forms

- Client validation reuses shared schemas or schema-derived validators where practical.
- User-readable errors are shown.
- Raw unsafe server errors are not displayed.
- Date-only entry behavior resolves to 12:00 local time.
- Amount input rejects exponent notation and invalid characters.

## Testing

- Component tests cover important rendering and validation.
- State transitions are tested.
- Accessibility-relevant behavior is tested where practical.
- E2E covers critical flows from Milestone 2 onward.

