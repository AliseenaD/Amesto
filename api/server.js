const dotenv = require('dotenv');
dotenv.config();  // Load environment variables
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const userRoutes = require('./routes/usersRoutes');
const productRoutes = require('./routes/productsRoutes');
const orderRoutes = require('./routes/orderHistoryRoutes');

const app = express();

// Ping connection
app.get('/api/ping', (req, res) => {
  res.send('pong');
});

// Apply CORS middleware
app.use(cors());

// Other middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB();

// Use user routes
app.use('/api/users', userRoutes);

// Use products routes
app.use('/api/products', productRoutes);

// Use order history routes
app.use('/api/orders', orderRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


