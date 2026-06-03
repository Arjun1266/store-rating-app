const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const pool = require('../config/db');

// Validation for admin adding users
const addUserValidation = [
  body('name').isLength({ min: 20, max: 60 }).withMessage('Name must be between 20 and 60 characters.'),
  body('email').isEmail().withMessage('Please provide a valid email.'),
  body('password')
    .isLength({ min: 8, max: 16 }).withMessage('Password must be 8-16 characters.')
    .matches(/[A-Z]/).withMessage('Password must include at least one uppercase letter.')
    .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('Password must include at least one special character.'),
  body('address').isLength({ max: 400 }).notEmpty().withMessage('Address is required (max 400 chars).'),
  body('role').isIn(['admin', 'normal_user', 'store_owner']).withMessage('Invalid role.'),
];

// Validation for adding stores
const addStoreValidation = [
  body('name').isLength({ min: 20, max: 60 }).withMessage('Store name must be between 20 and 60 characters.'),
  body('email').isEmail().withMessage('Please provide a valid store email.'),
  body('address').isLength({ max: 400 }).notEmpty().withMessage('Address is required (max 400 chars).'),
];

// GET /admin/dashboard - stats
const getDashboard = async (req, res) => {
  try {
    const [[{ totalUsers }]] = await pool.query("SELECT COUNT(*) AS totalUsers FROM users WHERE role != 'admin'");
    const [[{ totalStores }]] = await pool.query('SELECT COUNT(*) AS totalStores FROM stores');
    const [[{ totalRatings }]] = await pool.query('SELECT COUNT(*) AS totalRatings FROM ratings');

    return res.status(200).json({ totalUsers, totalStores, totalRatings });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error.' });
  }
};

// GET /admin/users - list all users with optional filters
const getUsers = async (req, res) => {
  const { name, email, address, role, sortBy = 'name', order = 'ASC' } = req.query;

  const allowedSortFields = ['name', 'email', 'address', 'role'];
  const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'name';
  const sortOrder = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

  let query = `
    SELECT u.id, u.name, u.email, u.address, u.role,
      ROUND(AVG(r.rating), 2) AS avg_rating
    FROM users u
    LEFT JOIN stores s ON s.owner_id = u.id
    LEFT JOIN ratings r ON r.store_id = s.id
    WHERE 1=1
  `;
  const params = [];

  if (name) { query += ' AND u.name LIKE ?'; params.push(`%${name}%`); }
  if (email) { query += ' AND u.email LIKE ?'; params.push(`%${email}%`); }
  if (address) { query += ' AND u.address LIKE ?'; params.push(`%${address}%`); }
  if (role) { query += ' AND u.role = ?'; params.push(role); }

  query += ` GROUP BY u.id ORDER BY u.${sortField} ${sortOrder}`;

  try {
    const [rows] = await pool.query(query, params);
    return res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error.' });
  }
};

// GET /admin/users/:id - single user detail
const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(`
      SELECT u.id, u.name, u.email, u.address, u.role,
        ROUND(AVG(r.rating), 2) AS avg_rating
      FROM users u
      LEFT JOIN stores s ON s.owner_id = u.id
      LEFT JOIN ratings r ON r.store_id = s.id
      WHERE u.id = ?
      GROUP BY u.id
    `, [id]);

    if (rows.length === 0) return res.status(404).json({ message: 'User not found.' });
    return res.status(200).json(rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error.' });
  }
};

// POST /admin/users - add new user
const addUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { name, email, password, address, role } = req.body;

  try {
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) return res.status(409).json({ message: 'Email already exists.' });

    const hashed = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashed, address, role]
    );

    return res.status(201).json({ message: 'User created successfully.', userId: result.insertId });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error.' });
  }
};

// GET /admin/stores - list all stores
const getStores = async (req, res) => {
  const { name, email, address, sortBy = 'name', order = 'ASC' } = req.query;

  const allowedSortFields = ['name', 'email', 'address', 'avg_rating'];
  const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'name';
  const sortOrder = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

  let query = `
    SELECT s.id, s.name, s.email, s.address,
      ROUND(AVG(r.rating), 2) AS avg_rating,
      COUNT(r.id) AS total_ratings
    FROM stores s
    LEFT JOIN ratings r ON r.store_id = s.id
    WHERE 1=1
  `;
  const params = [];

  if (name) { query += ' AND s.name LIKE ?'; params.push(`%${name}%`); }
  if (email) { query += ' AND s.email LIKE ?'; params.push(`%${email}%`); }
  if (address) { query += ' AND s.address LIKE ?'; params.push(`%${address}%`); }

  query += ` GROUP BY s.id ORDER BY ${sortField} ${sortOrder}`;

  try {
    const [rows] = await pool.query(query, params);
    return res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error.' });
  }
};

// POST /admin/stores - add new store
const addStore = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { name, email, address, owner_id } = req.body;

  try {
    const [existing] = await pool.query('SELECT id FROM stores WHERE email = ?', [email]);
    if (existing.length > 0) return res.status(409).json({ message: 'Store email already exists.' });

    if (owner_id) {
      const [owner] = await pool.query("SELECT id FROM users WHERE id = ? AND role = 'store_owner'", [owner_id]);
      if (owner.length === 0) return res.status(400).json({ message: 'Invalid store owner.' });
    }

    const [result] = await pool.query(
      'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
      [name, email, address, owner_id || null]
    );

    return res.status(201).json({ message: 'Store created successfully.', storeId: result.insertId });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = {
  getDashboard,
  getUsers,
  getUserById,
  addUser,
  addUserValidation,
  getStores,
  addStore,
  addStoreValidation,
};
