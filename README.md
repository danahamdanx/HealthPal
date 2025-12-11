# HealthPal

<div>
  <p align="center">
    <img src="assets/logo.png" alt="HealthPal Logo" height="350" width="350"/>
  </p>

  <h3 align="center">HealthPal</h3>

  <p align="center">
    A unified healthcare management ecosystem that connects patients, doctors, NGOs, donors, and service providers through a secure and intuitive digital platform.
    <br />
    <a href="https://github.com/danahamdanx/HealthPal/wiki"><strong>Explore the docs »</strong></a>
    <br /><br />
  </p>
</div>

<p>
<strong>HealthPal</strong> is a complete healthcare coordination system built to simplify and automate medical assistance workflows. It integrates patient care, doctor consultations, NGO case management, donation tracking, medical equipment requests, health education, and public safety alerts into one platform. 
</p>

<p>
Backed by a robust PostgreSQL schema, HealthPal ensures secure authentication, role-based access, real-time tracking, automated reporting, NGO analytics, and PDF-generated summaries and prescriptions.
</p>

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

## Core Features ⭐

<ol>
  <li><strong>User & Role Management</strong><br/>
      Secure authentication with hashed credentials and JWT-based role control for:
      Admins, Doctors, Patients, NGOs, and Donors.
  </li>

  <li><strong>Patient & Doctor Profiles</strong><br/>
      Comprehensive patient medical histories, demographic info, and clinical notes.
      Doctors maintain specialties, availability, licenses, and professional experience.
  </li>

  <li><strong>Consultations</strong><br/>
      Patients schedule sessions with doctors, with support for translations, diagnoses, treatments,
      and structured clinical notes stored directly in the database.
  </li>

  <li><strong>Therapy Sessions</strong><br/>
      Session tracking with duration, focused topics, initial concerns, progress summaries,
      recurring appointments, and doctor–patient follow-up.
  </li>

  <li><strong>NGO Case Management</strong><br/>
      NGOs manage medical cases, verify details, update case progress, and track raised vs. targeted amounts.
  </li>

  <li><strong>Donation System</strong><br/>
      Donors contribute to cases, view contribution history, and track progress.
      Monthly summaries and case-level financial analytics are generated for transparency.
  </li>

  <li><strong>Medical Requests</strong><br/>
      Patients submit medical supply requests with urgency levels.
      NGOs or donors can claim requests and update their status through the lifecycle.
  </li>

  <li><strong>Equipment Inventory & Lending</strong><br/>
      Add, categorize, and track medical equipment.
      Patients can request equipment, while NGOs/Donors can review, approve, or claim requests.
  </li>

  <li><strong>Workshops & Health Education</strong><br/>
      Host health workshops, manage attendees, and track registrations.
  </li>

  <li><strong>Health Guides & Articles</strong><br/>
      Publish categorized health content in different languages with images and metadata.
  </li>

  <li><strong>Public Health Alerts</strong><br/>
      Issue alerts with severity levels, regions, expiration dates, and emergency classifications.
  </li>

  <li><strong>Support Tickets (NGO Complaints)</strong><br/>
      NGOs can submit complaints or support inquiries with tracking and follow-up by administrators.
  </li>

  <li><strong>Audit Logs</strong><br/>
      Every user action is logged with a status code, message, and timestamp for full traceability.
  </li>
</ol>

## Extra Features⭐⭐

<ul>
<h2>Role Dashboards</h2>

<p><strong>Patient Dashboard</strong><br/>
Displays essential patient activity such as upcoming consultations, therapy sessions, recent cases, medical requests, and equipment requests.</p>

<p><strong>Doctor Dashboard</strong><br/>
Shows the doctor’s daily schedule including today’s consultations, therapy sessions, and recently attended patients.</p>

<p><strong>NGO Dashboard</strong><br/>
Provides case statistics, total donations received, active/closed case counts, and request claim activity.</p>

<p><strong>Donor Dashboard</strong><br/>
Summarizes donor activity including total donations, supported cases, and recent contribution history.</p>

<h2>Reporting & Analytics (API)</h2>

<ul>
  <li>Monthly donation summary (per donor, NGO, or full platform)</li>
  <li>Top NGO-managed cases based on activity or donations</li>
  <li>Medical requests sorted by priority levels</li>
  <li>Case progress and status summaries</li>
</ul>

<h2>PDF Generation</h2>

<ul>
  <li>Consultation report PDFs including diagnosis, notes, and treatment</li>
  <li>Prescription PDFs generated and signed by doctors</li>
  <li>Donation receipt PDFs automatically generated and sent to donors</li>
</ul>

  <li><strong>Email Notifications</strong><br/>
      Automated reminders for consultations, therapy sessions, medical request updates,
      donation confirmations, and equipment claims.
  </li>

  <li><strong>Session & Activity Tracking</strong><br/>
      Detailed logs for system monitoring and debugging.
  </li>

  <li><strong>Token Blacklisting</strong><br/>
      Secure logout and revoked token handling through a blacklist table.
  </li>

  <li><strong>Role-Based Data Access</strong><br/>
      Each role has filtered and secure access to their own domain-specific data.
  </li>

  <li><strong>Automated Cron Jobs</strong><br/>
      Background tasks for syncing health alerts, sending reminders, and maintaining data freshness.
  </li>
</ul>

## Technologies Used⚙

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Postman](https://img.shields.io/badge/Postman-FF6C37?style=for-the-badge&logo=postman&logoColor=white)
![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)
![Swagger](https://img.shields.io/badge/Swagger-85C9B8?style=for-the-badge&logo=swagger&logoColor=white)

## External APIs Used📌

<ul>
  <li><strong>WHO RSS Feed</strong><br/>
      Retrieves the latest global health articles and advisories for storage and presentation within HealthPal.</li>

  <li><strong>CDC Media API</strong><br/>
      <code>https://tools.cdc.gov/api/v2/resources/media</code><br/>
      Fetches verified health content, public safety guidance, and disease updates for integration into the Health Guides and Alerts modules.</li>
</ul>

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
   git clone [https://github.com/username/project-name.git]
   ```
2. Navigate to the project directory:
   ```bash
   cd healthpal
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Run the application:
   ```bash
   npx nodemon server.js
   ```
