# Authify

**Secure, full-stack authentication system with React, Node.js, and MySQL**

## Overview

Authify is a modern, secure, and scalable full-stack authentication application. It features user signup, login, logout, password reset, email verification, and role-based access control. Built with React on the frontend and Node.js + Express on the backend, it uses MySQL with Sequelize ORM for data persistence. Authify also includes session management, CSRF protection, and responsive UI for seamless user experience.

---

## Features

-User authentication with signup, login, and logout
-Password hashing with bcrypt
-Forgot password and email reset functionality
-Session management stored in MySQL
-CSRF protection for security
-Role-based access (admin vs user)
-Responsive frontend built with React
-Flash notifications for user-friendly feedback

---

## Tech Stack

-**Frontend:** React, React Router, Axios

- **Backend:** Node.js, Express
- **Database:** MySQL, Sequelize ORM
- **Security:** bcrypt, express-session, csurf, email verification

---

## Installation

### Backend

1. Navigate to the backend folder:

```bash
cd auth-backend
```

2. Install dependencies:

```bash
npm install
```

3. Configure .env with your DB and email credentials
4. Start the server:

```bash
npm start
```

### Frontend

1. Navigate to the frontend folder

```bash
cd auth-frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

---

## Project Structure

my-app/
├── auth-backend/ # Node.js + Express API
├── auth-frontend/ # React frontend

---

## Contributing

Contributions are welcome! Please fork this repository and submit pull requests for new features, bug fixes, or enhancements.

---

## License

MIT License
