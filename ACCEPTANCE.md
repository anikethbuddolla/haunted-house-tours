# Acceptance Criteria (Capstone)

Run both servers (see README.md), then check each criterion.

## 1. Opening a house shows its slots with spots left.
How to check: on /houses, click "View tour times" on any house. Each tour time should show "N spots left" (or "Full").
- Pass / Fail:
- Notes:

## 2. A valid booking (name, email, party size) drops spots left by that amount and persists after a refresh and a server restart.
How to check: pick a slot, fill in name, email and party size, and click Book. Spots left drops by the party size with no page reload. Refresh the page, then stop the API (Ctrl+C), run `npm start` again, and refresh once more.
- Pass / Fail:
- Notes:

## 3. Booking more spots than are left shows "Not enough spots left" and saves nothing.
How to check: enter a party size bigger than the slot's spots left and click Book. Then open http://localhost:3001/api/bookings and confirm no new row.
- Pass / Fail:
- Notes:

## 4. An empty name or email shows an error and saves nothing.
How to check: leave Name (or Email) empty and click Book. Then open http://localhost:3001/api/bookings and confirm no new row.
- Pass / Fail:
- Notes:

## 5. A slot with 0 spots left shows "Full" and its book button is disabled.
How to check: book a slot until spots left reaches 0 (for example, a party equal to the slot's spots left). The slot shows "Full", its button is greyed out, and it can't be picked in the Tour time dropdown.
- Pass / Fail:
- Notes:
