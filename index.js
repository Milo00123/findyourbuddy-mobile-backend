require('dotenv').config();
const express = require('express');
const db = require('./db');
const app = express();

app.get('/', async (req, res) => {
    try {
      const result = await db.query('SELECT * FROM users');
      res.json(result.rows);
    } catch (err) {
      console.error(err.stack);
      res.status(500).send('Internal Server Error');
    }
  });
  console.log("Password type:", typeof process.env.PG_PASSWORD);

app.listen(3000, () => {
  console.log('Server is running on port 3000 buddy');
});

