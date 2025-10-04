# Connectify - Backend ⚙️

This is the backend server for Connectify, a full-stack social media application. It's a robust **Node.js** and **Express.js** API that handles authentication, data management with **MongoDB**, real-time communication with **Socket.IO**, and more.

---

### ## ✨ API Features

- **RESTful API:** A well-structured API for managing users, posts, comments, likes, and follows.
- **Secure Authentication:** Implements a JWT-based system with short-lived **Access Tokens** and long-lived, cookie-based **Refresh Tokens**.
- **Password Hashing:** Uses `bcrypt.js` to securely hash and verify user passwords.
- **Real-time Engine:** Integrated **Socket.IO** server to push live notifications to clients.
- **Cloud Image Storage:** Handles image uploads via `multer` and stores them on **Cloudinary**.
- **Email Service:** Password reset functionality powered by **Nodemailer**.
- **Authorization:** Middleware ensures that users can only modify their own content.

---

### ## 💻 Tech Stack

- **Runtime:** [Node.js](https://nodejs.org/)
- **Framework:** [Express.js](https://expressjs.com/)
- **Database:** [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
- **Authentication:** JSON Web Tokens (`jsonwebtoken`)
- **Real-time:** [Socket.IO](https://socket.io/)
- **Image Handling:** [Cloudinary](https://cloudinary.com/) & [Multer](https://github.com/expressjs/multer)
- **Email:** [Nodemailer](https://nodemailer.com/)
- **Deployment:** [Render](https://render.com/)

---

### ## 🛠️ Getting Started

To run this server locally, follow these steps:

**1. Clone the repository:**

```bash
git clone [https://github.com/001Rakib/connectify-server](https://github.com/001Rakib/connectify-server)
cd connectify/server
```

**2. Install dependencies:**

```bash
npm install
```

**3. Set up environment variables:**
Create a file named `.env` in the `server` directory. Copy the contents of `.env.example` (if you have one) or add the following variables with your own secret values.

```env
# MongoDB Connection String
MONGO_URI=your_mongodb_connection_string

# JWT Secrets (must be different)
JWT_SECRET=a_very_strong_secret_for_access_tokens
REFRESH_TOKEN_SECRET=an_even_stronger_secret_for_refresh_tokens

# Cloudinary Credentials
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Nodemailer/Gmail Credentials
EMAIL_USER=your-gmail-address@gmail.com
EMAIL_PASS=your-16-character-app-password

# CORS Origin for local development
CORS_ORIGIN=http://localhost:3000
```

**4. Run the development server:**

```bash
npm start
```

The server will be running on [http://localhost:5000](http://localhost:5000).
