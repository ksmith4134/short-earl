# Features
Anonymously shorten a URL or enter your email with the URL to enable high-level analytics:
- Total clicks
- Clicks per browser type
- Clicks per OS type
- Statistics can be obtained by visiting */search* and entering the email you're interested in
- Data is **public**! Anyone can access it.

The hash encryption method results in over 280 trillion unique combinations:
- URLs go through a **Fisher-Yates Shuffle** before being hashed.
- URLs are hashed using **SHA256** and encoded using **Base64Url**
- Hashes are typically **8 digits** long (except for rare circumstances when an extra digit is applied).
- A **recursive function** validates hash uniqueness

<br>

# Getting Started
The instructions will help you run the app locally either with Docker, or without. Note that using Docker will allow you to get up and running significantly faster.

## Run locally using Docker
**Build the node.js and postgres containers. Then seed the database.**
```bash
docker compose up --build -d
docker exec -it nextjs-app sh
node database/seed.js -i
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

**To Query the Database**
```bash
docker exec -it postgres-db psql -U postgres -d short_earl
\dt
```

**To Shutdown**
```bash
docker-compose down --volumes --rmi all
```

## Run locally (without Docker)
Install Node.js v20+ and PostgreSQL.

Create a local PostgreSQL database with these credentials:
```
POSTGRES_USER=postgres
POSTGRES_PASSWORD="123!@#"
POSTGRES_DB=short_earl
```

Create a .env file in the project's root folder:
```
NODE_ENV=development
BASE_URL=http://localhost:3000
LOCAL_DB_USER=postgres
LOCAL_DB_HOST=postgres-db
LOCAL_DB_NAME=short_earl
LOCAL_DB_PASSWORD="123!@#"
LOCAL_DB_PORT=5432
```

Then run:
```bash
npm install
npm run seed -- -i
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.