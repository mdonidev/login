# Login & Signup Application Setup Guide

## Prerequisites
- Node.js (v14 or higher)
- MySQL Server installed and running
- npm (comes with Node.js)

## Setup Instructions

### 1. Install MySQL Server
If you don't have MySQL installed:
- Download from: https://www.mysql.com/downloads/
- Install MySQL Community Server
- Note your password for the `root` user

### 2. Update Database Password
Edit `server.js` and replace `your_password` with your MySQL root password:

```javascript
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'your_password', // <- CHANGE THIS
    database: 'login_app',
    // ...
});

// And also here:
const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'your_password' // <- CHANGE THIS
});
```

### 3. Install Dependencies
Open a terminal in the project directory and run:

```bash
npm install
```

This will install:
- **express** - Web framework
- **mysql2** - MySQL driver
- **bcryptjs** - Password hashing
- **cors** - Enable cross-origin requests
- **body-parser** - Parse JSON requests

### 4. Start the Server
Run the following command:

```bash
npm start
```

The server will:
1. Create the `login_app` database automatically
2. Create the `users` table automatically
3. Start listening on `http://localhost:3000`

You should see in the terminal:
```
Server is running on http://localhost:3000
Database created or already exists
Users table created or already exists
```

### 5. Open the Application
Open your browser and navigate to:
```
http://localhost:3000
```

## Features

### Backend (Server)
- **POST /api/signup** - Register a new user
  - Input: `{ name, email, password, confirmPassword }`
  - Returns: `{ success, message, userId }`

- **POST /api/login** - Login an existing user
  - Input: `{ email, password }`
  - Returns: `{ success, message, userId, name }`

- **GET /api/users** - Get all registered users (testing only)

### Database Schema
```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)
```

### Security Features
- ✅ Password hashing with bcryptjs
- ✅ Email validation
- ✅ Password matching validation
- ✅ Duplicate email prevention
- ✅ SQL injection prevention (using parameterized queries)

## Testing the Application

### Using the Web Interface
1. Fill in the signup form and click "Sign Up"
2. Use the toggle link to switch to login
3. Enter your credentials and click "Login"

### Using API (cURL)

**Signup:**
```bash
curl -X POST http://localhost:3000/api/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "confirmPassword": "password123"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Get All Users:**
```bash
curl http://localhost:3000/api/users
```

## Troubleshooting

### "Access denied for user 'root'@'localhost'"
- Make sure MySQL is running
- Verify your password in server.js is correct

### "Error: connect ECONNREFUSED 127.0.0.1:3306"
- MySQL server is not running
- On Windows: Start MySQL from Services or MySQL Workbench
- On Mac: `brew services start mysql`
- On Linux: `sudo systemctl start mysql`

### "Port 3000 is already in use"
- Change the PORT variable in server.js to a different port (e.g., 3001)

## File Structure
```
vs login/
├── index.html       # Frontend HTML
├── style.css        # Frontend CSS
├── script.js        # Frontend JavaScript
├── server.js        # Node.js Express server
├── package.json     # Node.js dependencies
└── SETUP.md         # This file
```

## Next Steps
- Add JWT authentication tokens
- Implement password reset functionality
- Add email verification
- Create user dashboard
- Implement rate limiting for security
- Add session management

## Support
For issues or questions, check the browser console and server logs for error messages.
