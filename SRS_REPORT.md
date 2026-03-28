# SYLLABUS AUDIT & SRS REPORT (KTU CSD334)
## Project: Hostel Room Allocation and Complaint Management System

### 1. Problem Statement
Managing hostel room allocations and student complaints manually is error-prone, time-consuming, and lacks transparency. Traditional methods often lead to overbooking, misplaced complaint records, and delayed maintenance. The "Campus Housing" system aims to digitalize these processes, providing a centralized portal for students to register, request rooms, and report issues, while enabling administrators (Wardens) to manage allocations, track complaint progress, and approve user accounts efficiently.

---

### 2. Functional Requirements (SRS)

#### FR-1: User Management (Student & Admin)
- **Registration:** Students must be able to register with valid details (Reg No, Phone, Year, Dept).
- **Approval:** Admins must approve/reject student accounts before they can access the booking system.
- **Authentication:** Secure login for Students and Admins (Super/Staff roles).

#### FR-2: Room Management & Allocation
- **Room CRUD:** Admins can Add, Update, or Delete room records (Block, Room Number, Capacity, Price).
- **Booking:** Approved students can view available rooms and book them.
- **Occupancy Tracking:** The system must track current occupancy and prevent overbooking (cannot exceed capacity).

#### FR-3: Complaint Management (Integrated)
- **Reporting:** Students can file complaints by category (Electrical, Plumbing, etc.) with priority levels.
- **Tracking:** Students can view the status of their complaints (Pending, In Progress, Resolved).
- **Resolution:** Admins can update complaint status and add resolution notes.

#### FR-4: Dashboard & Reporting
- **Admin Overview:** Real-time statistics on total students, room occupancy, and pending complaints.
- **Student Profile:** Digital ID card view and personal assignment details.

---

### 3. Syllabus Audit - "Unwanted Things" to Prune
Based on the KTU 2019 Scheme syllabus, the following items are flagged for removal or refactoring:

| Item | Status | Action Required |
|------|--------|-----------------|
| `getDemoImage` External URLs | **Flagged** | Replace with local SVG/Icons from `Icons.jsx` to ensure "Self-Contained" deployment. |
| Flashy Background Effects | **Optional** | Keep for "Aesthetics" but ensure they don't impact performance on low-end systems. |
| Hardcoded Mock Data | **Flagged** | Ensure all tables (e.g., in `Overview.jsx`) fetch from the API, not static arrays. |
| `framer-motion` Overuse | **Watch** | Limit animations to essential transitions to maintain a "Professional/Academic" feel. |

---

### 4. Next Steps
- **Refactor Backend:** Implement the Foreign Key constraints defined in `hostel_database.sql`.
- **Refactor Frontend:** Ensure `App.jsx` and all components use the new standardized API structure.
- **Testing:** Create the Test Plan (Functional & Integration Tests).
