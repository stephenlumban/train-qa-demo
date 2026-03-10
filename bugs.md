# 🐛 Bug Registry — Train QA Demo

> **INTERNAL USE ONLY.** This file is the answer key. Do not share with devs or agents being assessed.
> The QA tickets in `qa-tickets.md` are what get handed to them.

---

## Bug 1 — Missing Input Validation on Booking Form

**Ticket:** TQA-001  
**Severity:** High  
**Root Cause:** The `handleSubmit` function in `frontend/src/pages/BookTicket.jsx` skips all validation before calling the API. The form submits even with an empty `passenger_name` or a negative `seat_count`.

**Location:**
- Frontend: `frontend/src/pages/BookTicket.jsx` — `handleSubmit()`
- Backend: `backend/server.js` — `POST /api/tickets` (no server-side validation either)

**How to confirm:**
1. Go to `/book/:trainId`
2. Clear the Passenger Name field, submit → booking succeeds
3. Enter `-5` for Seat Count, submit → booking succeeds

**Fix:** Add `if (!formData.passengerName.trim())` check and `if (Number(formData.seatCount) < 1)` check in `handleSubmit`, and add server-side validation in `POST /api/tickets`.

---

## Bug 2 — Seat Count Not Decremented After Booking

**Ticket:** TQA-002  
**Severity:** High  
**Root Cause:** The `POST /api/tickets` handler in `backend/server.js` inserts the ticket row but never executes an `UPDATE trains SET seats_available = seats_available - ? WHERE id = ?` query.

**Location:**
- Backend: `backend/server.js` — `POST /api/tickets`, line ~58 (comment marks the missing code)

**How to confirm:**
1. Note `seats_available` for a train on `/trains`
2. Book 2 seats on that train
3. Return to `/trains` — seat count is unchanged

**Fix:** Add `db.run('UPDATE trains SET seats_available = seats_available - ? WHERE id = ?', [seat_count, train_id])` after the INSERT.

---

## Bug 3 — Cancel Ticket Does Not Remove the Ticket

**Ticket:** TQA-003  
**Severity:** High  
**Root Cause:** Two-layer bug:
1. **Backend** (`backend/server.js` — `DELETE /api/tickets/:id`): Returns `{ success: true }` without executing any DELETE SQL.
2. **Frontend** (`frontend/src/pages/MyTickets.jsx` — `handleCancel()`): Does not remove the ticket from local state or re-fetch the list after calling the API.

**How to confirm:**
1. Book a ticket, go to `/tickets`
2. Click **Cancel Ticket** — success message appears, ticket remains
3. Refresh the page — ticket is still in the database

**Fix (Backend):** Replace the stub response with `db.run('DELETE FROM tickets WHERE id = ?', [id], ...)`.  
**Fix (Frontend):** After a successful cancellation call, call `fetchTickets()` to refresh the list.

---

## Bug 4 — Duplicate Bookings Allowed (Manifests as 500 Error)

**Ticket:** TQA-004  
**Severity:** Medium  
**Root Cause:** The backend has no duplicate-booking check. However, the SQLite schema may have a UNIQUE constraint that causes the second identical booking to throw a 500 Internal Server Error instead of returning a meaningful error message.

**Location:**
- Backend: `backend/server.js` — `POST /api/tickets` (no uniqueness check)
- Backend: `backend/database.js` (check schema for UNIQUE constraints)

**How to confirm:**
1. Book a ticket: name "John", Train 1, 1 seat
2. Immediately book again: same name, same train, same seat count
3. Observe a 500 error on the second attempt (or a silent duplicate, depending on schema)

**Fix:** Add a query to check for existing tickets with the same `passenger_name` + `train_id` before inserting, and return a 409 Conflict response.

---

## Bug 5 — Delete Train Does Not Remove It from the Database

**Ticket:** TQA-005  
**Severity:** High  
**Root Cause:** The `DELETE /api/trains/:id` handler in `backend/server.js` returns `{ success: true }` without executing any DELETE SQL. The train persists in the database.

**Location:**
- Backend: `backend/server.js` — `DELETE /api/trains/:id`, line ~140

**How to confirm:**
1. Go to `/admin/trains`
2. Click **Delete** on any train — success message shows, train disappears from UI momentarily
3. Refresh the page — train reappears

**Fix:** Replace the stub response with `db.run('DELETE FROM trains WHERE id = ?', [id], ...)`.

---

## Bug 6 — API Returns 200 OK for Invalid Booking Requests

**Ticket:** TQA-006  
**Severity:** Medium  
**Root Cause:** The `POST /api/tickets` endpoint always responds with `res.json({ success: true })` regardless of whether the input is valid. Requests with empty names or negative seat counts receive a 200 status.

**Location:**
- Backend: `backend/server.js` — `POST /api/tickets`

**How to confirm:**
```js
fetch('/api/tickets', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ passenger_name: '', train_id: 1, seat_count: -5 })
}).then(r => console.log(r.status)) // Logs: 200
```

**Fix:** Add validation before the INSERT and return `res.status(400).json({ error: '...' })` for invalid inputs.

---

## Summary Table

| Ticket  | Bug Description                        | Location              | Severity |
|---------|----------------------------------------|-----------------------|----------|
| TQA-001 | No validation on booking form          | BookTicket.jsx + server.js | High |
| TQA-002 | Seat count not decremented on booking  | server.js POST /api/tickets | High |
| TQA-003 | Cancel ticket does nothing             | server.js + MyTickets.jsx | High |
| TQA-004 | Duplicate bookings / 500 on duplicate  | server.js POST /api/tickets | Medium |
| TQA-005 | Delete train doesn't delete            | server.js DELETE /api/trains/:id | High |
| TQA-006 | Invalid booking returns 200 OK         | server.js POST /api/tickets | Medium |
