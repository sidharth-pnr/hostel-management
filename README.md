# Hostel Room Allocation and Complaint Management System

An official digital ecosystem designed to streamline hostel administration, automate room allocation, and provide rapid grievance resolution for the **College of Engineering Trikaripur**.

## 📖 Project Overview

The **Hostel Room Allocation and Complaint Management System** (branded as **Campus Housing**) is a comprehensive web-based platform that replaces traditional, manual hostel management processes. It provides a seamless interface for students to apply for accommodation and a powerful command center for wardens to manage residents, rooms, and maintenance requests.

## 🛠️ System Workflow

### 🎓 Student (Residential Lifecycle)
1.  **Identity Verification:** Students register using their official University Reg No. Accounts are initially set to `PENDING` status.
2.  **Administrative Approval:** Wardens review applications. Once approved, the student's status becomes `ACTIVE`, granting access to the room booking portal.
3.  **Smart Booking:** Students browse available rooms in different blocks (A, B, etc.). They can see current occupancy and room rates before requesting a specific bed space.
4.  **Financial Checkout:** After a warden approves a room request, the student proceeds to a secure (simulated) payment gateway to pay the residential fees.
5.  **Digital Check-In:** Upon payment, the system automatically allocates the room, updates the infrastructure occupancy in real-time, and generates a digital profile record.
6.  **Continuous Support:** Residents can raise maintenance "tickets" for any issues. They track the ticket status from `PENDING` to `RESOLVED` via their dashboard.

### 🛡️ Admin (Management Loop)
1.  **Command Center Overview:** A data-rich dashboard provides real-time stats on total students, occupancy rates, and high-priority complaints.
2.  **Access Control:** `SUPER` admins manage the system infrastructure and staff accounts, while `STAFF` admins handle day-to-day operations.
3.  **Vetting & Allocation:** Admins review pending registrations and room requests. They have the power to approve, reject, or suggest alternative rooms to students.
4.  **Maintenance Oversight:** A dedicated grievance center allows admins to assign staff to complaints and update students on resolution progress.
5.  **Audit Trail:** Every action (login, allocation, payment, complaint) is logged with timestamps and actor details for complete transparency.

## 🎨 Design Philosophy & Style

The "Campus Housing" branding follows a **Modern Academic** aesthetic, prioritizing clarity, professionalism, and high-end interactivity.

*   **Cinematic UI:** The landing and authentication pages use a 60/40 split-screen layout with cinematic imagery and mesh gradient auras to create a premium first impression.
*   **Glassmorphism:** Navigation bars and dashboard cards utilize `backdrop-blur` and semi-transparent backgrounds to create depth and a sense of modern "lightweight" software.
*   **Zero-Scroll Architecture:** Key portals (Login, Register, Dashboard) are designed to fit within the viewport, minimizing friction and keeping essential controls within reach.
*   **The Motion Engine:** Powered by `Framer Motion`, the system features subtle entrance animations (slide-ups, fades) and interactive hover states (scaling, rotation) that provide tactile feedback.
*   **Adaptive Theme:** A fully integrated Dark/Light mode system that respects user preferences while maintaining high contrast and accessibility standards.
*   **Data Visualization:** Complex hostel metrics are simplified into heatmaps and donut charts for rapid cognitive processing by administrators.

## ✨ Key Features

### 🎓 For Students (Residents)
*   **The Scholar's Path:** A guided 4-step registration process.
*   **Smart Room Booking:** Browse rooms across different blocks and request bed spaces.
*   **Digital Wallet & Payments:** Integrated payment gateway for room fees.
*   **Concierge Care (Grievance Center):** Real-time ticketing for maintenance issues with priority levels.
*   **Resident Dashboard:** Overview of room status, roommates, and historical activity log.

### 🛡️ For Admins (Wardens & Staff)
*   **Role-Based Access Control (RBAC):** Granular permissions for `SUPER` and `STAFF` admins.
*   **Infrastructure Heatmap:** Visual tracking of block-wise bed availability.
*   **Resolution Map:** Data-driven analytics for tracking and resolving student complaints.
*   **System Activity Logs:** Comprehensive auditing of all administrative and student actions.

## 🛠️ Tech Stack

### Frontend
*   **React 19:** Modern UI library.
*   **Tailwind CSS:** Premium styling with full Dark Mode support.
*   **Framer Motion:** High-fidelity animations.
*   **Lucide React:** Consistent iconography set.
*   **Recharts:** Interactive data visualization.
*   **Axios:** Robust API communication.

### Backend
*   **PHP:** Server-side logic for API endpoints.
*   **MySQL:** Relational database for persistent storage.
*   **XAMPP:** Local development environment.

## 🚀 Installation & Setup

### Prerequisites
*   Node.js (v18+)
*   XAMPP or any PHP/MySQL environment

### Backend Setup (PHP/MySQL)
1.  Ensure XAMPP is installed and the Apache/MySQL modules are running.
2.  Move the backend folder `hostel_room_api` to your `htdocs` directory.
3.  Create a database named `hostel_database` in phpMyAdmin.
4.  Configure the database connection in `db.php` (Check port, usually 3306 or 3307).
5.  Run the schema update scripts (e.g., `update_schema.php`) to initialize tables.

### Frontend Setup (React)
1.  Navigate to the `hostel-management` directory.
2.  Install dependencies: `npm install`
3.  Verify the API base URL in `src/config.js`.
4.  Start the development server: `npm run dev`

## 📊 Database Schema Overview

The system operates on six primary tables:
*   **`students`**: Core resident data, academic info, and room status.
*   **`admins`**: Administrative credentials and RBAC roles.
*   **`rooms`**: Infrastructure details, capacity, and pricing.
*   **`room_assignments`**: Mapping of students to specific rooms with approval/payment status.
*   **`complaints`**: Grievance records with categories, priority, and resolution notes.
*   **`activity_log`**: System-wide audit trail.

---
*Designed and Developed by Group 15 • 2026*
