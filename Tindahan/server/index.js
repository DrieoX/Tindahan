const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

// Simple in-memory "DB" first (later we’ll hook to SQLite)
let inventory = [
  { id: 1, name: 'Item A', quantity: 10 },
  { id: 2, name: 'Item B', quantity: 20 },
];

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Routes
app.get('/inventory', (req, res) => {
  res.json(inventory);
});

app.post('/resupply', (req, res) => {
  const { id, quantity } = req.body;
  const item = inventory.find((i) => i.id === id);
  if (item) {
    item.quantity += quantity;
    res.json({ success: true, item });
  } else {
    res.status(404).json({ success: false, message: 'Item not found' });
  }
});

app.post('/sales', (req, res) => {
  const { id, quantity } = req.body;
  const item = inventory.find((i) => i.id === id);
  if (item && item.quantity >= quantity) {
    item.quantity -= quantity;
    res.json({ success: true, item });
  } else {
    res.status(400).json({ success: false, message: 'Not enough stock or item not found' });
  }
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});
