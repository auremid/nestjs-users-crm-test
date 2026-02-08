# NestJS Users CRM

A simple REST API for user management, built with NestJS, MongoDB, Mongoose, and JWT authentication. On startup, it automatically creates 2 million random users if the database is empty.

## Requirements

- Node.js v22+
- Docker and Docker Compose

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/auremid/nestjs-users-crm-test.git
   cd nestjs-users-crm-test
   ```

2. For running **Option 2** (local server): Install dependencies with `npm install`.
3. Depending on the running option:
   - For running **Option 1** (full Docker setup): Use the provided `.env.docker` file.
   - For running **Option 2** (local server): Copy `.env.example` to `.env` and adjust if needed.
   ```
   MONGO_URI=mongodb://localhost:27017/userscrm
   JWT_SECRET=supersecret
   SEED_ON_START=true
   ```

## Running

### Option 1: Full Docker setup (recommended)

This option runs the entire setup (API + MongoDB) in containers.

```bash
docker compose -f docker-compose.full.yml up -d --build
```

API will be available at `http://localhost:3000`.

To view server logs:
```bash
docker compose -f docker-compose.full.yml logs -f api
```

### Option 2: Only database via Docker, server via command line

Run only MongoDB in a container:

```bash
docker compose up -d
```

Then run the server locally:

```bash
npm run start:dev
```

API will be available at `http://localhost:3000`.

Logs will be displayed in the terminal. To view them separately if needed:
```bash
# Since the server is running locally, logs are in the terminal where npm run start:dev is executed
```

## API Endpoints

All requests to `/api/v1/*` require a JWT token in the header: `Authorization: Bearer <token>`.

### Get JWT Token

- **POST** `/api/v1/login`
- Description: Get a token for authorization (no additional credentials required).

Example request:

```bash
curl -X POST http://localhost:3000/api/v1/login
```

Response:

```json
{
  "access_token": "your-jwt-token"
}
```

### Add User

- **POST** `/api/v1/add-user`
- Description: Add a new user.
- Body (JSON):
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "birthDate": "1990-01-01"
  }
  ```

Example request:

```bash
curl -X POST http://localhost:3000/api/v1/add-user \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com", "phone": "+1234567890", "birthDate": "1990-01-01"}'
```

### Get Users List

- **GET** `/api/v1/get-users`
- Description: Get a list of users with pagination and filters.
- Query parameters:
  - `page` (optional): Page number (default 1)
  - `limit` (optional): Number of users per page (default 10)
  - `name` (optional): Search by name

Example request:

```bash
curl "http://localhost:3000/api/v1/get-users?page=1&limit=10&name=John" \
  -H "Authorization: Bearer <token>"
```

Response:

```json
{
  "users": [
    {
      "_id": "user-id",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "birthDate": "1990-01-01T00:00:00.000Z",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  ],
  "total": 2000000,
  "page": 1,
  "limit": 10
}
```

### Get User by ID

- **GET** `/api/v1/get-user/:id`
- Description: Get a single user by their ID.
- Parameter: `id` (user's ObjectId)

Example request:

```bash
curl http://localhost:3000/api/v1/get-user/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer <token>"
```

Response:

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "birthDate": "1990-01-01T00:00:00.000Z",
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z"
}
```

## Postman Collection

Test the API with this [Postman collection](https://bit.ly/3M9lTOB).

## Filters on /api/v1/get-users

- **page**: Page number for pagination (integer, starts from 1).
- **limit**: Maximum number of users per page (integer, default 10).
- **name**: Search by user name. Supports case-insensitive search and partial matches (e.g., "John" will find "John Doe", "john", etc.).
- **email**: Search by user email. Supports exact match.
- **phone**: Search by user phone. Supports exact match.

## Additional Notes

- On server startup, automatic seeding of 2 million users occurs if the database is empty (controlled by the `SEED_ON_START` variable).
- The seeding process runs asynchronously in the background, allowing the server to start and handle requests immediately.
- All emails and phones are unique due to database indexes.
- Errors are handled with appropriate HTTP status codes (400, 404, 409, etc.).
