const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');

process.env.TURSO_DATABASE_URL = `file:${path.join(__dirname, 'trains.test.db')}`;

const app = require('./server');
const { db, initDatabase, resetDatabase } = require('./database');

let server;
let baseUrl;

async function getTrain(id) {
  const result = await db.execute({
    sql: 'SELECT * FROM trains WHERE id = ?',
    args: [id]
  });
  return result.rows[0] || null;
}

async function getTicket(id) {
  const result = await db.execute({
    sql: 'SELECT * FROM tickets WHERE id = ?',
    args: [id]
  });
  return result.rows[0] || null;
}

async function getAllTicketsForTrainAndPassenger(trainId, passengerName) {
  const result = await db.execute({
    sql: 'SELECT * FROM tickets WHERE train_id = ? AND passenger_name = ?',
    args: [trainId, passengerName]
  });
  return result.rows;
}

test.before(async () => {
  await initDatabase();
  await resetDatabase();

  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}/api`;
});

test.after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
});

test.beforeEach(async () => {
  await resetDatabase();
});

test('rejects an empty passenger name with 400 and does not create a ticket', async () => {
  const response = await fetch(`${baseUrl}/tickets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      passenger_name: '   ',
      train_id: 1,
      seat_count: 1
    })
  });

  assert.equal(response.status, 400);
  assert.match((await response.json()).error, /Passenger name is required/i);

  const tickets = await getAllTicketsForTrainAndPassenger(1, '');
  assert.equal(tickets.length, 0);
});

test('rejects a non-positive seat count with 400 and does not create a ticket', async () => {
  const response = await fetch(`${baseUrl}/tickets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      passenger_name: 'Seat Reject',
      train_id: 1,
      seat_count: 0
    })
  });

  assert.equal(response.status, 400);
  assert.match((await response.json()).error, /Seat count must be greater than 0/i);

  const tickets = await getAllTicketsForTrainAndPassenger(1, 'Seat Reject');
  assert.equal(tickets.length, 0);
});

test('decreases seats_available after a successful booking', async () => {
  const before = await getTrain(1);
  assert.equal(Number(before.seats_available), 40);

  const response = await fetch(`${baseUrl}/tickets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      passenger_name: 'Seat Counter',
      train_id: 1,
      seat_count: 2
    })
  });

  assert.equal(response.status, 200);
  const after = await getTrain(1);
  assert.equal(Number(after.seats_available), 38);
});

test('removes a cancelled ticket from the database and restores seats immediately', async () => {
  const createResponse = await fetch(`${baseUrl}/tickets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      passenger_name: 'Cancel Rider',
      train_id: 1,
      seat_count: 3
    })
  });
  const createBody = await createResponse.json();
  const ticketId = createBody.ticketId;

  const trainAfterBooking = await getTrain(1);
  assert.equal(Number(trainAfterBooking.seats_available), 37);

  const cancelResponse = await fetch(`${baseUrl}/tickets/${ticketId}`, {
    method: 'DELETE'
  });

  assert.equal(cancelResponse.status, 200);
  assert.equal(await getTicket(ticketId), null);

  const trainAfterCancel = await getTrain(1);
  assert.equal(Number(trainAfterCancel.seats_available), 40);
});

test('rejects duplicate bookings with a descriptive 409 and does not create a second ticket', async () => {
  const payload = {
    passenger_name: 'Alice',
    train_id: 1,
    seat_count: 1
  };

  const firstResponse = await fetch(`${baseUrl}/tickets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  assert.equal(firstResponse.status, 200);

  const duplicateResponse = await fetch(`${baseUrl}/tickets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  assert.equal(duplicateResponse.status, 409);
  assert.match((await duplicateResponse.json()).error, /already have a booking/i);

  const tickets = await getAllTicketsForTrainAndPassenger(1, 'Alice');
  assert.equal(tickets.length, 1);
});

test('deletes a train persistently and returns a meaningful response', async () => {
  const response = await fetch(`${baseUrl}/trains/2`, {
    method: 'DELETE'
  });

  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.success, true);
  assert.equal(body.trainId, 2);

  const train = await getTrain(2);
  assert.equal(train, null);

  const listResponse = await fetch(`${baseUrl}/trains`);
  const trains = await listResponse.json();
  assert.equal(trains.some((item) => Number(item.id) === 2), false);
});
