const express = require('express');
const router = express.Router();
const connection = require('../models/db');
const verifyAdmin = require('../middleware/verifyAdmin');

// Creating a new reservation - Public
router.post('/', (req, res) => {
    const { user_id, restaurant_id, date, time, people_count } = req.body;
  
    if (!user_id || !restaurant_id || !date || !time || !people_count) {
      return res.status(400).json({ error: 'All fields are required.' });
    }
  
    const sql = `
        INSERT INTO reservations (user_id, restaurant_id, date, time, people_count)
        VALUES (?, ?, ?, ?, ?)`;
  
    connection.execute(
      sql,
      [user_id, restaurant_id, date, time, people_count],
      (err) => {
        if (err) {
          console.error('Error creating reservation:', err);
          return res.status(500).json({ error: 'Database error.' });
        }
        res.status(201).json({ message: 'Reservation created successfully.' });
      }
    );
  });
  
/* Admin Displaying all Reseravtions */
router.get('/', verifyAdmin, (req, res) => {
    connection.execute(
      `SELECT r.*, u.name AS user_name, rest.name AS restaurant_name
       FROM reservations r
       JOIN users u    ON u.user_id    = r.user_id
       JOIN restaurants rest ON rest.restaurant_id = r.restaurant_id`,
      (err, rows) => {
        if (err) return res.status(500).json({ error: 'DB error' });
        res.json(rows);
      }
    );
  });
  
  /* User's Reservations */
  router.get('/user/:userId', (req, res) => {
    connection.execute(
      `SELECT r.*, rest.name AS restaurant_name
         FROM reservations r
         JOIN restaurants rest ON rest.restaurant_id = r.restaurant_id
        WHERE r.user_id = ?`,
      [req.params.userId],
      (err, rows) => {
        if (err) return res.status(500).json({ error: 'DB error' });
        res.json(rows);
      }
    );
  });

// Updating a reservation - Only as Admin
router.put('/:id', verifyAdmin, (req, res) => {
    const reservationId = req.params.id;
    const { date, time, people_count } = req.body;

    if (!date || !time || !people_count) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    const sql = `
        UPDATE reservations
        SET date = ?, time = ?, people_count = ?
        WHERE reservation_id = ?`;

    connection.execute(sql, [date, time, people_count, reservationId], (err, results) => {
        if (err) {
            console.error('Error updating reservation:', err);
            return res.status(500).json({ error: 'Database error.' });
        }

        res.status(200).json({ message: 'Reservation updated successfully.' });
    });
});

// Deleting a reservation - Only as Admin
router.delete('/:id', verifyAdmin, (req, res) => {
    const reservationId = req.params.id;

    connection.execute(
        'DELETE FROM reservations WHERE reservation_id = ?',
        [reservationId],
        (err, results) => {
            if (err) {
                console.error('Error deleting reservation:', err);
                return res.status(500).json({ error: 'Database error.' });
            }

            res.status(200).json({ message: 'Reservation deleted successfully.' });
        }
    );
});

module.exports = router;
