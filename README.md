# Hostel Room Allocation and Complaint Management System
## Campus Housing — Official Digital Portal

An official digital ecosystem designed to streamline hostel administration, automate room allocation, and provide rapid complaint resolution for the **College of Engineering Trikaripur**. This project is developed as part of the **KTU 2019 Scheme Mini Project (Course Code: CSD334)**.

---

### 🏗️ System Architecture & Tech Stack
The project follows a robust **3-Tier Architecture** designed for scalability, security, and high performance:
*   **Frontend:** React 19 (Vite) + Tailwind CSS + Framer Motion. Powered by **TanStack Query** for efficient server-state management and real-time synchronization.
*   **Backend:** RESTful PHP API (XAMPP environment) utilizing a structured utility layer to enforce standardized JSON responses and security protocols.
*   **Database:** MySQL with a relational schema focused on data integrity through strict Foreign Key constraints and occupancy tracking.

### 🛡️ Role-Based Access Control (RBAC)
The system enforces granular security boundaries at both the frontend and backend layers:
*   **Student Role:** Handles registration, room browsing (post-warden approval), digital check-in, and the integrated grievance portal.
*   **Staff Admin:** Responsible for vetting student registrations, tracking block-wise occupancy, and managing the maintenance lifecycle.
*   **Super Admin:** Holds master control over system infrastructure, including decommission of rooms and provisioning of administrative credentials.

### 🚀 Core Functional Modules
*   **Residential Lifecycle:** A seamless end-to-end flow: Registration $\rightarrow$ Warden Approval $\rightarrow$ Smart Room Browsing $\rightarrow$ Payment $\rightarrow$ Digital Allocation.
*   **Integrated Complaint Management:** A comprehensive "ticketing" system where students track maintenance requests from `PENDING` to `RESOLVED` with real-time status updates and resolution logs.
*   **Infrastructure Heatmap:** Data-driven admin overview using **Recharts** to visualize block density, occupancy rates, and maintenance hotspots.

### 🎨 Modern Design Philosophy
The application implements professional UI/UX trends to deliver a premium academic experience:
*   **Glassmorphism:** Extensive use of `backdrop-blur` and semi-transparent layouts to create a lightweight, "frosted glass" aesthetic.
*   **Bento Box Architecture:** Modular grid-based dashboards that organize complex system metrics into digestible, high-impact interactive blocks.
*   **Cinematic UX:** High-fidelity transitions, hover states, and entrance animations powered by **Framer Motion** for a modern "app-like" feel.

### 🔒 Technical Integrity & Security
*   **SQL Safety:** Full implementation of **MySQLi Prepared Statements** across all API endpoints to effectively neutralize SQL injection risks.
*   **Credential Security:** Advanced user protection using **bcrypt** via `password_hash()` and `password_verify()`.
*   **Surgical Connectivity:** Direct mapping between React components and PHP service layers, ensuring a fully functional and synchronized ecosystem.

---

### 🛠️ Installation & Setup

#### Prerequisites
*   Node.js (v18+)
*   XAMPP (Apache & MySQL modules)

#### Backend Setup (PHP/MySQL)
1.  Move the `hostel_room_api` folder to your XAMPP `htdocs` directory.
2.  Create a MySQL database named `hostel_database` via phpMyAdmin.
3.  Ensure your MySQL port is correctly configured in `db.php` (default is usually 3306 or 3307).

#### Frontend Setup (React)
1.  Navigate to the `hostel-management` directory.
2.  Install dependencies: `npm install`
3.  Verify the `API_BASE` URL in `src/config.js`.
4.  Launch the application: `npm run dev`

---
*Designed and Developed by Group 15 • 2026*
