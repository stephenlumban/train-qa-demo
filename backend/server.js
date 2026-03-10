const express = require('express');
const cors = require('cors');
const { db, initDatabase } = require('./database');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Initialize database on startup
initDatabase();

// GET /api/trains - List all trains
app.get('/api/trains', (req, res) => {
  db.all('SELECT * FROM trains', (err, trains) => {
    if (err) {
      res.status(500).json({ error: 'Database error' });
      return;
    }
    res.json(trains);
  });
});

// GET /api/trains/:id - Get single train
app.get('/api/trains/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM trains WHERE id = ?', [id], (err, train) => {
    if (err) {
      res.status(500).json({ error: 'Database error' });
      return;
    }
    if (!train) {
      res.status(404).json({ error: 'Train not found' });
      return;
    }
    res.json(train);
  });
});

// POST /api/tickets - Book a ticket
app.post('/api/tickets', async (req, res) => {
  const { passenger_name, train_id, seat_count } = req.body;

  // FIX BUG 1 & 6: Validate input, return 400 for invalid data
  if (!passenger_name || !passenger_name.trim()) {
    return res.status(400).json({ error: 'Passenger name is required.' });
  }
  if (!seat_count || Number(seat_count) <= 0) {
    return res.status(400).json({ error: 'Seat count must be a positive number.' });
  }

  // FIX BUG 4: Check for duplicate booking
  db.get(
    'SELECT id FROM tickets WHERE passenger_name = ? AND train_id = ?',
    [passenger_name.trim(), train_id],
    (err, existing) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (existing) {
        return res.status(409).json({ error: 'A booking for this passenger and train already exists.' });
      }

      // Check seat availability
      db.get('SELECT seats_available FROM trains WHERE id = ?', [train_id], (err, train) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (!train) return res.status(404).json({ error: 'Train not found' });
        if (train.seats_available < Number(seat_count)) {
          return res.status(400).json({ error: 'Not enough seats available.' });
        }

        // Insert ticket
        db.run(
          'INSERT INTO tickets (passenger_name, train_id, seat_count) VALUES (?, ?, ?)',
          [passenger_name.trim(), train_id, Number(seat_count)],
          function (err) {
            if (err) {
              return res.status(500).json({ error: 'Database error' });
            }

            // FIX BUG 2: Decrement seats_available after booking
            db.run(
              'UPDATE trains SET seats_available = seats_available - ? WHERE id = ?',
              [Number(seat_count), train_id],
              (err) => {
                if (err) console.error('Failed to update seat count:', err);
              }
            );

            res.json({ success: true, ticketId: this.lastID });
          }
        );
      });
    }
  );
});

// GET /api/tickets - List all tickets
app.get('/api/tickets', (req, res) => {
  db.all(`
    SELECT t.*, tr.name as train_name, tr.origin, tr.destination 
    FROM tickets t 
    JOIN trains tr ON t.train_id = tr.id
  `, (err, tickets) => {
    if (err) {
      res.status(500).json({ error: 'Database error' });
      return;
    }
    res.json(tickets);
  });
});

// DELETE /api/tickets/:id - Cancel ticket
app.delete('/api/tickets/:id', (req, res) => {
  const { id } = req.params;

  // FIX BUG 3: Actually delete the ticket from the database
  db.run('DELETE FROM tickets WHERE id = ?', [id], function (err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    res.json({ success: true, message: 'Ticket cancelled' });
  });
});

// POST /api/trains - Create train (admin)
app.post('/api/trains', (req, res) => {
  const { name, origin, destination, seats_total } = req.body;

  db.run(`
    INSERT INTO trains (name, origin, destination, seats_total, seats_available) 
    VALUES (?, ?, ?, ?, ?)
  `, [name, origin, destination, seats_total, seats_total], function (err) {
    if (err) {
      res.status(500).json({ error: 'Database error' });
      return;
    }
    res.json({ success: true, trainId: this.lastID });
  });
});

// PUT /api/trains/:id - Update train (admin)
app.put('/api/trains/:id', (req, res) => {
  const { id } = req.params;
  const { name, origin, destination, seats_total, seats_available } = req.body;

  db.run(`
    UPDATE trains 
    SET name = ?, origin = ?, destination = ?, seats_total = ?, seats_available = ?
    WHERE id = ?
  `, [name, origin, destination, seats_total, seats_available, id], function (err) {
    if (err) {
      res.status(500).json({ error: 'Database error' });
      return;
    }
    res.json({ success: true });
  });
});

// DELETE /api/trains/:id - Delete train (admin)
app.delete('/api/trains/:id', (req, res) => {
  const { id } = req.params;

  // FIX BUG 5: Actually delete the train from the database
  db.run('DELETE FROM trains WHERE id = ?', [id], function (err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Train not found' });
    }
    res.json({ success: true, message: 'Train deleted' });
  });
});

app.listen(PORT, () => {
  console.log(`🚆 Train QA Demo Backend running on http://localhost:${PORT}`);
  console.log('✅ All bugs fixed on this branch!');
});