
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// MySQL Connection Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'password_manager',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Initialize Database
async function initDB() {
  try {
    // First create the database if it doesn't exist
    const tempPool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
    
    await tempPool.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'password_manager'}`);
    await tempPool.end();
    
    // Now create the tables
    const conn = await pool.getConnection();
    await conn.query(`
      CREATE TABLE IF NOT EXISTS passwords (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        login VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        url VARCHAR(255),
        modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    conn.release();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

// Initialize DB when server starts
initDB();

// API endpoints
app.get('/api/passwords', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM passwords');
    
    // Convert MySQL timestamp to string format
    const passwords = rows.map(row => ({
      ...row,
      modified: new Date(row.modified).toLocaleString()
    }));
    
    res.json(passwords);
  } catch (error) {
    console.error('Error fetching passwords:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/passwords', async (req, res) => {
  try {
    const { title, login, password, url } = req.body;
    const id = uuidv4();
    
    if (!title || !login || !password) {
      return res.status(400).json({ message: 'Title, login and password are required' });
    }
    
    await pool.query(
      'INSERT INTO passwords (id, title, login, password, url) VALUES (?, ?, ?, ?, ?)',
      [id, title, login, password, url || '']
    );
    
    const [rows] = await pool.query('SELECT * FROM passwords WHERE id = ?', [id]);
    
    // Convert MySQL timestamp to string format
    const newPassword = {
      ...rows[0],
      modified: new Date(rows[0].modified).toLocaleString()
    };
    
    res.status(201).json(newPassword);
  } catch (error) {
    console.error('Error creating password:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.put('/api/passwords/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, login, password, url } = req.body;
    
    if (!title || !login || !password) {
      return res.status(400).json({ message: 'Title, login and password are required' });
    }
    
    await pool.query(
      'UPDATE passwords SET title = ?, login = ?, password = ?, url = ? WHERE id = ?',
      [title, login, password, url || '', id]
    );
    
    const [rows] = await pool.query('SELECT * FROM passwords WHERE id = ?', [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Password not found' });
    }
    
    // Convert MySQL timestamp to string format
    const updatedPassword = {
      ...rows[0],
      modified: new Date(rows[0].modified).toLocaleString()
    };
    
    res.json(updatedPassword);
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.delete('/api/passwords/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await pool.query('DELETE FROM passwords WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Password not found' });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting password:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
