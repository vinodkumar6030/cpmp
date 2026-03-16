# Campus Marketplace 🏪

A full-stack campus-only marketplace for buying and selling used products. Built with **React + Vite**, **Node.js/Express**, and **MySQL (Prisma ORM)**.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18+
- **MySQL** server running locally

---

## ⚙️ Step 1 — Configure the Database

Open `backend/.env` and update the `DATABASE_URL` with **your** MySQL credentials:

```
DATABASE_URL="mysql://YOUR_USERNAME:YOUR_PASSWORD@localhost:3306/campus_marketplace"
```

**Example** (default MySQL root with no password):
```
DATABASE_URL="mysql://root:@localhost:3306/campus_marketplace"
```

> ✅ Make sure you have a MySQL database named `campus_marketplace`. Create it with:
> ```sql
> CREATE DATABASE campus_marketplace;
> ```

---

## 📦 Step 2 — Run Database Migration

```bash
cd "D:\vinod laptop data\cpmp\backend"
npx prisma migrate dev --name init
```

This creates all tables (Users, Products, Messages, Reports).

---

## ▶️ Step 3 — Start the Backend

```bash
cd "D:\vinod laptop data\cpmp\backend"
node server.js
```

> 🚀 API running at **https://cpmp.onrender.com**

Email verification links are **printed to the console** during development (Ethereal SMTP — no real email needed).

---

## 💻 Step 4 — Start the Frontend

Open a **new terminal**:

```bash
cd "D:\vinod laptop data\cpmp\frontend"
npm run dev
```

> 🌐 App running at **http://localhost:5173**

---

## 🎓 Create First Admin User

After registering normally, run this SQL to promote a user to admin:

```sql
UPDATE User SET role = 'admin' WHERE email = 'your@email.edu';
```

---

## 📁 Project Structure

```
cpmp/
├── backend/
│   ├── prisma/schema.prisma    # DB schema
│   ├── routes/                 # auth, users, products, messages, reports, admin
│   ├── middleware/             # JWT auth, multer upload
│   ├── utils/email.js          # Nodemailer (Ethereal)
│   ├── uploads/                # Auto-created; stores images
│   └── server.js              # Express entry point
└── frontend/
    └── src/
        ├── pages/              # All 11 page components
        ├── components/         # Navbar
        ├── context/            # AuthContext (JWT)
        ├── api/axios.js        # Pre-configured Axios
        └── index.css           # Design system
```

---

## 🔑 Features

| Feature | Status |
|---|---|
| College email registration (.edu / .ac.in) | ✅ |
| Email verification (console link in dev) | ✅ |
| JWT login / logout | ✅ |
| Forgot / reset password | ✅ |
| Product listings + image upload | ✅ |
| Search + filter by category, price, condition | ✅ |
| Buyer-Seller chat (5-second polling) | ✅ |
| My Listings dashboard | ✅ |
| Report a listing | ✅ |
| Admin panel (users, products, reports) | ✅ |
| Protected routes (auth required) | ✅ |
| Responsive design (mobile + desktop) | ✅ |
