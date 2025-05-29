const express = require('express');
const router = express.Router();
const connection = require('../models/db');
const verifyAdmin = require('../middleware/verifyAdmin');

/* Getting all restaurants. */
router.get('/', (req, res) => {
  connection.execute('SELECT * FROM restaurants', (err, rows) => {
    if (err) {
      console.error('Error fetching restaurants:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.status(200).json(rows);
  });
});

/* Inserting in restaurants -Only Admin- */
router.post('/', verifyAdmin, (req, res) => {
  const { name, location, description } = req.body;

  if (!name || !location || !description) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  const sql =
    'INSERT INTO restaurants (name, location, description) VALUES (?, ?, ?)';

  connection.execute(sql, [name, location, description], (err, result) => {
    if (err) {
      console.error('Error inserting restaurant:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    res.status(201).json({
      message: 'Restaurant added successfully',
      id: result.insertId, // για άμεση ενημέρωση του frontend
    });
  });
});

/* Updating restaurants -Only Admin- */
router.put('/:id', verifyAdmin, (req, res) => {
  const { id } = req.params;
  const { name, location, description } = req.body;

  if (!name || !location || !description) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  const sql =
    'UPDATE restaurants SET name = ?, location = ?, description = ? WHERE restaurant_id = ?';

  connection.execute(sql, [name, location, description, id], (err, result) => {
    if (err) {
      console.error('Error updating restaurant:', err);
      return res.status(500).json({ error: 'Database error.' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Restaurant not found.' });
    }

    res.status(200).json({ message: 'Restaurant updated successfully.' });
  });
});

/* Deleting restaurants -Only Admin- */
router.delete('/:id', verifyAdmin, (req, res) => {
  const { id } = req.params;

  connection.execute(
    'DELETE FROM restaurants WHERE restaurant_id = ?',
    [id],
    (err, result) => {
      if (err) {
        console.error('Error deleting restaurant:', err);
        return res.status(500).json({ error: 'Database error.' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Restaurant not found.' });
      }

      res.status(200).json({ message: 'Restaurant deleted successfully.' });
    }
  );
});

module.exports = router;
