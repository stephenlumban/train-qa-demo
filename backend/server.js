const express = require('express');
const cors = require('cors');
const { db, initDatabase } = require('./database');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

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

// POST /api/tickets - Book a ticket (BUGGY - intentional for QA)
app.post('/api/tickets', async (req, res) => {
  const { passenger_name, train_id, seat_count } = req.body;
  
  // BUG 1: Missing validation - should reject empty names and negative seat counts
  // BUG 6: Always returns 200 even for invalid requests
  
  // BUG 2: Seat count not updating - missing logic to decrease seats_available
  try {
    const result = await db.execute({
      sql: 'INSERT INTO tickets (passenger_name, train_id, seat_count) VALUES (?, ?, ?)',
      args: [passenger_name, train_id, seat_count]
    });
    
    // Should update seats_available here but it's missing (BUG 2)
    // Correct code would be:
    // await db.execute({ sql: 'UPDATE trains SET seats_available = seats_available - ? WHERE id = ?', args: [seat_count, train_id] });
    
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

// DELETE /api/tickets/:id - Cancel ticket (BUGGY)
app.delete('/api/tickets/:id', async (req, res) => {
  const { id } = req.params;
  
  // BUG 3: Cancel ticket button broken - this endpoint doesn't actually delete
  // It just returns success without doing anything
  
  // Correct code would be:
  // await db.execute({ sql: 'DELETE FROM tickets WHERE id = ?', args: [id] });
  
  // But instead we just return success (broken)
  res.json({ success: true, message: 'Ticket cancelled' });
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

// DELETE /api/trains/:id - Delete train (BUGGY)
app.delete('/api/trains/:id', async (req, res) => {
  const { id } = req.params;
  
  // BUG 5: Delete train API broken - doesn't actually delete from database
  // Correct code would be:
  // await db.execute({ sql: 'DELETE FROM trains WHERE id = ?', args: [id] });
  
  // But instead we just return success without deleting (broken)
  res.json({ success: true, message: 'Train deleted' });
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