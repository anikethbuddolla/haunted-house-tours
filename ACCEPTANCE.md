# Acceptance Criteria (Capstone)

Run both servers (see README.md), then check each criterion.

Results below are from the capstone C3 audit on 2026-10-28. Claude Code ran these checks: `npm run check` in `server/` (9 passed, 0 failed) and the UI in the in-app browser on Blackwood Manor (`/houses/3`). All test bookings were deleted afterwards.

## 1. Opening a house shows its slots with spots left.
How to check: on /houses, click "View tour times" on any house. Each tour time should show "N spots left" (or "Full").
- Pass / Fail: **Pass**
- Notes: Clicking "View tour times" on Blackwood Manor opened `/houses/3` with no page reload. It showed 3 slots: "Sat, Oct 31, 7:00 PM | 10 spots left", "9:00 PM | 4 spots left", "11:00 PM | 5 spots left". `npm run check` also passed "GET /api/houses/1/slots returns slots with spots_left" (status 200, #1 4/4, #2 5/5, #3 6/6).

## 2. A valid booking (name, email, party size) drops spots left by that amount and persists after a refresh and a server restart.
How to check: pick a slot, fill in name, email and party size, and click Book. Spots left drops by the party size with no page reload. Refresh the page, then stop the API (Ctrl+C), run `npm start` again, and refresh once more.
- Pass / Fail: **Pass**
- Notes: In the UI, a party of 3 on the 9:00 PM slot showed "Booked! 3 spots for UI Check on Sat, Oct 31, 9:00 PM.", cleared the form, and dropped the slot from 4 to 1 spot left with no page reload. After a second booking of 1 (criterion 5), the API was stopped (confirmed down) and started again, and the page was reloaded. The 9:00 PM slot still showed "Full", so both bookings (3 + 1 = all 4 spots) were still saved, and the other slots were unchanged (10 and 5 left). `npm run check`: status 201, party_size 2, spots_left 4 -> 2 (the response also said 2), bookings 0 -> 1.

## 3. Booking more spots than are left shows "Not enough spots left" and saves nothing.
How to check: enter a party size bigger than the slot's spots left and click Book. Then open http://localhost:3001/api/bookings and confirm no new row.
- Pass / Fail: **Pass**
- Notes: In the UI, a party of 5 with 4 left showed "Not enough spots left", the bookings count was unchanged (+0), and the slot still showed 4 spots left. `npm run check`: party_size 3 with 2 left gave status 409, `{"error":"Not enough spots left"}`, bookings 1 -> 1.

## 4. An empty name or email shows an error and saves nothing.
How to check: leave Name (or Email) empty and click Book. Then open http://localhost:3001/api/bookings and confirm no new row.
- Pass / Fail: **Pass**
- Notes: In the UI, an empty name and then an empty email each showed "Name and email are required." and saved 0 rows. `npm run check`: both gave status 400 with bookings 1 -> 1.

## 5. A slot with 0 spots left shows "Full" and its book button is disabled.
How to check: book a slot until spots left reaches 0 (for example, a party equal to the slot's spots left). The slot shows "Full", its button is greyed out, and it can't be picked in the Tour time dropdown.
- Pass / Fail: **Pass**
- Notes: Booking the last spot on the 9:00 PM slot changed it to "Full" with a disabled "Full" button. Clicking that button selected nothing, and the dropdown option read "Sat, Oct 31, 9:00 PM (Full)" and was disabled. It was still Full after a server restart and page refresh. `npm run check`: booking the last 2 spots gave status 201 and spots_left 0; one more spot gave status 409, and spots_left was still 0.
