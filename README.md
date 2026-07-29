# MazyConnect

Interactive electronics learning site — build circuits on a virtual breadboard, simulate them, and check challenge solutions.

**Live:** [https://mazyconnect.net](https://mazyconnect.net)

---

## Run locally

You need three things running: **Postgres**, **backend**, **frontend**. Also install **ngspice** (`ngspice` on your `PATH`) — simulation will not work without it.

### 1. Database

```bash
cd backend
docker compose up -d
```

Creates Postgres on `localhost:5432`  
(db `circuitdb`, user `circuit`, password `circuit123`)

### 2. Backend

From the repo root:

```bash
./mvnw -pl backend spring-boot:run
```

API: [http://localhost:8080](http://localhost:8080)

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Site: [http://localhost:5173](http://localhost:5173)

In dev, `/api` is proxied to the backend automatically.

---

## Requirements

- Java 21+
- Node.js 18+
- Docker (for Postgres)
- ngspice

---

## Add problems

Challenge text and auto-checks live in YAML:

`backend/src/main/resources/problems/`

See [VALIDATION.md](backend/src/main/resources/problems/VALIDATION.md) for how to add new problems. Restart the backend after editing YAML.
