# 🚆 Train Ticket System (QA Demo App)

A **simple train booking web app intentionally built with bugs** so QA
tools (like Playwright or an OpenClaw QA agent) can detect failures.

This project demonstrates: - QA automation - Playwright testing - bug
detection - regression testing

------------------------------------------------------------------------

# 1. Project Goal

Create a small web app that supports:

-   Train listing
-   Ticket booking
-   Ticket cancellation
-   Train CRUD (admin)

But with **intentional bugs** so automated tests can detect them.

------------------------------------------------------------------------

# 2. Recommended Stack

Frontend - React - Vite - shadcn/ui

Backend - Node.js - Express - SQLite

Testing - Playwright

------------------------------------------------------------------------

# 3. App Pages

## Train List Page

Route: `/trains`

Displays all available trains.

  Train   From    To       Available Seats
  ------- ------- -------- -----------------
  A1      Tokyo   Osaka    40
  B2      Paris   Berlin   20

Actions: - Book Ticket - View Details

API: GET /api/trains

------------------------------------------------------------------------

## Book Ticket Page

Route: `/book/:trainId`

Form fields: - Passenger Name - Seat Count

API call: POST /api/tickets

Example payload:

{ "passenger_name": "John", "train_id": 1, "seat_count": 1 }

------------------------------------------------------------------------

## My Tickets Page

Route: `/tickets`

Displays tickets table.

Actions: - Cancel Ticket

APIs: GET /api/tickets\
DELETE /api/tickets/:id

------------------------------------------------------------------------

## Admin Train Management

Route: `/admin/trains`

Admin actions: - Create Train - Update Train - Delete Train

APIs: POST /api/trains\
PUT /api/trains/:id\
DELETE /api/trains/:id

------------------------------------------------------------------------

# 4. Database Schema

## trains table

id INTEGER PRIMARY KEY\
name TEXT\
origin TEXT\
destination TEXT\
seats_total INTEGER\
seats_available INTEGER

Example:

1 \| Express A1 \| Tokyo \| Osaka \| 100 \| 100

------------------------------------------------------------------------

## tickets table

id INTEGER PRIMARY KEY\
passenger_name TEXT\
train_id INTEGER\
seat_count INTEGER

------------------------------------------------------------------------

# 5. Intentional Bugs

## Bug 1 --- Missing Validation

Booking form allows: - Empty passenger name - Negative seat count

Expected: Form should reject invalid input.

Actual: Booking succeeds.

------------------------------------------------------------------------

## Bug 2 --- Seat Count Not Updating

Booking a ticket should decrease seats_available.

Bug behavior: Seat count never changes.

Example: Train has 10 seats\
User books 2 seats\
Still shows 10 seats

------------------------------------------------------------------------

## Bug 3 --- Cancel Ticket Button Broken

Cancel button appears but does nothing.

Expected: Ticket removed.

Actual: No change.

------------------------------------------------------------------------

## Bug 4 --- Duplicate Booking Allowed

System allows identical bookings for same passenger and train.

Expected: Prevent duplicates.

------------------------------------------------------------------------

## Bug 5 --- Delete Train API Broken

Deleting train via admin does not remove it from database.

Expected: Train removed.

Actual: Train still appears after refresh.

------------------------------------------------------------------------

## Bug 6 --- Wrong API Status Code

Booking endpoint returns `200 OK` even if request invalid.

Example invalid request:

seat_count = -5

Expected: 400 Bad Request

------------------------------------------------------------------------

# 6. Example Buggy API Code

Example Express endpoint:

app.post("/api/tickets", async (req, res) =\> { const { passenger_name,
train_id, seat_count } = req.body;

await db.run( "INSERT INTO tickets(passenger_name, train_id, seat_count)
VALUES (?, ?, ?)", \[passenger_name, train_id, seat_count\] );

res.json({ success: true }); });

Problems: - No validation - No seat availability check

------------------------------------------------------------------------

# 7. Playwright Test Cases

## Train List Loads

open /trains\
expect train table visible

------------------------------------------------------------------------

## Booking Flow

open trains page\
click book\
fill form\
submit\
expect ticket appears

------------------------------------------------------------------------

## Validation Test

submit empty passenger name\
expect error

(Bug causes this test to fail.)

------------------------------------------------------------------------

## Seat Count Update

record seat count\
book ticket\
refresh page\
expect seat count decreased

------------------------------------------------------------------------

## Cancel Ticket

book ticket\
click cancel\
expect ticket removed

------------------------------------------------------------------------

# 8. Demo Workflow

Run site:

npm run dev

Run Playwright tests:

npx playwright test

Example failing output:

Train list loads ✔\
Booking flow ✔\
Validation test ❌\
Seat update ❌\
Cancel ticket ❌

------------------------------------------------------------------------

# 9. Optional QA Scenarios

Add features to test: - loading spinners - network errors - timeouts

Useful for testing: - retry logic - error handling

------------------------------------------------------------------------

# 10. Suggested Folder Structure

train-demo/ │ ├── backend/ │ ├── server.js │ ├── database.js │ ├──
frontend/ │ ├── pages/ │ ├── components/ │ ├── tests/ │ ├──
booking.spec.ts │ ├── cancel.spec.ts │ ├── validation.spec.ts │ └──
README.md

------------------------------------------------------------------------

# 11. Goal of the Demo

Demonstrate detection of: - UI bugs - API validation problems - data
integrity issues - state synchronization bugs

Using: - Playwright automation - QA testing workflows - AI QA agents
