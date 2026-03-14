-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3307
-- Generation Time: Mar 14, 2026 at 06:30 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `hostel_database`
--
CREATE DATABASE IF NOT EXISTS `hostel_database` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `hostel_database`;

-- --------------------------------------------------------

--
-- Table structure for table `activity_log`
--

CREATE TABLE IF NOT EXISTS `activity_log` (
  `log_id` int(11) NOT NULL AUTO_INCREMENT,
  `message` varchar(255) NOT NULL,
  `type` enum('registration','complaint','infrastructure','allocation') NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `performed_by` varchar(100) DEFAULT 'System',
  `target_student_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`log_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `admins`
--

CREATE TABLE IF NOT EXISTS `admins` (
  `admin_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('SUPER','STAFF') DEFAULT 'STAFF',
  PRIMARY KEY (`admin_id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `complaints`
--

CREATE TABLE IF NOT EXISTS `complaints` (
  `complaint_id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `status` enum('PENDING','ASSIGNED','IN_PROGRESS','RESOLVED','CLOSED','REJECTED') DEFAULT 'PENDING',
  `created_at` datetime DEFAULT current_timestamp(),
  `in_progress_at` datetime DEFAULT NULL,
  `resolved_at` datetime DEFAULT NULL,
  `priority` enum('Low','Medium','High','Urgent') DEFAULT 'Low',
  `category` enum('Electrical','Plumbing','Internet','Furniture','Cleaning','Other') DEFAULT 'Other',
  `description` text DEFAULT NULL,
  `resolution_note` text DEFAULT NULL,
  `issue_image` varchar(255) DEFAULT NULL,
  `resolution_image` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`complaint_id`),
  KEY `fk_student_complaints` (`student_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `rooms`
--

CREATE TABLE IF NOT EXISTS `rooms` (
  `room_id` int(11) NOT NULL AUTO_INCREMENT,
  `block` varchar(10) DEFAULT NULL,
  `room_number` varchar(10) NOT NULL,
  `capacity` int(11) DEFAULT 3,
  `current_occupancy` int(11) NOT NULL,
  `price` decimal(10,2) NOT NULL DEFAULT 0.00,
  PRIMARY KEY (`room_id`),
  UNIQUE KEY `room_number` (`room_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `room_assignments`
--

CREATE TABLE IF NOT EXISTS `room_assignments` (
  `assignment_id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `room_id` int(11) NOT NULL,
  `status` enum('ALLOCATED','REQUESTED','SUGGESTED','REJECTED','APPROVED') DEFAULT NULL,
  `reason` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `payment_status` enum('NOT_REQUIRED','PENDING','COMPLETED') DEFAULT 'NOT_REQUIRED',
  PRIMARY KEY (`assignment_id`),
  KEY `student_id` (`student_id`),
  KEY `room_id` (`room_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Triggers `room_assignments`
--
DELIMITER $$
CREATE TRIGGER `after_room_delete` AFTER DELETE ON `room_assignments` FOR EACH ROW UPDATE rooms SET current_occupancy = (SELECT COUNT(*) FROM room_assignments WHERE room_id = OLD.room_id AND status = 'ALLOCATED') WHERE room_id = OLD.room_id
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `after_room_insert` AFTER INSERT ON `room_assignments` FOR EACH ROW UPDATE rooms SET current_occupancy = (SELECT COUNT(*) FROM room_assignments WHERE room_id = NEW.room_id AND status = 'ALLOCATED') WHERE room_id = NEW.room_id
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `after_room_update` AFTER UPDATE ON `room_assignments` FOR EACH ROW UPDATE rooms SET current_occupancy = (SELECT COUNT(*) FROM room_assignments WHERE room_id = NEW.room_id AND status = 'ALLOCATED') WHERE room_id = NEW.room_id
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `students`
--

CREATE TABLE IF NOT EXISTS `students` (
  `student_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `reg_no` varchar(20) NOT NULL,
  `password` varchar(255) NOT NULL,
  `account_status` enum('PENDING','ACTIVE','REJECTED') DEFAULT 'PENDING',
  `phone` varchar(10) DEFAULT NULL,
  `department` varchar(50) DEFAULT NULL,
  `year` int(11) DEFAULT 1,
  `created_at` datetime DEFAULT current_timestamp(),
  `assigned_at` datetime DEFAULT NULL,
  `requested_at` datetime DEFAULT NULL,
  PRIMARY KEY (`student_id`),
  UNIQUE KEY `reg_no` (`reg_no`)
) ;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `complaints`
--
ALTER TABLE `complaints`
  ADD CONSTRAINT `complaints_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_student_complaints` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE;

--
-- Constraints for table `room_assignments`
--
ALTER TABLE `room_assignments`
  ADD CONSTRAINT `fk_student_assignment` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
