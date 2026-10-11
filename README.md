# HealthConnect LK — Integrated Smart Healthcare Management Platform

**HealthConnect LK** is a full-stack, enterprise-grade healthcare management and digital clinic coordination platform designed for the Sri Lankan public healthcare ecosystem.

---

## Architecture Overview

```
                                      HEALTHCONNECT LK
 ┌────────────────────────────────────────────────────────────────────────────────────────┐
 │                         Frontend (Next.js 16 + React 19 + TypeScript)                 │
 │   Tailwind CSS • shadcn/ui tokens • Framer Motion • Recharts • Lucide Icons            │
 └──────────────────────────────────────────┬─────────────────────────────────────────────┘
                                            │ REST / JSON (Stateless JWT / Bearer)
                                            ▼
 ┌────────────────────────────────────────────────────────────────────────────────────────┐
 │                      Backend (Java 21 LTS + Spring Boot 3.4.3)                         │
 │   Spring Security (BCrypt, 11-Role RBAC) • JJWT • Spring Data MongoDB • Actuator       │
 └──────────────────────────────────────────┬─────────────────────────────────────────────┘
                                            │ Port 27017
                                            ▼
 ┌────────────────────────────────────────────────────────────────────────────────────────┐
 │                                MongoDB 7.0 Database                                    │
 │   Docker Compose Container • Hashed NIC Identity Tokens • Indexed Collections          │
 └────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Delivered System Workspaces & Routes

### 1. Public & General Care Portal
- **Homepage (`/`):**
  - Sticky glassmorphic navigation bar with portal login dropdown and mobile drawer.
  - Cinematic hero section with value propositions and simulated live queue card preview (`C-024`).
  - Healthcare service explorer covering 8 hospital departments.
  - 5-step visual patient journey timeline.
  - Accredited Sri Lankan hospital directory with real-time district search (NHSL Colombo, Kandy, Karapitiya, Jaffna, Badulla, Gampaha, Homagama).
  - Recharts operational throughput visualizations.
  - Accessible FAQ accordion and emergency contact helplines (1990 Suwasariya, 1959 HPB).

### 2. Multi-Role Authentication
- **Patient Registration (`/auth/patient-register`):**
  - Sri Lankan NIC validation (`^([0-9]{9}[vVxX]|[0-9]{12})$`).
  - Salted SHA-256 identity hashing and masked display (`1995*****678`).
  - Sri Lankan mobile phone validation and privacy consent acknowledgment.
- **Patient Portal Sign In (`/auth/patient-login`):**
  - Multi-identifier authentication supporting NIC, mobile number, or email with password.
- **Healthcare Staff Workspace Sign In (`/auth/staff-login`):**
  - Role-based routing to authorized professional workspaces.

### 3. Role-Based Dashboards & Workspaces
- **Patient Dashboard (`/portal/patient`):**
  - Live Queue Ticket tracker with token countdown (`C-024` serving `C-020`, 4 patients ahead, 18 min wait).
  - Clinic appointment booking module with facility and time slot selection.
  - Scheduled clinic visits and consultation records.
- **Clinician & Doctor Workspace (`/portal/doctor`):**
  - Active queue call desk (`Call Token`, `Consulting`, `Completed`).
  - Nurse-logged triage vitals review.
  - Clinical examination assessment recorder, diagnostic laboratory orders, and pharmacy prescription dispatch.
- **Nursing Station & Triage (`/portal/nurse`):**
  - Patient triage queue with urgency classification (`ROUTINE`, `PRIORITY`, `URGENT`).
  - Vitals measurement entry (Blood Pressure, Heart Rate, Temperature, SpO2) forwarding directly to doctor worklists.
- **Digital Field Supervision (`/portal/supervisor`):**
  - Institutional quality checklist audits across provincial hospitals.
  - Corrective-action lifecycle manager (`OPEN` → `IN_PROGRESS` → `VERIFIED_CLOSED`).
  - Remediation finding creation with compliance deadlines.
- **Hospital Reception & Check-In Desk (`/portal/reception`):**
  - Walk-in token generator issuing physical and digital slips (`C-02x`).
  - Priority triage classification and checked-in patient manifest.
- **Hospital Administrator Dashboard (`/portal/admin`):**
  - Professional medical staff onboarding approvals (SLMC / SLNC registration verification).
  - Clinic session quota management progress bars.
  - Executive throughput and operational audit analytics.

---

## How to Run the Project Locally

### 1. Database (MongoDB)
Start the pre-configured MongoDB 7.0 container via Docker Compose:
```powershell
docker compose up -d
```
*(Alternatively, point `SPRING_DATA_MONGODB_URI` in `backend/src/main/resources/application.properties` to any running MongoDB instance).*

### 2. Backend (Java 21 Spring Boot)
From the root directory:
```powershell
cd backend
.\mvnw.cmd spring-boot:run
```
The REST API will start on `http://localhost:8080`.
Actuator health check: `http://localhost:8080/actuator/health`.

### 3. Frontend (Next.js 16 + React 19)
From another terminal in the root directory:
```powershell
cd frontend
npm run dev
```
Open your browser at `http://localhost:3000`.
To build for production:
```powershell
npm run build
npm start
```
