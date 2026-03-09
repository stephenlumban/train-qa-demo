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

// POST /api/tickets - Book a ticket (BUGGY - intentional for QA)
app.post('/api/tickets', async (req, res) => {
  const { passenger_name, train_id, seat_count } = req.body;
  
  // BUG 1: Missing validation - should reject empty names and negative seat counts
  // BUG 6: Always returns 200 even for invalid requests
  
  // BUG 2: Seat count not updating - missing logic to decrease seats_available
  db.run(
    'INSERT INTO tickets (passenger_name, train_id, seat_count) VALUES (?, ?, ?)',
    [passenger_name, train_id, seat_count],
    function(err) {
      if (err) {
        res.status(500).json({ error: 'Database error' });
        return;
      }
      
      // Should update seats_available here but it's missing (BUG 2)
      // Correct code would be:
      // db.run('UPDATE trains SET seats_available = seats_available - ? WHERE id = ?', 
      //        [seat_count, train_id]);
      
      res.json({ success: true, ticketId: this.lastID });
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

// DELETE /api/tickets/:id - Cancel ticket (BUGGY)
app.delete('/api/tickets/:id', (req, res) => {
  const { id } = req.params;
  
  // BUG 3: Cancel ticket button broken - this endpoint doesn't actually delete
  // It just returns success without doing anything
  
  // Correct code would be:
  // db.run('DELETE FROM tickets WHERE id = ?', [id], function(err) { ... });
  
  // But instead we just return success (broken)
  res.json({ success: true, message: 'Ticket cancelled' });
});

// POST /api/trains - Create train (admin)
app.post('/api/trains', (req, res) => {
  const { name, origin, destination, seats_total } = req.body;
  
  db.run(`
    INSERT INTO trains (name, origin, destination, seats_total, seats_available) 
    VALUES (?, ?, ?, ?, ?)
  `, [name, origin, destination, seats_total, seats_total], function(err) {
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
  `, [name, origin, destination, seats_total, seats_available, id], function(err) {
    if (err) {
      res.status(500).json({ error: 'Database error' });
      return;
    }
    res.json({ success: true });
  });
});

// DELETE /api/trains/:id - Delete train (BUGGY)
app.delete('/api/trains/:id', (req, res) => {
  const { id } = req.params;
  
  // BUG 5: Delete train API broken - doesn't actually delete from database
  // Correct code would be:
  // db.run('DELETE FROM trains WHERE id = ?', [id], function(err) { ... });
  
  // But instead we just return success without deleting (broken)
  res.json({ success: true, message: 'Train deleted' });
});

app.listen(PORT, () => {
  console.log(`🚆 Train QA Demo Backend running on http://localhost:${PORT}`);
  console.log('📋 Intentional bugs included for QA testing!');
});