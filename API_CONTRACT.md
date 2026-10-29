# API Contract

Base URL: `http://localhost:3001` (the React dev server proxies `/api` here).
All requests and responses for the four routes below use JSON. Errors use the shape `{ "error": "..." }`.

Errors that can happen on any of these routes:
- **400** `{ "error": "Request body must be valid JSON." }`: the request body is not valid JSON.
- **500** `{ "error": "Something went wrong on the server." }`: an unexpected server error.

Paths not listed here (for example `/api/nope`) are not part of the API and get Express's default HTML 404 page.

## Data model
- **houses**: `id, name, scare, description`
- **tour_slots**: `id, house_id → houses.id, start_time (TEXT "YYYY-MM-DD HH:MM"), capacity`
- **bookings**: `id, slot_id → tour_slots.id, name, email, party_size, created_at`

`spots_left` for a slot = `capacity - SUM(party_size of its bookings)`. It is calculated on every request, never stored.

## GET /api/houses
Returns every haunted house.

Optional query: `?scare=mild|spooky|terrifying` returns only houses with that scare level.

**200**
```json
[
  { "id": 5, "name": "Ravencrest Asylum", "scare": "terrifying", "description": "..." }
]
```
**400** `{ "error": "scare must be mild, spooky, or terrifying" }` if `scare` is not one of the three levels.

## GET /api/houses/:id/slots
Returns one house's tour slots, earliest first, with spots left.

**200**
```json
[
  { "id": 1, "house_id": 1, "start_time": "2026-10-31 19:00", "capacity": 4, "spots_left": 4 }
]
```
**404** `{ "error": "House not found" }` if no house has that id.

## POST /api/bookings
Books `party_size` spots in one tour slot.

Request body:
```json
{ "slot_id": 1, "name": "Sam", "email": "sam@example.com", "party_size": 2 }
```

Checks, in this order (the first one that fails decides the response):
1. **400** `{ "error": "Name and email are required." }`: `name` or `email` is missing, empty, or only spaces.
2. **400** `{ "error": "Party size must be a whole number of at least 1." }`: `party_size` is not a JSON whole number of at least 1 (`0`, `2.5` and `"2"` are all rejected).
3. **404** `{ "error": "Slot not found" }`: no slot has that `slot_id` (or `slot_id` is not a whole number).
4. **409** `{ "error": "Not enough spots left" }`: `party_size` is more than the slot's current `spots_left`.

Steps 3 and 4 and the insert run in one database transaction, so two bookings at the same moment cannot overbook a slot. When any check fails, nothing is saved.

**201**: the saved booking row plus the slot's new `spots_left`.
```json
{ "id": 1, "slot_id": 1, "name": "Sam", "email": "sam@example.com", "party_size": 2, "created_at": "2026-10-28 18:00:00", "spots_left": 2 }
```

## GET /api/bookings
Returns all saved bookings, oldest first.

**200**: an array of booking rows: `{ id, slot_id, name, email, party_size, created_at }` (no `spots_left`).
