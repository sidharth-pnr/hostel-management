# System Architecture Design (Chapter 4 - SDD)
## Hostel Management System - "Campus Housing"

### 1. Architectural Overview
The system follows a **3-Tier Architecture** to ensure separation of concerns, scalability, and security, as required by the KTU CSD334 syllabus.

#### A. Presentation Layer (Frontend)
- **Technology:** React.js (Vite)
- **Styling:** TailwindCSS (Kerala-style UI, clean and professional)
- **State Management:** React Hooks (useState, useEffect)
- **Routing:** React Router DOM (Role-based access control)
- **Responsibility:** Handles User Interface, input validation, and communication with the API.

#### B. Application Layer (Backend API)
- **Technology:** PHP (XAMPP Environment)
- **Pattern:** RESTful API Design
- **Responsibility:** Business logic execution (room allocation logic, complaint lifecycle management, authentication), and secure data processing using Prepared Statements.

#### C. Data Layer (Database)
- **Technology:** MySQL
- **Responsibility:** Persistent storage of student records, room status, assignments, and complaints. Ensures data integrity through Foreign Key constraints.

---

### 2. Module Integration Design
The system is designed with interconnected modules rather than isolated silos:
1. **Student Management:** Integrated with Room Allocation (student status must be APPROVED to book).
2. **Room Management:** Real-time occupancy tracking linked to Room Assignments.
3. **Complaint Management:** Integrated into both Student and Admin dashboards. Complaints are linked directly to `student_id` for traceability.

---

### 3. Security Design
- **Authentication:** Password hashing using `password_hash()` (bcrypt).
- **Authorization:** Role-based access control (RBAC) enforced at both Frontend (Routes) and Backend (Role validation).
- **Data Safety:** Protection against SQL Injection via MySQLi Prepared Statements.
- **CORS:** Controlled access via `Access-Control-Allow-Origin` headers.

---

### 4. User Experience (UX) Strategy
- **Aesthetics:** High-contrast typography, professional grid layout, and interactive feedback (Toast notifications).
- **Ergonomics:** Minimal clicks for core actions (e.g., One-click complaint status update for admins).
- **Accessibility:** Responsive design for both desktop and mobile devices.
