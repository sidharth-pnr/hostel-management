# Campus Housing Management System

The official digital ecosystem for hostel room allocation and rapid grievance resolution at College of Engineering Trikaripur.

## 🚀 Recent Progress (Session: Feb 28, 2026)

### 🎨 Frontend Redesign ("Campus Housing" Branding)
- **New Landing Gateway:** A premium entrance with cinematic "Ken Burns" backgrounds, smooth-scroll navigation, and a 4-step "Scholar's Path" guide.
- **Zero-Scroll Portals:** Redesigned Login and Registration pages using a 60/40 cinematic split-screen layout, optimized to fit perfectly within the viewport.
- **Student Desk (Overview):** ⚠️ *REDESIGN NOT COMPLETED* - Current functional logic is implemented (independent loading, history feed), but the **visual layout and structure need to be completely revisited** in the next session to meet project standards.

### ⚙️ Backend & Security (RBAC Implementation)
- **Role-Based Access Control:** 
    - `SUPER` Admins: Full authority (Infrastructure, permanent deletion, admin accounts).
    - `STAFF` Admins: Operational authority (Approvals, allocations, grievances).
- **System Logs Upgrade:** Added `target_student_id` to enable personalized history feeds.
- **Database Healing:** Resolved a data drift issue in room occupancy counts.

## 📅 Pending Tasks for Morning
1.  **Re-Redesign Student Desk:** Brainstorm and implement a better structure for the resident dashboard.
2.  **Redesign `BookRoom.jsx` (Student Stays):** Implement the "Architecture Map" grid.
3.  **Redesign `Complaints.jsx` (Grievance Center):** Ticket-card layout.
4.  **Admin Redesign:** Overhaul the Warden's command center pages.

---
*Designed and Developed by Group 15*
