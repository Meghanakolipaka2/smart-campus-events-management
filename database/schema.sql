-- Smart Campus Event Management System
-- MySQL Database Schema
-- Run this in MySQL before starting the backend

CREATE DATABASE IF NOT EXISTS smart_campus CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE smart_campus;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('student', 'organizer', 'admin') DEFAULT 'student',
    interests TEXT DEFAULT '[]',
    points INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Venues Table
CREATE TABLE IF NOT EXISTS venues (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) UNIQUE NOT NULL,
    capacity INT,
    location VARCHAR(200),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Events Table
CREATE TABLE IF NOT EXISTS events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category ENUM('technical', 'cultural', 'sports', 'workshop', 'nss', 'fest') NOT NULL,
    date VARCHAR(20) NOT NULL,
    time VARCHAR(10) NOT NULL,
    venue VARCHAR(200) NOT NULL,
    max_participants INT DEFAULT 50,
    organizer_id INT NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    tags TEXT DEFAULT '[]',
    popularity_score INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organizer_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_date (date),
    INDEX idx_category (category),
    INDEX idx_status (status)
);

-- Registrations Table
CREATE TABLE IF NOT EXISTS registrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    event_id INT NOT NULL,
    registered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    attended BOOLEAN DEFAULT FALSE,
    UNIQUE KEY unique_reg (user_id, event_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- Bookmarks Table
CREATE TABLE IF NOT EXISTS bookmarks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    event_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_bookmark (user_id, event_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT,
    type VARCHAR(20) DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_read (user_id, is_read)
);

-- ────────────────────────────
-- Seed Demo Data
-- ────────────────────────────

-- Demo Users (password: demo123 — bcrypt hashed)
INSERT IGNORE INTO users (name, email, password_hash, role) VALUES
('Demo Student', 'student@demo.com', '$2b$12$xAMdFXOsC6KZNZriAOYlWOZbovFp5c0dWgmxh3Gb.VLulB7pCHJUG', 'student'),
('Demo Organizer', 'organizer@demo.com', '$2b$12$xAMdFXOsC6KZNZriAOYlWOZbovFp5c0dWgmxh3Gb.VLulB7pCHJUG', 'organizer'),
('Admin User', 'admin@demo.com', '$2b$12$xAMdFXOsC6KZNZriAOYlWOZbovFp5c0dWgmxh3Gb.VLulB7pCHJUG', 'admin');

-- Demo Venues
INSERT IGNORE INTO venues (name, capacity, location) VALUES
('Main Auditorium', 500, 'Block A'),
('Seminar Hall 1', 100, 'Block B'),
('Seminar Hall 2', 120, 'Block B'),
('Sports Ground', 1000, 'Campus Field'),
('Innovation Lab', 60, 'Block C'),
('Open Amphitheatre', 800, 'Campus Center');

-- Demo Events (adjust dates to future)
INSERT IGNORE INTO events (title, description, category, date, time, venue, max_participants, organizer_id, status, tags, popularity_score) VALUES
('National Hackathon 2025', 'A 24-hour hackathon for budding developers. Build innovative solutions to real-world problems.', 'technical', DATE_ADD(CURDATE(), INTERVAL 7 DAY), '09:00', 'Innovation Lab', 60, 2, 'approved', '["hackathon","coding","tech"]', 85),
('Cultural Night Extravaganza', 'Annual cultural fest featuring dance, music, drama, and art from all departments.', 'cultural', DATE_ADD(CURDATE(), INTERVAL 14 DAY), '18:00', 'Open Amphitheatre', 800, 2, 'approved', '["dance","music","culture"]', 92),
('Inter-College Cricket Tournament', 'Compete against top colleges in this 2-day cricket championship.', 'sports', DATE_ADD(CURDATE(), INTERVAL 10 DAY), '08:00', 'Sports Ground', 200, 2, 'approved', '["cricket","sports","tournament"]', 78),
('AI/ML Workshop Series', 'Hands-on workshop on machine learning fundamentals. Bring your laptop.', 'workshop', DATE_ADD(CURDATE(), INTERVAL 5 DAY), '10:00', 'Seminar Hall 1', 80, 2, 'approved', '["ai","ml","workshop","python"]', 88),
('NSS Blood Donation Camp', 'Annual blood donation drive. Your donation saves lives.', 'nss', DATE_ADD(CURDATE(), INTERVAL 3 DAY), '09:00', 'Main Auditorium', 300, 2, 'approved', '["nss","blood","social"]', 65),
('TechFest 2025', 'The biggest annual technical festival with competitions, exhibitions, and expert talks.', 'fest', DATE_ADD(CURDATE(), INTERVAL 21 DAY), '09:00', 'Main Auditorium', 500, 2, 'approved', '["fest","tech","competition"]', 95);
