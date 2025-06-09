const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Initialize database
const db = new Database('vino.db');

// Drop existing tables to ensure clean state
db.exec(`
  DROP TABLE IF EXISTS labels;
  DROP TABLE IF EXISTS wines;
  DROP TABLE IF EXISTS grapes;
`);

// Create tables with correct schema
db.exec(`
  CREATE TABLE grapes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL
  );

  CREATE TABLE wines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    vintage INTEGER NOT NULL,
    producer TEXT NOT NULL,
    cost REAL NOT NULL,
    rating INTEGER NOT NULL,
    type TEXT NOT NULL,
    grape_id INTEGER,
    quantity INTEGER DEFAULT 0,
    country TEXT NOT NULL,
    FOREIGN KEY (grape_id) REFERENCES grapes(id)
  );

  CREATE TABLE labels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    wine_id INTEGER,
    label TEXT NOT NULL,
    FOREIGN KEY (wine_id) REFERENCES wines(id)
  );
`);

// Insert sample grape varieties
const grapeVarieties = [
  'Cabernet Sauvignon',
  'Merlot',
  'Pinot Noir',
  'Chardonnay',
  'Sauvignon Blanc',
  'Syrah',
  'Malbec',
  'Zinfandel'
];

const insertGrape = db.prepare('INSERT INTO grapes (name) VALUES (?)');
for (const grape of grapeVarieties) {
  insertGrape.run(grape);
}

// Insert sample wines
const sampleWines = [
  {
    name: 'Château Margaux',
    vintage: 2015,
    producer: 'Château Margaux',
    cost: 850.00,
    rating: 98,
    type: 'Red',
    grape_id: 1, // Cabernet Sauvignon
    quantity: 2,
    country: 'France',
    labels: ['Bordeaux', 'First Growth']
  },
  {
    name: 'Domaine de la Romanée-Conti',
    vintage: 2018,
    producer: 'Domaine de la Romanée-Conti',
    cost: 15000.00,
    rating: 100,
    type: 'Red',
    grape_id: 3, // Pinot Noir
    quantity: 1,
    country: 'France',
    labels: ['Burgundy', 'Grand Cru']
  },
  {
    name: 'Opus One',
    vintage: 2016,
    producer: 'Opus One Winery',
    cost: 350.00,
    rating: 95,
    type: 'Red',
    grape_id: 1, // Cabernet Sauvignon
    quantity: 3,
    country: 'United States',
    labels: ['Napa Valley', 'Bordeaux Blend']
  }
];

const insertWine = db.prepare(`
  INSERT INTO wines (name, vintage, producer, cost, rating, type, grape_id, quantity, country)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const insertLabel = db.prepare(`
  INSERT INTO labels (wine_id, label)
  VALUES (?, ?)
`);

for (const wine of sampleWines) {
  const result = insertWine.run(
    wine.name,
    wine.vintage,
    wine.producer,
    wine.cost,
    wine.rating,
    wine.type,
    wine.grape_id,
    wine.quantity,
    wine.country
  );
  
  const wineId = result.lastInsertRowid;
  
  for (const label of wine.labels) {
    insertLabel.run(wineId, label);
  }
}

// Get all grapes
app.get('/api/grapes', (req, res) => {
  try {
    const grapes = db.prepare('SELECT * FROM grapes ORDER BY name').all();
    res.json(grapes);
  } catch (error) {
    console.error('Error getting grapes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add new grape
app.post('/api/grapes', (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Grape name is required' });
  }

  try {
    const result = db.prepare('INSERT INTO grapes (name) VALUES (?)').run(name);
    res.json({ id: result.lastInsertRowid, name });
  } catch (error) {
    console.error('Error adding grape:', error);
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      res.status(400).json({ error: 'Grape already exists' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// Get all wines
app.get('/api/wines', (req, res) => {
  try {
    const wines = db.prepare(`
      SELECT wines.*, grapes.name as grape_name,
             GROUP_CONCAT(labels.label) as label_list
      FROM wines
      LEFT JOIN grapes ON wines.grape_id = grapes.id
      LEFT JOIN labels ON wines.id = labels.wine_id
      GROUP BY wines.id
    `).all();

    // Process the results
    const processedWines = wines.map(wine => ({
      ...wine,
      labels: wine.label_list ? wine.label_list.split(',') : [],
      grape: wine.grape_name
    }));

    res.json(processedWines);
  } catch (error) {
    console.error('Error getting wines:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add a new wine
app.post('/api/wines', (req, res) => {
  const { name, vintage, producer, cost, rating, type, grape_id, labels } = req.body;
  
  // Validate required fields
  if (!name || !vintage || !producer || !cost || !rating || !type || !grape_id) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    // Start a transaction
    const insertWine = db.prepare(`
      INSERT INTO wines (name, vintage, producer, cost, rating, type, grape_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insertWine.run(name, vintage, producer, cost, rating, type, grape_id);
    const wineId = result.lastInsertRowid;

    // Insert labels if any
    if (labels && labels.length > 0) {
      const insertLabel = db.prepare(`
        INSERT INTO labels (wine_id, label)
        VALUES (?, ?)
      `);

      for (const label of labels) {
        insertLabel.run(wineId, label);
      }
    }

    // Get the complete wine data
    const wine = db.prepare(`
      SELECT wines.*, grapes.name as grape_name,
             GROUP_CONCAT(labels.label) as label_list
      FROM wines
      LEFT JOIN grapes ON wines.grape_id = grapes.id
      LEFT JOIN labels ON wines.id = labels.wine_id
      WHERE wines.id = ?
      GROUP BY wines.id
    `).get(wineId);

    // Format the response
    const formattedWine = {
      ...wine,
      labels: wine.label_list ? wine.label_list.split(',') : [],
      grape: wine.grape_name
    };

    res.json(formattedWine);
  } catch (error) {
    console.error('Error adding wine:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update wine
app.put('/api/wines/:id', (req, res) => {
  const { id } = req.params;
  const { name, vintage, producer, cost, rating, type, grape_id, labels } = req.body;

  // Validate required fields
  if (!name || !vintage || !producer || !cost || !rating || !type || !grape_id) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    // Update wine
    db.prepare(`
      UPDATE wines
      SET name = ?, vintage = ?, producer = ?, cost = ?, rating = ?, type = ?, grape_id = ?
      WHERE id = ?
    `).run(name, vintage, producer, cost, rating, type, grape_id, id);

    // Update labels
    db.prepare('DELETE FROM labels WHERE wine_id = ?').run(id);

    if (labels && labels.length > 0) {
      const labelStmt = db.prepare(`
        INSERT INTO labels (wine_id, label)
        VALUES (?, ?)
      `);

      for (const label of labels) {
        labelStmt.run(id, label);
      }
    }

    // Get the updated wine data
    const wine = db.prepare(`
      SELECT wines.*, grapes.name as grape_name,
             GROUP_CONCAT(labels.label) as label_list
      FROM wines
      LEFT JOIN grapes ON wines.grape_id = grapes.id
      LEFT JOIN labels ON wines.id = labels.wine_id
      WHERE wines.id = ?
      GROUP BY wines.id
    `).get(id);

    // Format the response
    const formattedWine = {
      ...wine,
      labels: wine.label_list ? wine.label_list.split(',') : [],
      grape: wine.grape_name
    };

    res.json(formattedWine);
  } catch (error) {
    console.error('Error updating wine:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete wine
app.delete('/api/wines/:id', (req, res) => {
  const { id } = req.params;
  try {
    db.prepare('DELETE FROM wines WHERE id = ?').run(id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting wine:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
}); 