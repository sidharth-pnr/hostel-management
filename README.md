## Hostel Room Allocation and Complaint Management System
# Campus Housing - Name of Website

An official digital ecosystem designed to streamline hostel administration, automate room allocation, and provide rapid complaint resolution for the **College of Engineering Trikaripur**. This project is developed as part of the **KTU 2019 Scheme Mini Project (Course Code: CSD334)**.

## 📖 Project Overview

**Campus Housing** is a comprehensive web-based platform that replaces traditional, manual hostel management processes. It provides a seamless interface for students to apply for accommodation and a powerful command center for wardens to manage residents, rooms, and maintenance requests.

## 🏗️ System Architecture

The system follows a **3-Tier Architecture** to ensure separation of concerns, scalability, and security:

1.  **Presentation Layer (Frontend):** React 19 (Vite) + Tailwind CSS + Framer Motion.
2.  **Application Layer (Backend API):** RESTful API in PHP (XAMPP Environment).
3.  **Data Layer (Database):** MySQL with Foreign Key constraints for data integrity.

## 🎨 Modern Design Philosophy

The application employs a **Modern Academic** aesthetic, blending high-end interactivity with professional clarity:

*   **Glassmorphism (Frosted Depth):** Navigation bars and dashboard cards utilize `backdrop-blur` and semi-transparent backgrounds (`bg-white/40`) to create a premium, "frosted glass" aesthetic.
*   **Bento Box Architecture:** Data-rich dashboards are organized into a modular grid (Bento Grid), ensuring that complex metrics like occupancy rates and complaint distributions are instantly readable and organized.
*   **Zero-Scroll Interface:** Key portals are designed to fit within the viewport, minimizing friction and keeping essential controls within reach.
*   **The Motion Engine:** Powered by `Framer Motion`, featuring subtle entrance animations and interactive hover states for tactile feedback.

## 🛠️ System Workflow

### 🎓 Student (Residential Lifecycle)
1.  **Identity Verification:** Registration using University Reg No (Initially `PENDING`).
2.  **Administrative Approval:** Wardens review applications to set status to `ACTIVE`.
3.  **Smart Booking:** Browse available rooms, occupancy, and rates via the Bento-styled portal.
4.  **Financial Checkout:** Secure (simulated) payment gateway for fees.
5.  **Digital Check-In:** Automatic room allocation and occupancy update.
6.  **Continuous Support:** Raise maintenance tickets and track status (`PENDING` to `RESOLVED`).

### 🛡️ Admin (Management Loop)
1.  **Command Center:** A Bento-style dashboard providing real-time stats on occupancy, students, and urgent complaints.
2.  **Access Control:** RBAC for `SUPER` and `STAFF` admins.
3.  **Vetting & Allocation:** Review registrations and room requests.
4.  **Maintenance Oversight:** Assign staff and update complaint status.
5.  **Audit Trail:** Time-stamped logs of all system actions.

## ✨ Key Features

- **RBAC:** Granular permissions for administrative roles.
- **Bento Infrastructure Map:** Visual tracking of bed availability across blocks.
- **Glass Complaint Center:** Maintenance ticketing linked directly to student profiles.
- **Security:** SQL Injection protection via Prepared Statements and secure password hashing.

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v18+)
- XAMPP (Apache & MySQL)

### Backend Setup (PHP/MySQL)
1.  Place `hostel_room_api` in your XAMPP `htdocs` directory.
2.  Create a MySQL database named `hostel_database`.
3.  Import the schema and configure `db.php`.

### Frontend Setup (React)
1.  Navigate to `hostel-management`.
2.  Run `npm install`.
3.  Verify `src/config.js` API base URL.
4.  Run `npm run dev`.

---
*Designed and Developed by Group 15 • 2026*
