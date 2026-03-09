const express = require('express');
const cors = require('cors');
const { db, initDatabase } = require('./database');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

initDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚆 Train QA Demo Backend running on http://localhost:${PORT}`);
      console.log('✅ Intentional bugs have been fixed!');
    });
  })
  .catch((error) => {
    console.error('Failed to initialize database', error);
    process.exit(1);
  });

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const runAsync = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve(this);
      }
    });
  });

const getAsync = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });

const allAsync = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });

async function withTransaction(work) {
  await runAsync('BEGIN TRANSACTION');
  try {
    const result = await work();
    await runAsync('COMMIT');
    return result;
  } catch (err) {
    try {
      await runAsync('ROLLBACK');
    } catch (rollbackErr) {
      console.error('Rollback failed', rollbackErr);
    }
    throw err;
  }
}

function sendError(res, error) {
  if (error instanceof HttpError) {
    return res.status(error.status).json({ error: error.message });
  }
  console.error(error);
  return res.status(500).json({ error: 'Internal server error' });
}

// GET /api/trains
app.get('/api/trains', async (_req, res) => {
  try {
    const trains = await allAsync('SELECT * FROM trains');
    res.json(trains);
  } catch (error) {
    sendError(res, error);
  }
});

// GET /api/trains/:id
app.get('/api/trains/:id', async (req, res) => {
  try {
    const train = await getAsync('SELECT * FROM trains WHERE id = ?', [req.params.id]);
    if (!train) {
      throw new HttpError(404, 'Train not found');
    }
    res.json(train);
  } catch (error) {
    sendError(res, error);
  }
});

// POST /api/tickets
app.post('/api/tickets', async (req, res) => {
  const { passenger_name, train_id, seat_count } = req.body;
  const normalizedName = (passenger_name || '').trim();
  const trainId = Number(train_id);
  const seatsRequested = Number(seat_count);

  try {
    if (!normalizedName) {
      throw new HttpError(400, 'Passenger name is required');
    }
    if (!Number.isInteger(trainId) || trainId <= 0) {
      throw new HttpError(400, 'Valid train_id is required');
    }
    if (!Number.isInteger(seatsRequested) || seatsRequested <= 0) {
      throw new HttpError(400, 'seat_count must be a positive integer');
    }

    const train = await getAsync('SELECT * FROM trains WHERE id = ?', [trainId]);
    if (!train) {
      throw new HttpError(404, 'Train not found');
    }
    if (seatsRequested > train.seats_available) {
      throw new HttpError(400, 'Not enough seats available');
    }

    const duplicate = await getAsync(
      'SELECT id FROM tickets WHERE passenger_name = ? AND train_id = ?',
      [normalizedName, trainId]
    );
    if (duplicate) {
      throw new HttpError(409, 'Passenger already booked on this train');
    }

    const ticketId = await withTransaction(async () => {
      const insertResult = await runAsync(
        'INSERT INTO tickets (passenger_name, train_id, seat_count) VALUES (?, ?, ?)',
        [normalizedName, trainId, seatsRequested]
      );
      await runAsync('UPDATE trains SET seats_available = seats_available - ? WHERE id = ?', [
        seatsRequested,
        trainId,
      ]);
      return insertResult.lastID;
    });

    res.status(201).json({ success: true, ticketId });
  } catch (error) {
    sendError(res, error);
  }
});

// GET /api/tickets
app.get('/api/tickets', async (_req, res) => {
  try {
    const tickets = await allAsync(
      `SELECT t.*, tr.name as train_name, tr.origin, tr.destination
       FROM tickets t
       JOIN trains tr ON t.train_id = tr.id`
    );
    res.json(tickets);
  } catch (error) {
    sendError(res, error);
  }
});

