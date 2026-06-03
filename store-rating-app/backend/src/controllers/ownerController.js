const pool = require('../config/db');

// GET /owner/dashboard - store owner's dashboard
const getOwnerDashboard = async (req, res) => {
  const ownerId = req.user.id;

  try {
    // Get store owned by this user
    const [stores] = await pool.query('SELECT * FROM stores WHERE owner_id = ?', [ownerId]);
    if (stores.length === 0) {
      return res.status(404).json({ message: 'No store found for this owner.' });
    }

    const store = stores[0];

    // Get average rating
    const [[{ avg_rating, total_ratings }]] = await pool.query(
      'SELECT ROUND(AVG(rating), 2) AS avg_rating, COUNT(*) AS total_ratings FROM ratings WHERE store_id = ?',
      [store.id]
    );

    // Get list of users who rated this store, with their rating
    const [raters] = await pool.query(
      `SELECT u.id, u.name, u.email, r.rating, r.updated_at AS rated_at
       FROM ratings r
       JOIN users u ON u.id = r.user_id
       WHERE r.store_id = ?
       ORDER BY r.updated_at DESC`,
      [store.id]
    );

    return res.status(200).json({
      store: { ...store, avg_rating, total_ratings },
      raters,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { getOwnerDashboard };
