# API Contract

Base URL: `http://localhost:3001` (the React dev server proxies `/api` here).
All requests and responses use JSON.

## GET /api/houses
Returns every haunted house.

Optional query: `?scare=mild|spooky|terrifying` returns only houses with that scare level.

**200** response: an array of houses.
```json
[
  { "id": 5, "name": "Ravencrest Asylum", "scare": "terrifying", "description": "..." }
]
```
**400** `{ "error": "..." }` if `scare` is not one of the three levels.

## POST /api/bookings
Saves a tour booking request.

Request body:
```json
{ "name": "Sam", "email": "sam@example.com", "message": "Two people", "scare": "spooky" }
```
- `name` and `email` are required (empty or whitespace-only is rejected).
- `message` is optional (defaults to `""`).
- `scare` is optional; anything other than mild/spooky/terrifying becomes `"mild"`.

**201** response: the saved row.
```json
{ "id": 1, "name": "Sam", "email": "sam@example.com", "message": "Two people", "scare": "spooky", "created_at": "2026-10-13 18:00:00" }
```
**400** response if name or email is empty:
```json
{ "error": "Name and email are required." }
```

## GET /api/bookings
Returns all saved bookings, oldest first.

**200** response: an array of booking rows (same shape as the POST 201 response).
