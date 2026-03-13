const express = require('express');
const cors = require('cors');
const { db, initDatabase } = require('./database');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

function normalizePassengerName(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function parseSeatCount(value) {
  return Number.parseInt(value, 10);
}

// Initialize database on startup
initDatabase();

// GET /api/trains - List all trains
app.get('/api/trains', async (req, res) => {
  try {
    const result = await db.execute('SELECT * FROM trains');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// GET /api/trains/:id - Get single train
app.get('/api/trains/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.execute({
      sql: 'SELECT * FROM trains WHERE id = ?',
      args: [id]
    });
    
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Train not found' });
      return;
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/tickets', async (req, res) => {
  const passengerName = normalizePassengerName(req.body.passenger_name);
  const trainId = Number.parseInt(req.body.train_id, 10);
  const seatCount = parseSeatCount(req.body.seat_count);

  if (!passengerName) {
    res.status(400).json({ error: 'Passenger name is required.' });
    return;
  }

  if (!Number.isInteger(trainId) || trainId <= 0) {
    res.status(400).json({ error: 'A valid train is required.' });
    return;
  }

  if (!Number.isInteger(seatCount) || seatCount <= 0) {
    res.status(400).json({ error: 'Seat count must be greater than 0.' });
    return;
  }

  try {
    const trainResult = await db.execute({
      sql: 'SELECT * FROM trains WHERE id = ?',
      args: [trainId]
    });

    if (trainResult.rows.length === 0) {
      res.status(404).json({ error: 'Train not found.' });
      return;
    }

    const train = trainResult.rows[0];
    if (train.seats_available < seatCount) {
      res.status(400).json({ error: 'Not enough seats available for this train.' });
      return;
    }

    const duplicateResult = await db.execute({
      sql: 'SELECT id FROM tickets WHERE train_id = ? AND passenger_name = ?',
      args: [trainId, passengerName]
    });

    if (duplicateResult.rows.length > 0) {
      res.status(409).json({ error: 'You already have a booking for this train.' });
      return;
    }

    const result = await db.execute({
      sql: 'INSERT INTO tickets (passenger_name, train_id, seat_count) VALUES (?, ?, ?)',
      args: [passengerName, trainId, seatCount]
    });

    await db.execute({
      sql: 'UPDATE trains SET seats_available = seats_available - ? WHERE id = ?',
      args: [seatCount, trainId]
    });

    res.json({ success: true, ticketId: Number(result.lastInsertRowid) });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// GET /api/tickets - List all tickets
app.get('/api/tickets', async (req, res) => {
  try {
    const result = await db.execute(`
      SELECT t.*, tr.name as train_name, tr.origin, tr.destination 
      FROM tickets t 
      JOIN trains tr ON t.train_id = tr.id
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.delete('/api/tickets/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const ticketResult = await db.execute({
      sql: 'SELECT id, train_id, seat_count FROM tickets WHERE id = ?',
      args: [id]
    });

    if (ticketResult.rows.length === 0) {
      res.status(404).json({ error: 'Ticket not found.' });
      return;
    }

    const ticket = ticketResult.rows[0];

    await db.execute({
      sql: 'DELETE FROM tickets WHERE id = ?',
      args: [id]
    });

    await db.execute({
      sql: 'UPDATE trains SET seats_available = MIN(seats_total, seats_available + ?) WHERE id = ?',
      args: [ticket.seat_count, ticket.train_id]
    });

    res.json({ success: true, message: 'Ticket cancelled.' });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// POST /api/trains - Create train (admin)
app.post('/api/trains', async (req, res) => {
  const { name, origin, destination, seats_total } = req.body;
  
  try {
    const result = await db.execute({
      sql: `
        INSERT INTO trains (name, origin, destination, seats_total, seats_available) 
        VALUES (?, ?, ?, ?, ?)
      `,
      args: [name, origin, destination, seats_total, seats_total]
    });
    res.json({ success: true, trainId: Number(result.lastInsertRowid) });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// PUT /api/trains/:id - Update train (admin)
app.put('/api/trains/:id', async (req, res) => {
  const { id } = req.params;
  const { name, origin, destination, seats_total, seats_available } = req.body;
  
  try {
    await db.execute({
      sql: `
        UPDATE trains 
        SET name = ?, origin = ?, destination = ?, seats_total = ?, seats_available = ?
        WHERE id = ?
      `,
      args: [name, origin, destination, seats_total, seats_available, id]
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.delete('/api/trains/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const existingTrain = await db.execute({
      sql: 'SELECT id, name FROM trains WHERE id = ?',
      args: [id]
    });

    if (existingTrain.rows.length === 0) {
      res.status(404).json({ error: 'Train not found.' });
      return;
    }

    await db.execute({
      sql: 'DELETE FROM tickets WHERE train_id = ?',
      args: [id]
    });

    await db.execute({
      sql: 'DELETE FROM trains WHERE id = ?',
      args: [id]
    });

    res.json({ success: true, message: 'Train deleted.', trainId: Number(id) });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Vercel serverless functions require the app to be exported!
module.exports = app;

// Only listen locally if run directly via node (not Vercel)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚆 Train QA Demo Backend running on http://localhost:${PORT}`);
    console.log('📋 Intentional bugs included for QA testing!');
  });
}
