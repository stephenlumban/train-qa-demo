# 🎫 QA Tickets — Train Ticket System

> These tickets represent reported issues in the Train Ticket System.  
> Investigate each one, identify the root cause, and provide a fix or test that confirms the bug.  
> The app runs at **http://localhost:3000** (frontend) and **http://localhost:3001** (API).

---

## TQA-001 — Booking form accepts invalid input

**Priority:** High  
**Component:** Booking / `/book/:trainId`

### Description
Users have reported that the booking form does not enforce basic data integrity. Submissions that should be rejected appear to go through without error.

### Steps to Reproduce
1. Navigate to the Train List page at `/trains`
2. Click **Book Ticket** on any available train
3. Leave the **Passenger Name** field completely empty
4. Enter any seat count and submit the form
5. Observe the result

### Expected Behavior
- The form should reject the submission and display a validation error if Passenger Name is empty
- The form should reject negative or zero seat counts

### Acceptance Criteria
- [ ] Submitting with an empty Passenger Name shows an error and does not create a ticket
- [ ] Submitting with a seat count ≤ 0 shows an error and does not create a ticket

---

## TQA-002 — Available seat count does not update after a booking

**Priority:** High  
**Component:** Train List / Booking

### Description
After a passenger successfully books seats on a train, the available seat count displayed on the Train List page does not reflect the booking. The number appears frozen regardless of how many tickets are booked.

### Steps to Reproduce
1. Go to `/trains` and note the **Available Seats** count for any train (e.g., "40 / 100")
2. Click **Book Ticket**, fill in a valid name and seat count (e.g., 2 seats), and submit
3. Return to `/trains`
4. Observe the Available Seats count for the same train

### Expected Behavior
The available seat count should decrease by the number of seats booked (e.g., from 40 to 38 after booking 2 seats).

### Acceptance Criteria
- [ ] After booking N seats, `seats_available` for the train decreases by N
- [ ] The updated count is reflected immediately on the Train List page

---

## TQA-003 — Cancel Ticket button does not remove the ticket

**Priority:** High  
**Component:** My Tickets / `/tickets`

### Description
The **Cancel Ticket** button on the My Tickets page appears to work — it shows a confirmation message — but the ticket remains visible on the page and is still present after a page refresh.

### Steps to Reproduce
1. Book at least one ticket via `/book/:trainId`
2. Navigate to `/tickets`
3. Click **Cancel Ticket** on any ticket
4. Observe the page — note whether the ticket disappears
5. Refresh the page (`F5`) and observe whether the ticket is still listed

### Expected Behavior
- Clicking **Cancel Ticket** should remove the ticket from the system
- The ticket should no longer appear in the list after cancellation, including after a page refresh

### Acceptance Criteria
- [ ] Cancelled ticket is removed from the database
- [ ] The ticket list updates immediately after cancellation (no refresh required)

---

## TQA-004 — System allows or crashes on duplicate bookings

**Priority:** Medium  
**Component:** Booking / API

### Description
When the same passenger attempts to book the same train more than once, the system behaves unexpectedly. Either the duplicate booking is silently accepted, or the server returns an error instead of a clear message to the user.

### Steps to Reproduce
1. Navigate to `/book/:trainId` and book a ticket (e.g., name: "Alice", train: Express A1, seats: 1)
2. Confirm the ticket appears in `/tickets`
3. Return to `/book/:trainId` for the **same train** and submit another booking with the **same name and seat count**
4. Observe the result on both the UI and `/tickets`

### Expected Behavior
The system should detect the duplicate and return a clear, user-friendly error (e.g., "You already have a booking for this train") without creating a second ticket.

### Acceptance Criteria
- [ ] A duplicate booking (same passenger + same train) is rejected with a descriptive error message
- [ ] The API returns an appropriate HTTP status code (not 500)
- [ ] No duplicate ticket rows appear in `/tickets`

---

## TQA-005 — Deleting a train via Admin does not persist

**Priority:** High  
**Component:** Admin / `/admin/trains`

### Description
In the Admin Train Management panel, clicking **Delete** on a train shows a success message. However, refreshing the page reveals that the train was not actually removed — it reappears as if nothing happened.

### Steps to Reproduce
1. Navigate to `/admin/trains`
2. Identify any train in the list
3. Click the **Delete** button for that train
4. Observe the status message
5. Refresh the page (`F5`)
6. Check whether the train is still listed

### Expected Behavior
Deleting a train should permanently remove it from the database. It should not reappear after a page refresh.

### Acceptance Criteria
- [ ] Deleted train no longer appears in `/admin/trains` after refresh
- [ ] Deleted train no longer appears in `/trains` after refresh
- [ ] The DELETE API returns a meaningful response confirming the deletion

---

## TQA-006 — Booking API returns 200 OK for clearly invalid requests

**Priority:** Medium  
**Component:** API / `POST /api/tickets`

### Description
The ticket booking API endpoint does not validate its input. Requests that contain clearly invalid data (e.g., empty passenger name, negative seat count) are accepted and return a `200 OK` response, when they should return a `400 Bad Request`.

### Steps to Reproduce
Run the following in the browser console or any HTTP client while the app is running:

```js
fetch('http://localhost:3001/api/tickets', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    passenger_name: '',
    train_id: 1,
    seat_count: -5
  })
}).then(r => console.log('Status:', r.status, r.statusText))
```

### Expected Behavior
The API should respond with `400 Bad Request` and a descriptive error message when required fields are missing or invalid.

### Acceptance Criteria
- [ ] `POST /api/tickets` with an empty `passenger_name` returns `400`
- [ ] `POST /api/tickets` with `seat_count <= 0` returns `400`
- [ ] Response body includes a human-readable `error` field explaining the rejection
- [ ] No ticket row is created in the database for invalid requests

---

## Assessment Scoring

Use this rubric to evaluate findings:

| Ticket  | Discovery (found the bug) | Root Cause (explained correctly) | Fix (correct solution proposed or implemented) |
|---------|--------------------------|----------------------------------|------------------------------------------------|
| TQA-001 | 5 pts | 5 pts | 10 pts |
| TQA-002 | 5 pts | 5 pts | 10 pts |
| TQA-003 | 5 pts | 5 pts | 10 pts |
| TQA-004 | 5 pts | 5 pts | 10 pts |
| TQA-005 | 5 pts | 5 pts | 10 pts |
| TQA-006 | 5 pts | 5 pts | 10 pts |
| **Total** | **30 pts** | **30 pts** | **60 pts** | 

**Maximum score: 120 pts**
