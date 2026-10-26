# API Contract

Base URL: `http://localhost:3001` (the React dev server proxies `/api` here).
All requests and responses use JSON. Errors use the shape `{ "error": "..." }`.

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
**Status: not implemented yet.** It currently always returns:

**501** `{ "message": "not implemented yet" }`

Planned behavior (next session):

Request body:
```json
{ "slot_id": 1, "name": "Sam", "email": "sam@example.com", "party_size": 2 }
```
- **201**: the saved booking row.
  ```json
  { "id": 1, "slot_id": 1, "name": "Sam", "email": "sam@example.com", "party_size": 2, "created_at": "2026-10-25 18:00:00" }
  ```
- **400** `{ "error": "..." }`: name or email empty, or party_size is not a whole number of at least 1.
- **404** `{ "error": "Slot not found" }`: no slot has that `slot_id`.
- **409** `{ "error": "Not enough spots left" }`: `party_size` is more than the slot's `spots_left`. Nothing is saved.

## GET /api/bookings
Returns all saved bookings, oldest first.

**200**: an array of booking rows (same shape as the planned POST 201 response).
