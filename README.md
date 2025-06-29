# 🦊 Tutofox — Course Selling Platform

**Tutofox** is a full-stack web application that allows admins to create and manage courses, while users can browse, purchase, and view their enrolled content. This is a monorepo containing both the backend and frontend in a single repository.

---

## 📁 Project Structure

```bash
tutofox/
├── backend/ # Express backend
│ ├── database/ # Mongoose models and MongoDB connection
│ │ └── index.js 
│ ├── middlewares/ # Authentication logic
│ │ ├── adminAuth.js 
│ │ └── userAuth.js 
│ ├── routes/ # REST API routes
│ │ ├── admin.js 
│ │ ├── course.js 
│ │ └── user.js 
│ ├── .env 
│ ├── index.js # Entry point for Express app
│ ├── package.json 
│ └── package-lock.json 
│
├── frontend/ # Frontend folder
│ └── ... # Frontend files will go here
```


---

## 🚀 Features

- 🔐 Admin authentication and course creation
- 👤 User registration, login, and course purchasing
- 🧾 Course tracking and purchase history
- 🔑 JWT-based authorization for protected routes
- 📦 MongoDB for data persistence
- ⚙️ Built-in request validation using Zod

---

## ⚙️ Environment Variables

Create a `.env` file inside the `/backend` directory with the following:

```bash
PORT=5000
MONGO_URI=your_mongodb_connection_uri
JWT_SECRET=your_super_secret_key
```

## 🛠️ Tech Stack & Libraries

- **Express.js** – Web framework for Node.js
- **MongoDB + Mongoose** – Database and ODM for data modeling
- **JWT (jsonwebtoken)** – Secure token-based authentication
- **bcrypt** – Secure password hashing
- **zod** – Type-safe request validation
- **dotenv** – Manage environment variables

## 🔐 Security & Validation

- **Password Hashing:** All passwords are securely hashed using `bcrypt` before storing in the database.
- **JWT Auth:** JSON Web Tokens (`jsonwebtoken`) are used to authenticate both admin and users.
- **Schema Validation:** `zod` is used to strictly validate incoming request data (like email, password, etc.), improving backend security and error handling.

## 📫 Author

Started with “let’s just set up the backend”  
Ended with 47 console.logs, 3 existential crises, and a functioning platform (somehow).

If something breaks, I probably knew about it but hoped no one would notice.🐐