// DELETE /api/tickets/:id
app.delete('/api/tickets/:id', async (req, res) => {
  const ticketId = Number(req.params.id);
  try {
    if (!Number.isInteger(ticketId) || ticketId <= 0) {
      throw new HttpError(400, 'Invalid ticket id');
    }

    const ticket = await getAsync('SELECT * FROM tickets WHERE id = ?', [ticketId]);
    if (!ticket) {
      throw new HttpError(404, 'Ticket not found');
    }

    await withTransaction(async () => {
      const deleteResult = await runAsync('DELETE FROM tickets WHERE id = ?', [ticketId]);
      if (!deleteResult.changes) {
        throw new HttpError(500, 'Failed to delete ticket');
      }
      const updateResult = await runAsync(
        'UPDATE trains SET seats_available = seats_available + ? WHERE id = ?',
        [ticket.seat_count, ticket.train_id]
      );
      if (!updateResult.changes) {
        throw new HttpError(500, 'Failed to restore seat availability');
      }
    });

    res.json({ success: true, message: 'Ticket cancelled' });
  } catch (error) {
    sendError(res, error);
  }
});

// POST /api/trains
app.post('/api/trains', async (req, res) => {
  const { name, origin, destination, seats_total } = req.body;
  const trimmedName = (name || '').trim();
  const trimmedOrigin = (origin || '').trim();
  const trimmedDestination = (destination || '').trim();
  const seatsTotal = Number(seats_total);

  try {
    if (!trimmedName || !trimmedOrigin || !trimmedDestination) {
      throw new HttpError(400, 'Name, origin, and destination are required');
    }
    if (!Number.isInteger(seatsTotal) || seatsTotal <= 0) {
      throw new HttpError(400, 'seats_total must be a positive integer');
    }

    const insertResult = await runAsync(
      `INSERT INTO trains (name, origin, destination, seats_total, seats_available)
       VALUES (?, ?, ?, ?, ?)`,
      [trimmedName, trimmedOrigin, trimmedDestination, seatsTotal, seatsTotal]
    );

    res.status(201).json({ success: true, trainId: insertResult.lastID });
  } catch (error) {
    sendError(res, error);
  }
});

// PUT /api/trains/:id
app.put('/api/trains/:id', async (req, res) => {
  const { name, origin, destination, seats_total, seats_available } = req.body;
  const trimmedName = (name || '').trim();
  const trimmedOrigin = (origin || '').trim();
  const trimmedDestination = (destination || '').trim();
  const seatsTotal = Number(seats_total);
  const seatsAvailable = Number(seats_available);
  const trainId = Number(req.params.id);

  try {
    if (!Number.isInteger(trainId) || trainId <= 0) {
      throw new HttpError(400, 'Invalid train id');
    }
    if (!trimmedName || !trimmedOrigin || !trimmedDestination) {
      throw new HttpError(400, 'Name, origin, and destination are required');
    }
    if (!Number.isInteger(seatsTotal) || seatsTotal <= 0) {
      throw new HttpError(400, 'seats_total must be a positive integer');
    }
    if (
      !Number.isInteger(seatsAvailable) ||
      seatsAvailable < 0 ||
      seatsAvailable > seatsTotal
    ) {
      throw new HttpError(400, 'seats_available must be between 0 and seats_total');
    }

    const updateResult = await runAsync(
      `UPDATE trains
         SET name = ?, origin = ?, destination = ?, seats_total = ?, seats_available = ?
       WHERE id = ?`,
      [trimmedName, trimmedOrigin, trimmedDestination, seatsTotal, seatsAvailable, trainId]
    );

    if (!updateResult.changes) {
      throw new HttpError(404, 'Train not found');
    }

    res.json({ success: true });
  } catch (error) {
    sendError(res, error);
  }
});

// DELETE /api/trains/:id
app.delete('/api/trains/:id', async (req, res) => {
  const trainId = Number(req.params.id);
  try {
    if (!Number.isInteger(trainId) || trainId <= 0) {
      throw new HttpError(400, 'Invalid train id');
    }

    const train = await getAsync('SELECT id FROM trains WHERE id = ?', [trainId]);
    if (!train) {
      throw new HttpError(404, 'Train not found');
    }

    await withTransaction(async () => {
      await runAsync('DELETE FROM tickets WHERE train_id = ?', [trainId]);
      const deleteResult = await runAsync('DELETE FROM trains WHERE id = ?', [trainId]);
      if (!deleteResult.changes) {
        throw new HttpError(500, 'Failed to delete train');
      }
    });

    res.json({ success: true, message: 'Train deleted' });
  } catch (error) {
    sendError(res, error);
  }
});

