const pool = require('../config/db');

// GET /stores - list all stores with user's rating
const getStores = async (req, res) => {
  const { name, address, sortBy = 'name', order = 'ASC' } = req.query;
  const userId = req.user.id;

  const allowedSortFields = ['name', 'address', 'avg_rating'];
  const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'name';
  const sortOrder = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

  let query = `
    SELECT s.id, s.name, s.address, s.email,
      ROUND(AVG(r.rating), 2) AS avg_rating,
      COUNT(r.id) AS total_ratings,
      ur.rating AS user_rating
    FROM stores s
    LEFT JOIN ratings r ON r.store_id = s.id
    LEFT JOIN ratings ur ON ur.store_id = s.id AND ur.user_id = ?
    WHERE 1=1
  `;
  const params = [userId];

  if (name) { query += ' AND s.name LIKE ?'; params.push(`%${name}%`); }
  if (address) { query += ' AND s.address LIKE ?'; params.push(`%${address}%`); }

  query += ` GROUP BY s.id, ur.rating ORDER BY ${sortField} ${sortOrder}`;

  try {
    const [rows] = await pool.query(query, params);
    return res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error.' });
  }
};

// POST /stores/:id/ratings - submit or update rating
const submitRating = async (req, res) => {
  const { id: storeId } = req.params;
  const userId = req.user.id;
  const { rating } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Rating must be between 1 and 5.' });
  }

  try {
    const [store] = await pool.query('SELECT id FROM stores WHERE id = ?', [storeId]);
    if (store.length === 0) return res.status(404).json({ message: 'Store not found.' });

    // Upsert rating
    await pool.query(
      `INSERT INTO ratings (user_id, store_id, rating)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE rating = ?, updated_at = CURRENT_TIMESTAMP`,
      [userId, storeId, rating, rating]
    );

    return res.status(200).json({ message: 'Rating submitted successfully.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { getStores, submitRating };
