# FzAdEvents: MERN Digital Visitor Pass & Event Management System

FzAdEvents is a digital visitor pass and event management system developed using the **MERN Stack** (MongoDB, Express, React, Node.js) with JWT authentication, role-based authorization, secure QR-code generation, check-in/check-out scanning, and administrative reporting dashboards.

---

## 🚀 Key Features

### 1. Role-Based Access Control (RBAC)
- **Admin**: Oversees events, manages staff roles, configures system settings, view analytics charts, browse detailed visitor check-in logs, and export reports to CSV.
- **Security / Front Desk**: Accesses a dedicated QR Scanner module to check visitors IN and OUT, view their live registration and profile details, and print badges.
- **Host / Employee**: Creates and updates proposed events, manages visitor lists, approves or rejects attendee registrations, and sends invitations directly.
- **Visitor**: Browses approved public events, pre-registers with details (including profile photo upload), verifies email with OTP, and downloads their entry passes.

### 2. Pre-Registration & Approvals
- Visitors must pre-register for events.
- Hosts approve or reject pre-registrations.
- Interactive email notifications are sent out for approval notices, event updates, and invites.

### 3. Digital Pass Issuance (QR & PDF Badge)
- Securely encodes ticket registration keys into dynamic QR codes.
- Download passes as a **PNG image** or compile them instantly into a printable **PDF Badge** layout (sized for standard badge pockets).

### 4. Live Check-In / Check-Out Scanning
- Front desk security staff scan visitors' dynamic QR passes using their camera.
- The system automatically registers Check-In (`IN`) and Check-Out (`OUT`) logs in MongoDB.
- Protects against double check-outs.

### 5. Admin Reporting, Filtering & Exports
- Filter check logs and visitor registries by status (IN, OUT, Approved, Pending, Invited, Rejected).
- Search logs and registries by visitor name, email, event name, or registration ID.
- **Export reports directly to CSV** with one click.

---

## 🛠️ Project Setup Guide

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas cluster or local database instance
- Cloudinary credentials (for secure profile photo uploads)
- SMTP Mail Account (Gmail credentials for sending OTP & verification emails)

### 1. Configure Environment Variables

Create a `.env` file in the `Backend/` directory:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mwdoqkf.mongodb.net/event_manager
SECRET=your_jwt_secret_key_here

# Nodemailer SMTP configurations (Gmail recommended)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password_here

# Cloudinary Setup for profile photos
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Default Administrator Seed Credentials
ADMIN_EMAIL=admin@fzadevents.com
ADMIN_NAME="Super Administrator"
ADMIN_PASSWORD=adminPassword123
```

Create a `.env` file in the `Frontend/` directory:

```env
# Optional Vite configuration parameters
VITE_API_URL=http://localhost:5000
```

---

### 2. Install Backend Dependencies & Seed Data

Navigate to the `Backend/` directory:
```bash
# Install dependencies
npm install

# Seed the database (creates admin, host, security, visitor, sample events, passes, and check logs)
npm run seed
```

---

### 3. Install Frontend Dependencies

Navigate to the `Frontend/` directory:
```bash
# Install dependencies (includes lucide-react, qr-scanner, html-to-image, jspdf)
npm install
```

---

### 4. Running the Application

To run the application locally:

#### Backend Development Server
From the `Backend/` directory:
```bash
# Run server with hot-reloading
npm run dev
```

#### Frontend Development Server
From the `Frontend/` directory:
```bash
# Run Vite dev server
npm run dev
```

---

## 📊 Database Collections Summary

- **`userLogin`**: Stores hashed passwords, profile photo links, and system roles (Admin, Host, Visitor, Security).
- **`EventDetials`**: Event titles, dates, capacities, locations, categories, approval statuses, and host action histories.
- **`VisitorRrgistrationodule`**: Registered attendees, event ids, registration ID (e.g. `TECH2026-XXXXXX`), and status flags.
- **`visitorCheckStatusModule`**: Scan history records tracking check-in (`IN`) and check-out (`OUT`) timestamps.
- **`OTP`**: Temporary numeric codes for registration email verification.

---

## 🏆 Bonus Achievements Completed
- **OTP Verification Flow**: Fully secure signup with automated 5-minute expiring emails.
- **PDF Badge Creator**: Compiles entry credentials into a printable PDF layout on the fly.
- **Reporting Engine**: Advanced search, multi-field filtering, and complete CSV log exporting.
