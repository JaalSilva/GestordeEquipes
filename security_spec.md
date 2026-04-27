# Security Specification - Mante-Salão

## 1. Data Invariants
- A designation must have an `areaId` matching one of the predefined areas.
- `volunteers` array must not exceed 15 members.
- Only authenticated users can read/write designations.
- `updatedAt` must be a server timestamp.

## 2. The "Dirty Dozen" Payloads
1. **Unauthenticated Read**: Attempting to read `designations/predial` without login.
2. **Unauthenticated Write**: Attempting to write to `designations/predial` without login.
3. **Invalid ID**: Writing to `designations/invalid_area_id`.
4. **Volunteer Overflow**: Writing a `volunteers` array with 16 names.
5. **Type Poisoning**: Writing `keyMan` as a number instead of a string.
6. **Shadow Field**: Adding `isAdmin: true` to the designation document.
7. **Identity Spoofing**: Trying to set `updatedAt` to a past date instead of server time.
8. **Malicious ID**: Using a document ID with 2KB of junk characters.
9. **Relational Break**: Creating a designation for an area that doesn't exist in our logic (hardcoded in rules for this demo).
10. **Array Injection**: Sending a non-string object inside the `volunteers` array.
11. **Size Abuse**: Sending a 1MB string as a volunteer name.
12. **State Skip**: Updating `updatedAt` without changing anything else.

## 3. Test Runner (Mockup for Audit)
- `PERMISSION_DENIED` on all above.
