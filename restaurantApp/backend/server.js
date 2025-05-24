const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const connection = require('./models/db');
const restaurantRoutes = require('./routes/restaurantRoutes');
const reservationRoutes = require('./routes/reservationRoutes');

const app = express();
const port = 5000;

app.use(cors());

app.use(express.json());
app.use('/restaurants', restaurantRoutes);
app.use('/reservations', reservationRoutes);

// Checking server status
app.get('/', (req, res) => {
  res.send('API is running!');
});

// Signup endpoint
app.post('/signup', (req, res) => {
  const { name, email, password, role = 'user' } = req.body; 

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  connection.execute('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database Error.' });
    }

    if (results.length > 0) {
      return res.status(400).json({ error: 'User already exists.' });
    }

    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        return res.status(500).json({ error: 'Error hashing password.' });
      }

      connection.execute(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        [name, email, hashedPassword, role],
        (err, results) => {
          if (err) {
            return res.status(500).json({ error: 'Database Error.' });
          }

          res.status(201).json({ message: 'User created successfully.' });
        }
      );
    });
  });
});

// Login endpoint 
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  connection.execute('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database Error.' });
    }

    if (results.length === 0) {
      return res.status(400).json({ error: 'User not found.' });
    }

    const user = results[0];

    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        return res.status(500).json({ error: 'Error comparing passwords.' });
      }

      if (!isMatch) {
        return res.status(400).json({ error: 'Invalid password.' });
      }

      // Creating JWT token with login
      const token = jwt.sign(
        {
          userId: user.user_id,
          email: user.email,
          role: user.role 
        },
        'your_jwt_secret_key',
        { expiresIn: '1h' }
      );

      res.status(200).json({
        message: 'Login successful',
        token
      });
    });
  });
});

// Listening port for server
app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running at http://192.168.1.37:${port}`);
});
