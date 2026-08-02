# Student Study Buddy Finder

A full-stack web app helping students find, connect with, and schedule study sessions with compatible peers.

## Live Demo

https://study-buddy-finder-production-8ecc.up.railway.app

## Features

- Registration and login with hashed passwords (bcrypt) and session-based auth
- Profile management, including profile picture upload
- Keyword search and browse-all listings to find other students
- Connection requests — send, accept, decline, and withdraw
- Study session scheduling with confirmed buddies
- Forgot password flow via a security question
- Account deactivation
- Dark/light theme toggle
- Mobile-responsive design

## Tech Stack

- Node.js / Express.js
- MySQL
- Vanilla HTML, CSS, and JavaScript (no frontend framework)
- bcrypt for password hashing
- express-session for authentication
- multer for file uploads
- Swagger / OpenAPI for API documentation
- k6 for load and smoke testing

## API Documentation

Interactive API docs (Swagger UI) are available at:

- Live: https://study-buddy-finder-production-8ecc.up.railway.app/api-docs
- Local: http://localhost:3000/api-docs (once the app is running)

## Getting Started (Local Setup)

1. Clone the repository:

   ```
   git clone https://github.com/kere-mnma/study-buddy-finder.git
   cd study-buddy-finder
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Create a `.env` file in the project root with the following variables:

   ```
   DB_HOST=
   DB_PORT=
   DB_USER=
   DB_PASSWORD=
   DB_NAME=
   SESSION_SECRET=
   PORT=
   ```

4. Run the schema:

   ```
   mysql -u <user> -p <database_name> < schema.sql
   ```

5. Start the app:

   ```
   npm start
   ```

   The app runs on `http://localhost:3000` by default (or the `PORT` you set in `.env`).

## Testing

A k6 test suite covers smoke, load, stress, and spike scenarios against the running app:

```
npm run bench:smoke   # quick end-to-end check (register, login, search, dashboard, logout)
npm run bench         # load test — ramps up to ~10 virtual users
npm run bench:stress  # stress test — steps up to ~40 virtual users
npm run bench:spike   # spike test — sudden burst of traffic
```

A Postman collection, built from the Swagger spec, is also available for manual API testing.

## Project Structure

```
controllers/   Request handlers — the actual logic behind each API route
routes/        Express route definitions and Swagger/OpenAPI annotations
views/         Static HTML pages served to the browser
public/        Client-side JS, CSS, and images
config/        Database connection and Swagger setup
k6/            Load/smoke/stress/spike test scripts
```

## Author

Eziagbor C. Osele
National College of Ireland — HDSDEV_SEP25
