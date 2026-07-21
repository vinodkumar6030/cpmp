<div align="center">

# 🏪 Campus Marketplace

### Buy and sell used items within your campus — safe, simple, and student-only.

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-Visit_App-6d28d9?style=for-the-badge)](https://cpmp-five.vercel.app/)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/vinodkumar6030/cpmp)
[![React](https://img.shields.io/badge/React-Vite-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-4169E1?style=for-the-badge&logo=postgresql)](https://supabase.com/)

</div>

---

## 📸 Screenshots

### 🏠 Homepage — Browse & Filter Listings
![Homepage](assets/screenshots/homepage.png)

---

### 🛒 Product Listings (Desktop & Mobile)
![Product Listings](assets/screenshots/listings.png)

---

### 🔐 Authentication — Login & Register
| Login | Register |
|---|---|
| ![Login](assets/screenshots/login.png) | ![Register](assets/screenshots/register.png) |

---

### 📧 Email Verification Flow
| Step 1 — Check Your Email | Step 2 — Email Verified ✅ |
|---|---|
| ![Check Email](assets/screenshots/email_verify.png) | ![Email Verified](assets/screenshots/email_verified.png) |

---

### 📝 Create New Listing
![Create Listing](assets/screenshots/create_listing.png)

---

### 💬 Buyer-Seller Chat (Desktop & Mobile)
![Chat](assets/screenshots/chat.png)

---

### 📋 My Listings Dashboard
![My Listings](assets/screenshots/my_listings.png)

---

## 🎥 Demo Video

> 📹 **[Click here to watch the demo video](#)** *(Upload your screen recording here)*

<!-- To embed a video: Record screen → drag the .mp4 file into GitHub's README editor → replace the # link above with the generated GitHub URL -->

---

## ✨ Features

| Feature | Status |
|---|:---:|
| 🎓 College email registration (`.edu` / `.ac.in`) | ✅ |
| 📧 Email verification flow | ✅ |
| 🔑 JWT login / logout | ✅ |
| 🔒 Forgot / reset password | ✅ |
| 🛒 Product listings + image upload (up to 5 images) | ✅ |
| 🔍 Search + filter by category, price, condition | ✅ |
| 💬 Buyer-Seller real-time chat | ✅ |
| 📋 My Listings dashboard | ✅ |
| 🚩 Report a listing | ✅ |
| 🛡️ Admin panel (users, products, reports) | ✅ |
| 🔐 Protected routes (auth required) | ✅ |
| 📱 Responsive design (mobile + desktop) | ✅ |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18 + Vite, Axios, React Router |
| **Backend** | Node.js, Express.js |
| **Database** | PostgreSQL via Supabase |
| **ORM** | Prisma |
| **Auth** | JWT (JSON Web Tokens) |
| **Email** | Nodemailer (Ethereal in dev) |
| **File Upload** | Multer |
| **Deployment** | Vercel (Frontend) + Render (Backend) |

---

## 📁 Project Structure

```
cpmp/
├── backend/
│   ├── prisma/schema.prisma    # DB schema
│   ├── routes/                 # auth, users, products, messages, reports, admin
│   ├── middleware/             # JWT auth, multer upload
│   ├── utils/email.js          # Nodemailer
│   ├── uploads/                # Stores product images
│   └── server.js               # Express entry point
└── frontend/
    └── src/
        ├── pages/              # All 11 page components
        ├── components/         # Navbar, shared components
        ├── context/            # AuthContext (JWT)
        ├── api/axios.js        # Pre-configured Axios instance
        └── index.css           # Design system & global styles
```

---

## 🚀 Getting Started (Local Setup)

### Prerequisites
- **Node.js** v18+
- **PostgreSQL** (or use Supabase free tier)

### 1. Clone the repository

```bash
git clone https://github.com/vinodkumar6030/cpmp.git
cd cpmp
```

### 2. Configure Environment Variables

Create `backend/.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
JWT_SECRET="your_jwt_secret_key"
```

### 3. Run Database Migration

```bash
cd backend
npx prisma migrate dev --name init
```

### 4. Start the Backend

```bash
cd backend
node server.js
# API running at http://localhost:5000
```

### 5. Start the Frontend

```bash
cd frontend
npm install
npm run dev
# App running at http://localhost:5173
```

---

## 🔑 Admin Setup

After registering normally, run this SQL to promote a user to admin:

```sql
UPDATE "User" SET role = 'admin' WHERE email = 'your@email.edu';
```

---

## 🌐 Live Links

| Service | URL |
|---|---|
| 🌐 Frontend (Vercel) | https://cpmp-five.vercel.app/ |
| 🚀 Backend API (Render) | https://cpmp.onrender.com |
| 💻 GitHub Repository | https://github.com/vinodkumar6030/cpmp |

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first.

---

<div align="center">

**Made with ❤️ by [Vinod Kumar](https://github.com/vinodkumar6030)**

⭐ Star this repo if you find it useful!

</div>
