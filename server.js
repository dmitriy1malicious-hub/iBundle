require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { setupSwagger } = require('./swagger');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
setupSwagger(app, PORT);

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Express server is running!' });
});

// Shipment endpoints
app.use(require('./routes/pricing'));
app.use(require('./routes/labels'));
app.use(require('./routes/listShipments'));
app.use(require('./routes/getLabel'));
app.use(require('./routes/getShipment'));
app.use(require('./routes/cancelShipment'));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
