<div align="center">
  <img src="assets/logo.png" alt="HealthPal Logo" width="300"/>

  <h1>HealthPal</h1>
  <p>A complete healthcare management platform for patients, doctors, NGOs, and medical teams.</p>
</div>

---

## **HealthPal**

HealthPal is an integrated healthcare management system designed to streamline medical workflows, patient support, donation activities, therapy management, and health education.  
It provides a unified platform for patients, doctors, NGOs, health workers, and administrators to interact efficiently while ensuring security, automation, and accurate data handling.

With structured modules for consultations, therapy sessions, medical equipment requests, workshops, donations, alerts, and more — HealthPal delivers a seamless medical experience for every user role.

---

## **GitHub Repository Information 🔹**

📁 Size  📂 Files  📅 Last Commit  👥 Contributors

---

## **Table of Contents ℹ️**

- HealthPal
- Core Features
- Extra Features
- Technologies Used
- External APIs Used
- External Libraries and Packages
- Installation

---

# **Core Features ⭐**

## **Patient & Doctor Management**

- Patients and doctors have fully structured profiles with medical history, specialization, availability, and license verification.
- Doctors can update qualifications, schedules, and availability for sessions.
- Patients can manage their personal details and participate in consultations or therapies.

---

## **Consultations**

- Patients can request consultations with available doctors.
- Doctors manage scheduled times, diagnosis, notes, and session outcomes.
- Translation support for multilingual diagnosis notes.

---

## **Therapy Sessions**

- Structured therapy sessions with schedules, modes, recurring options, and duration.
- Therapists can submit notes and track session progress.
- Patients receive updates and session reminders.

---

## **Medical Equipment Requests**

- Patients can request medical equipment from the inventory.
- Each item has:
  - Condition
  - Availability status
  - Location & contact info
- Requests can be claimed by medical staff and updated through their lifecycle.

---

## **Public Health Alerts**

- Admins can publish urgent health alerts for specific regions.
- Alerts include severity, category, timestamps, and messages.
- Users can view alerts based on location or category.

---

## **Workshops & Registrations**

- Healthcare workshops can be created with scheduling, capacity limits, and modes.
- Users can register for workshops and track their enrollment.
- Organizers can see participants and session details.

---

## **NGOs & Donor Management**

- NGOs have profiles with their mission and registration details.
- Donation campaigns can be created with targets and progress tracking.
- Donors contribute and receive confirmation records.
- Full donation logs and donor history included.

---

# **Extra Features ⭐⭐**

## **Roles — Multi-Level System 🙌**

HealthPal supports several essential roles:

### **Admins**

Manage all platform data, users, workshops, alerts, and system logs.

### **Doctors**

Provide consultations, conduct therapy sessions, and manage availability.

### **Patients**

Request services, attend workshops, join sessions, and track medical activity.

### **NGOs**

Create donation campaigns, manage cases, and track contributions.

### **Donors**

Donate safely through verified NGO cases and track their donation history.

---

## **Billing & Financial Tracking 💸**

- Therapy, workshop, and donation confirmations generate structured records.
- Email notifications sent with PDF summaries (if enabled).
- Admins can view all platform transactions and billing logs.

---

## **User Privacy & Data Security 🪪**

- Passwords stored with hashing & encryption.
- Token-based authentication for each login.
- Role-based authorization ensures restricted access.
- Email validation required for password updates.
- Sessions and logs maintained for security auditing.

---

## **Returning Equipment Management 📌**

- Staff assess item condition upon return.
- Determines returnable deposit amount.
- Overdue equipment triggers automated overtime charges.
- Automated reminders sent one day before the scheduled return.

---

## **Error Handling & Logging**

- Clear and structured API error responses.
- Logs stored for:
  - User actions
  - Failed operations
  - System events
- Helps admins and developers debug easily.

---

# **Technologies Used ⚙**

- Node.js
- Express.js
- MySQL
- Swagger (OpenAPI)
- Postman
- GitHub

---

# **External APIs Used 📌**

### **OpenStreetMap Nominatim API**

- Converts user addresses into usable location coordinates.
- Supports distance-based logic for workshops or alerts.

### **OpenRouteService API**

- Calculates routes and distances (e.g., delivery of equipment).
- Helps determine logistics cost and nearest facility routing.

---

# **External Libraries and Packages 📦**

### 📌 Database

- **mysql2** — MySQL connection & queries

### 📌 Utilities

- **moment** — Date formatting
- **geolib** — Distance calculation
- **axios** — External API requests

### 📌 Authentication & Security

- **bcrypt** — Password hashing
- **jsonwebtoken** — Token generation
- **crypto** — Hashing operations

### 📌 Mailing & PDFs

- **nodemailer** — Sending emails
- **puppeteer** — PDF generation

### 📌 Testing / Development

- **@faker-js/faker** — Fake data generation

### 📌 Sessions

- **express-session**
- **cookie-parser**

---

# **Installation**

## **1️⃣ Clone the repository**

```sh
git clone https://github.com/username/healthpal.git
```
