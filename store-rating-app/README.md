# StoreRate — Full Stack Intern Coding Challenge
> Built with Express.js + MySQL + React

---

## 🏗️ Project Structure

```
store-rating-app/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js           # MySQL connection pool
│   │   │   └── schema.sql      # Database schema + default admin
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── adminController.js
│   │   │   ├── storeController.js
│   │   │   └── ownerController.js
│   │   ├── middleware/
│   │   │   └── auth.js         # JWT authentication middleware
│   │   ├── routes/
│   │   │   └── index.js        # All API routes
│   │   └── index.js            # Express app entry point
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.js
    │   │   ├── ProtectedRoute.js
    │   │   └── StarRating.js
    │   ├── context/
    │   │   └── AuthContext.js
    │   ├── pages/
    │   │   ├── Login.js
    │   │   ├── Signup.js
    │   │   ├── UpdatePassword.js
    │   │   ├── AdminDashboard.js
    │   │   ├── AdminUsers.js
    │   │   ├── AdminUserDetail.js
    │   │   ├── AdminStores.js
    │   │   ├── UserStores.js
    │   │   └── OwnerDashboard.js
    │   ├── utils/
    │   │   └── api.js           # Axios instance with JWT interceptor
    │   ├── App.js
    │   ├── index.js
    │   └── index.css
    └── package.json
```

---

## ⚙️ Setup Instructions

### Step 1 — Database Setup (MySQL Workbench)

1. Open **MySQL Workbench 8.0**
2. Connect to your local MySQL server
3. Open a new SQL tab
4. Open and run the file: `backend/src/config/schema.sql`
   - This creates the database, all tables, and a default admin user

### Step 2 — Backend Setup

1. Open a terminal (CMD or PowerShell) in the `backend/` folder
2. Copy the env file and edit it:
   ```
   copy .env.example .env
   ```
3. Open `.env` and update your MySQL password:
   ```
   DB_PASSWORD=your_actual_mysql_password
   ```
4. Install dependencies:
   ```
   npm install
   ```
5. Start the backend:
   ```
   npm start
   ```
   Server runs at: **http://localhost:5000**

### Step 3 — Frontend Setup

1. Open a **new terminal** in the `frontend/` folder
2. Install dependencies:
   ```
   npm install
   ```
3. Start the React app:
   ```
   npm start
   ```
   App runs at: **http://localhost:3000**

---

## 🔑 Default Admin Login

| Field    | Value                  |
|----------|------------------------|
| Email    | admin@storerating.com  |
| Password | Admin@1234             |

> ⚠️ Change the admin password after first login!

---

## 👥 User Roles & Access

| Role         | Capabilities |
|-------------|-------------|
| **Admin**   | Dashboard stats, manage users (add/view/filter), manage stores (add/view/filter), view user details |
| **Normal User** | Register/login, browse all stores, search by name/address, submit & modify ratings |
| **Store Owner** | Login, view own store's average rating, see list of users who rated their store |

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/auth/signup` | Public |
| POST | `/api/auth/login` | Public |
| PUT | `/api/auth/password` | All logged-in users |

### Admin
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/admin/dashboard` | Admin |
| GET | `/api/admin/users` | Admin |
| GET | `/api/admin/users/:id` | Admin |
| POST | `/api/admin/users` | Admin |
| GET | `/api/admin/stores` | Admin |
| POST | `/api/admin/stores` | Admin |

### Stores (Normal User)
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/stores` | Normal User, Admin |
| POST | `/api/stores/:id/ratings` | Normal User |

### Store Owner
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/owner/dashboard` | Store Owner |

---

## ✅ Form Validations

- **Name**: 20–60 characters
- **Address**: Max 400 characters
- **Password**: 8–16 chars, min 1 uppercase + 1 special character
- **Email**: Standard email format

---

## 🛠 Tech Stack

- **Backend**: Node.js + Express.js
- **Database**: MySQL 8.0
- **Authentication**: JWT (jsonwebtoken) + bcryptjs
- **Frontend**: React 18 + React Router v6
- **HTTP Client**: Axios
