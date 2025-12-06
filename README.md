# Single Page Application
## Personal Asset Manager Project

## Starting the Application
### Run NPM install 
change directory to client and run install, update as needed.
change directory to server and run install, update as needed. 

```bash
cd server
npm install   # generates server/package-lock.json

cd ../client
npm install   # generates client/package-lock.json
```
---

## Install Docker
Download docker for you Operating System.  
Open docker in background.

## Create Environment Files
- Development: Create mongo db account to store data. 
- Production: Create AWS account for S3, SES, and EC2 services.
- Create .env files in both, client and server.

1. Client
```bash
VITE_API_BASE_URL=/api
```

2. Server
```bash
# MongoDB connection URI Project SPA-PAM
MONGO_URI=<insert database>

# Server port for dev
PORT=5001

# AWS for Production
AWS_BUCKET_NAME=<insert name>
AWS_REGION=<insert region>
AWS_ACCESS_KEY_ID=<insert key>
AWS_SECRET_ACCESS_KEY=<insert key>

# Email credentials (should use App Password for Gmail)
SES_SOURCE_EMAIL=<insert email>

# Auth
JWT_SECRET=<insert secrete>
SESSION_SECRET=<insert secrete>
COOKIE_SECRET=<insert secrete>

# Frontend base URL (used for redirects, email links, etc.)
FRONTEND_URL=http://localhost:5173
```

## Load Data
Using Server --> Scripts to load data.
```bash
cd server
node scripts/<NAME_OF_SCRIPT>.js
```

## Start Docker from IDE Terminal
Docker Start  
> docker compose -f docker-compose.dev.yml up --build -d

Docker Shut Down  
> docker compose -f docker-compose.dev.yml down

Restart  
> docker compose -f docker-compose.dev.yml restart 

Restart Client Only   
> docker compose -f docker-compose.dev.yml restart client 

Logs  
> docker compose -f docker-compose.dev.yml logs -f server

Cypress Global Command (Setup Mac Repo - required)
> run-spa-tests  

Local SPA → http://localhost:5173


### Users created using the seed script:
UserNames:   
admin@example.com  
breeder@example.com  
customer@example.com  

Password is the same:   
Password123!
