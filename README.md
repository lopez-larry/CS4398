# Spa Pam Project


Example Pull Request

```mermaid
gantt
    title SPA Pam Project Timeline
    dateFormat YYYY-MM-DD
    axisFormat %b %d

    section Setup
        Gather Industry Trends: done, des1, 2025-09-04, 2025-09-09
        Create Site Map: done, des2, 2025-09-09, 2025-09-11
        Create WireFrames: done, des3, 2025-09-09, 2025-09-16
        Develop Brand Elements: done,des4, 2025-09-09, 2025-09-16
        Define User Stories: done, des5, 2025-09-16, 2025-09-18
        Software Documentation: done, des7, 2025-09-16, 2025-09-26
        Review Stack Training: crit, active, des6, 2025-09-16, 2025-10-07
        Project Status Report: milestone, status, 2025-10-08, 0d

    section Features
        Project scaffolding: des8, 2025-10-09, 2025-10-26
        Authentication: des9, 2025-10-09, 2025-10-16
        MongoDB connection: des10, 2025-10-09, 2025-10-14
        Dog & Breed CRUD: des11, 2025-10-09, 2025-10-14
        Image Upload (S3): des12, 2025-10-09, 2025-10-14
        Dog Detail Enhancements: des13, 2025-10-09, 2025-10-14
        Breeder Messaging System: des14, 2025-10-13, 2025-10-24
        Project Prototype: milestone, prototype, 2025-11-05, 0d

    section Deployment
        AWS S3 + CloudFront Setup: des15, 2025-11-06, 2025-11-10
        Backend on EC2: des16, 2025-11-06, 2025-11-10
        Full AWS Integration: des17, 2025-11-10, 2025-11-13
        End-to-End Test: des18, 2025-11-14, 2025-12-02
        Final Project Report: milestone, final, 2025-12-03, 0d
```
## Starting the Application

### Run NPM install 
change directory to client and run `npm install`

change directory to server and run `npm install`

```bash
cd server
npm install   # generates server/package-lock.json

cd ../client
npm install   # generates client/package-lock.json
```

---

## Run Docker
### install docker 
Download docker for you Operating System 

Opne docker in background

### Start Docker 
From IDE Terminal run: 

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

Live -> https://d3ksowre3dfy72.cloudfront.net

### Users created using the seed script:
UserNames:   
admin@example.com  
breeder@example.com  
customer@example.com  

Password is the same:   
Password123!
