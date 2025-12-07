# HealthPal

<div>
<p align="center">
  <img src="assets/logo.png" alt="HealthPal Logo"  height="350" width="350"/>
</p>
<h3 align="center">HealthPal</h3>

  <p align="center">
Your all-in-one platform for healthcare management, connecting patients, doctors, NGOs, donors, and medical services.
    <br />
    <a href="https://github.com/danahamdanx/HealthPal/wiki"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://drive.google.com/file/d/1JWYMJUP-ZTfPFAo5BEffEkdLJMWE_TDN/view?usp=sharing">View Demo</a>
  </p>
</div>

**HealthPal** is a comprehensive healthcare platform that empowers patients, doctors, NGOs, donors, and administrators to manage medical services efficiently. From scheduling consultations and therapy sessions to managing donations, medical equipment, health articles, and public alerts, HealthPal streamlines all healthcare operations in one intuitive platform.

## GitHub Repository Information :small_blue_diamond:

<p>
  :file_folder: <a href="https://github.com/danahamdanx/HealthPal"><img src="https://img.shields.io/github/repo-size/danahamdanx/HealthPal" alt="Size"></a> &nbsp;
  :open_file_folder: <a href="https://github.com/danahamdanx/HealthPal"><img src="https://img.shields.io/github/directory-file-count/danahamdanx/HealthPal" alt="Files"></a> &nbsp;
  :date: <a href="https://github.com/danahamdanx/HealthPal"><img src="https://img.shields.io/github/last-commit/danahamdanx/HealthPal/main" alt="Last Commit"></a> &nbsp;
  :busts_in_silhouette: <a href="https://github.com/danahamdanx/HealthPal"><img src="https://img.shields.io/github/contributors/danahamdanx/HealthPal" alt="Contributors"></a> &nbsp;
</p>

# Table of Contents ℹ️

- [HealthPal](#healthpal)
- [Core Features](#core-features)
- [Extra Features](#extra-features)
- [Technologies Used](#technologies-used)
- [External APIs Used](#external-apis-used)
- [External Libraries and Packages](#external-libraries-and-packages)
- [Installation](#installation)

## Core Features⭐

1. Patient and Doctor Management:

   - Create, update, and view patient and doctor profiles.
   - Track patient medical history, demographics, and health records.
   - Doctors can manage consultations, diagnoses, and treatments.

2. Consultations & Therapy Sessions:
   - Schedule consultations with doctors.
   - Book therapy sessions with specialists.
   - Track session progress, notes, and status.
   - Doctors and patients have separate views for session management.
3. NGO Support & Donations:

   - NGOs can register, verify requests, and manage aid cases.
   - Donors can contribute to patient cases and track donations.
   - Full audit of donor contributions and case progress.

4. Medical Requests & Equipment Management:

   - Submit and manage medical supply requests.
   - NGOs can claim requests and update their status.
   - Add, update, and track medical equipment availability and conditions.

5. Health Articles & Alerts:
   - Publish, retrieve, and categorize health guides and articles.
   - Post public health alerts with severity levels.
6. Workshops & Community Education:
   - Host health workshops with registration management.
   - Track participants and manage schedules.

## Extra Features⭐⭐

1. Roles: Supports multiple user roles for secure operations🙌

   - Admins: Full control over platform operations and data.
   - Doctors: Manage consultations, diagnoses, and therapy sessions.
   - Patients: Request medical assistance, attend consultations and therapy.
   - NGOs: Manage aid cases and claim requests.
   - Donors: Contribute to cases and track donations.

2. Notifications & Alerts:💌

   - Email notifications for appointments, sessions, donations, and equipment claims.
   - Health alerts notify users of urgent community health issues.

3. Data Security & Privacy:🛡

   - Secure storage of user credentials with password hashing.
   - JWT tokens for role-based access control.
   - All sensitive actions require authentication.

4. Reporting & Tracking:📊

   - Track donations, case progress, medical requests, and therapy sessions.
   - Administrators can monitor all platform activities for oversight.

5. Error Handling and Logging:
   - Specific error messages and logs to support debugging and monitoring.

## Technologies Used⚙

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Postman](https://img.shields.io/badge/Postman-FF6C37?style=for-the-badge&logo=postman&logoColor=white)
![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)
![Swagger](https://img.shields.io/badge/Swagger-85C9B8?style=for-the-badge&logo=swagger&logoColor=white)

## External APIs Used📌

- WHO RSS Feed: Provides the latest English health articles for aggregation and storage in the database.
- (Optional) Fast XML Parser: Parses XML data from RSS feeds when needed.

## External Libraries and Packages📦

- **pg**: PostgreSQL database connection and management.
- **bcrypt**: Password encryption and secure authentication.
- **jsonwebtoken (jwt)**: Secure token generation for authentication and role-based access.
- **express**: Server framework for routing and HTTP handling.
- **cookie-parser**: Manage tokens via cookies.
- **express-session**: Session management for user activities.
- **node-cron**: Schedule notifications and automated tasks.
- **axios**: HTTP requests to external APIs.
- **moment**: Format dates and timestamps.
- **puppeteer**: Generate PDF invoices for donations or case summaries.
- **nodemailer**: Send email notifications for appointments, donations, and alerts.

## Installation

1. Clone the repository:
   ```bash
   git clone [https://github.com/danahamdanx/HealthPal.git]
   ```
