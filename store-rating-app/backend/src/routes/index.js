const express = require('express');
const router = express.Router();

const { authenticate, authorizeRoles } = require('../middleware/auth');
const {
  signup, login, updatePassword, signupValidation,
} = require('../controllers/authController');
const {
  getDashboard, getUsers, getUserById, addUser, addUserValidation,
  getStores: adminGetStores, addStore, addStoreValidation,
} = require('../controllers/adminController');
const { getStores, submitRating } = require('../controllers/storeController');
const { getOwnerDashboard } = require('../controllers/ownerController');

// ─── Auth Routes ─────────────────────────────────────────────
router.post('/auth/signup', signupValidation, signup);
router.post('/auth/login', login);
router.put('/auth/password', authenticate, updatePassword);

// ─── Admin Routes ─────────────────────────────────────────────
router.get('/admin/dashboard', authenticate, authorizeRoles('admin'), getDashboard);
router.get('/admin/users', authenticate, authorizeRoles('admin'), getUsers);
router.get('/admin/users/:id', authenticate, authorizeRoles('admin'), getUserById);
router.post('/admin/users', authenticate, authorizeRoles('admin'), addUserValidation, addUser);
router.get('/admin/stores', authenticate, authorizeRoles('admin'), adminGetStores);
router.post('/admin/stores', authenticate, authorizeRoles('admin'), addStoreValidation, addStore);

// ─── Normal User Routes ────────────────────────────────────────
router.get('/stores', authenticate, authorizeRoles('normal_user', 'admin'), getStores);
router.post('/stores/:id/ratings', authenticate, authorizeRoles('normal_user'), submitRating);

// ─── Store Owner Routes ────────────────────────────────────────
router.get('/owner/dashboard', authenticate, authorizeRoles('store_owner'), getOwnerDashboard);

module.exports = router;
