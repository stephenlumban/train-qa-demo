process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('./server');
const { db, initDatabase } = require('./database');

beforeAll(async () => {
  await initDatabase();
});

describe('API Bug Fix Tests', () => {

  let trainId;
  let initialSeats;

  beforeAll((done) => {
    // get a train id to use
    db.get('SELECT id, seats_available FROM trains LIMIT 1', (err, row) => {
      trainId = row.id;
      initialSeats = row.seats_available;
      done();
    });
  });

  describe('Bug 1 & 6: Input Validation', () => {
    it('should return 400 for empty passenger name', async () => {
      const res = await request(app)
        .post('/api/tickets')
        .send({ passenger_name: '   ', train_id: trainId, seat_count: 1 });
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toContain('Passenger name is required');
    });

    it('should return 400 for negative seat count', async () => {
      const res = await request(app)
        .post('/api/tickets')
        .send({ passenger_name: 'John', train_id: trainId, seat_count: -5 });
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toContain('positive number');
    });

    it('should return 400 for zero seat count', async () => {
      const res = await request(app)
        .post('/api/tickets')
        .send({ passenger_name: 'John', train_id: trainId, seat_count: 0 });
      expect(res.statusCode).toBe(400);
    });
  });

  describe('Bug 2: Seat Count Update', () => {
    it('should decrement seats_available when a ticket is booked', async () => {
      // First, get the current seats
      const initialRes = await request(app).get(`/api/trains/${trainId}`);
      const seatsBefore = initialRes.body.seats_available;

      // Book 2 seats
      const res = await request(app)
        .post('/api/tickets')
        .send({ passenger_name: 'Alice Update', train_id: trainId, seat_count: 2 });
      expect(res.statusCode).toBe(200);

      // Verify the decrement (wait a tiny bit just in case sqlite update is slow)
      await new Promise(r => setTimeout(r, 50));
      const finalRes = await request(app).get(`/api/trains/${trainId}`);
      expect(finalRes.body.seats_available).toBe(seatsBefore - 2);
    });
  });

  describe('Bug 4: Duplicate Booking', () => {
    it('should return 409 Conflict if same passenger books same train again', async () => {
      const passenger = 'Bob Duplicate';
      
      // First booking
      const res1 = await request(app)
        .post('/api/tickets')
        .send({ passenger_name: passenger, train_id: trainId, seat_count: 1 });
      expect(res1.statusCode).toBe(200);

      // Duplicate booking
      const res2 = await request(app)
        .post('/api/tickets')
        .send({ passenger_name: passenger, train_id: trainId, seat_count: 2 });
      
      expect(res2.statusCode).toBe(409);
      expect(res2.body.error).toContain('already exists');
    });
  });

  describe('Bug 3: Cancel Ticket', () => {
    it('should actually delete the ticket from the database', async () => {
      // Create a ticket to delete
      const bookRes = await request(app)
        .post('/api/tickets')
        .send({ passenger_name: 'Charlie Delete', train_id: trainId, seat_count: 1 });
      const ticketId = bookRes.body.ticketId;
      
      // Delete the ticket
      const delRes = await request(app).delete(`/api/tickets/${ticketId}`);
      expect(delRes.statusCode).toBe(200);
      expect(delRes.body.message).toBe('Ticket cancelled');

      // Verify it's gone
      const delCheck = await request(app).delete(`/api/tickets/${ticketId}`);
      // The second delete should return 404 because the ticket has been deleted.
      expect(delCheck.statusCode).toBe(404);
      expect(delCheck.body.error).toBe('Ticket not found');
    });
  });

  describe('Bug 5: Delete Train', () => {
    it('should actually delete the train from the database', async () => {
      // Create a train to delete
      const createRes = await request(app)
        .post('/api/trains')
        .send({ name: 'Temp Train', origin: 'X', destination: 'Y', seats_total: 10 });
      const newTrainId = createRes.body.trainId;

      // Delete the train
      const delRes = await request(app).delete(`/api/trains/${newTrainId}`);
      expect(delRes.statusCode).toBe(200);

      // Verify it's gone
      const getRes = await request(app).get(`/api/trains/${newTrainId}`);
      expect(getRes.statusCode).toBe(404);
      expect(getRes.body.error).toBe('Train not found');
    });
  });

});
