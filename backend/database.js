const { createClient } = require('@libsql/client');
const path = require('path');

// If deploying to Vercel, it uses the environment variables. Otherwise defaults to a local SQLite file.
const dbUrl = process.env.TURSO_DATABASE_URL || `file:${path.join(__dirname, 'trains.db')}`;
const dbAuthToken = process.env.TURSO_AUTH_TOKEN || undefined;

const db = createClient({
  url: dbUrl,
  authToken: dbAuthToken
});

// Initialize database tables
async function initDatabase() {
  try {
    // Create trains table
    await db.execute(`
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
    await db.execute(`
      CREATE TABLE IF NOT EXISTS tickets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        passenger_name TEXT NOT NULL,
        train_id INTEGER NOT NULL,
        seat_count INTEGER NOT NULL,
        FOREIGN KEY (train_id) REFERENCES trains (id)
      )
    `);

    // Check if trains exist, if not, seed data
    const res = await db.execute("SELECT COUNT(*) as count FROM trains");
    const count = res.rows[0].count || res.rows[0]['COUNT(*)'] || 0;
    
    if (count === 0) {
      console.log("Seeding initial train data...");
      const trains = [
        { name: 'Express A1', origin: 'Tokyo', destination: 'Osaka', seats_total: 100, seats_available: 40 },
        { name: 'Eurostar B2', origin: 'Paris', destination: 'Berlin', seats_total: 80, seats_available: 20 },
        { name: 'Bullet C3', origin: 'New York', destination: 'Boston', seats_total: 120, seats_available: 75 },
        { name: 'Orient D4', origin: 'London', destination: 'Istanbul', seats_total: 60, seats_available: 15 }
      ];

      for (const train of trains) {
        await db.execute({
          sql: `
            INSERT INTO trains (name, origin, destination, seats_total, seats_available) 
            VALUES (?, ?, ?, ?, ?)
          `,
          args: [train.name, train.origin, train.destination, train.seats_total, train.seats_available]
        });
      }
    }
  } catch (error) {
    console.error("Failed to initialize database", error);
  }
}

module.exports = { db, initDatabase };