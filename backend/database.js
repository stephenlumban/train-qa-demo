const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.env.NODE_ENV === 'test' ? ':memory:' : path.join(__dirname, 'trains.db');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
function initDatabase() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Create trains table
      db.run(`
        CREATE TABLE IF NOT EXISTS trains (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          origin TEXT NOT NULL,
          destination TEXT NOT NULL,
          seats_total INTEGER NOT NULL,
          seats_available INTEGER NOT NULL
        )
      `);

      // Create tickets table
      db.run(`
        CREATE TABLE IF NOT EXISTS tickets (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          passenger_name TEXT NOT NULL,
          train_id INTEGER NOT NULL,
          seat_count INTEGER NOT NULL,
          FOREIGN KEY (train_id) REFERENCES trains (id)
        )
      `);

      // Seed with initial train data
      db.run("DELETE FROM trains"); // Clear existing data
      db.run("DELETE FROM tickets");
      
      const trains = [
        { name: 'Express A1', origin: 'Tokyo', destination: 'Osaka', seats_total: 100, seats_available: 40 },
        { name: 'Eurostar B2', origin: 'Paris', destination: 'Berlin', seats_total: 80, seats_available: 20 },
        { name: 'Bullet C3', origin: 'New York', destination: 'Boston', seats_total: 120, seats_available: 75 },
        { name: 'Orient D4', origin: 'London', destination: 'Istanbul', seats_total: 60, seats_available: 15 }
      ];

      let completed = 0;
      trains.forEach((train, index) => {
        db.run(`
          INSERT INTO trains (name, origin, destination, seats_total, seats_available) 
          VALUES (?, ?, ?, ?, ?)
        `, [train.name, train.origin, train.destination, train.seats_total, train.seats_available], (err) => {
          if (err) reject(err);
          completed++;
          if (completed === trains.length) {
            resolve();
          }
        });
      });
    });
  });
}

module.exports = { db, initDatabase };