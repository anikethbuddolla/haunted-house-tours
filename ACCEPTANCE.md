# Acceptance Criteria

Run both servers (see README.md), then check each criterion.

## 1. On page load, the grid shows every haunted house stored in the database.
How to check: open http://localhost:5173/houses. Compare the cards with `curl http://localhost:3001/api/houses`.
- Pass / Fail:
- Notes:

## 2. Picking "terrifying" in the dropdown shows only terrifying houses.
How to check: on /houses, pick "terrifying" in the Scare level dropdown.
- Pass / Fail:
- Notes:

## 3. Submitting the booking form, then restarting the server, still shows the request saved.
How to check: submit the form on /book. Stop the API (Ctrl+C) and run `npm start` again. Open http://localhost:3001/api/bookings.
- Pass / Fail:
- Notes:

## 4. Submitting with an empty name or email shows an error and saves nothing.
How to check: on /book, leave Name (or Email) empty and click Send Request. Then open http://localhost:3001/api/bookings and confirm no new row.
- Pass / Fail:
- Notes:
