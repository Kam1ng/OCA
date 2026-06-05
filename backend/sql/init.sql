CREATE DATABASE IF NOT EXISTS elder_care DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE elder_care;

DROP TABLE IF EXISTS binding;
DROP TABLE IF EXISTS alarm;
DROP TABLE IF EXISTS fence;
DROP TABLE IF EXISTS location_data;
DROP TABLE IF EXISTS health_data;
DROP TABLE IF EXISTS elderly;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'User ID',
    username VARCHAR(50) NOT NULL UNIQUE COMMENT 'Username',
    password VARCHAR(255) NOT NULL COMMENT 'Password (BCrypt encrypted)',
    phone VARCHAR(20) COMMENT 'Phone number (unique identifier)',
    email VARCHAR(100) COMMENT 'Email',
    nickname VARCHAR(50) COMMENT 'Nickname',
    avatar VARCHAR(255) COMMENT 'Avatar URL',
    invite_code VARCHAR(50) COMMENT 'Invitation code',
    user_type VARCHAR(20) NOT NULL DEFAULT 'guardian' COMMENT 'User type: elderly, guardian',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Created time',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Updated time',
    deleted TINYINT(1) DEFAULT 0 COMMENT 'Deleted flag'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='User table';

CREATE TABLE elderly (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'Elderly ID',
    user_id BIGINT NOT NULL COMMENT 'Family user ID',
    name VARCHAR(50) NOT NULL COMMENT 'Elderly name',
    age INT COMMENT 'Age',
    gender TINYINT(1) COMMENT 'Gender: 0-Male, 1-Female',
    phone VARCHAR(20) COMMENT 'Phone number',
    address VARCHAR(255) COMMENT 'Address',
    emergency_contact VARCHAR(50) COMMENT 'Emergency contact',
    emergency_phone VARCHAR(20) COMMENT 'Emergency contact phone',
    health_notes TEXT COMMENT 'Health notes',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Created time',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Updated time',
    deleted TINYINT(1) DEFAULT 0 COMMENT 'Deleted flag',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Elderly information table';

CREATE TABLE binding (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'Binding ID',
    guardian_id BIGINT NOT NULL COMMENT 'Guardian user ID',
    elderly_id BIGINT NOT NULL COMMENT 'Elderly ID',
    status TINYINT(1) DEFAULT 0 COMMENT 'Status: 0-Pending, 1-Accepted, 2-Rejected',
    invite_code VARCHAR(50) COMMENT 'Invitation code',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Created time',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Updated time',
    deleted TINYINT(1) DEFAULT 0 COMMENT 'Deleted flag',
    FOREIGN KEY (guardian_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (elderly_id) REFERENCES elderly(id) ON DELETE CASCADE,
    UNIQUE KEY uk_guardian_elderly (guardian_id, elderly_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Guardian-elderly binding table';

CREATE TABLE health_data (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'Health data ID',
    elderly_id BIGINT NOT NULL COMMENT 'Elderly ID',
    heart_rate INT COMMENT 'Heart rate (bpm)',
    systolic_pressure INT COMMENT 'Systolic pressure (mmHg)',
    diastolic_pressure INT COMMENT 'Diastolic pressure (mmHg)',
    temperature DECIMAL(4,1) COMMENT 'Temperature (C)',
    sleep_status TINYINT(1) COMMENT 'Sleep status: 0-Awake, 1-Sleeping',
    sleep_duration DECIMAL(4,1) COMMENT 'Sleep duration (hours)',
    steps INT COMMENT 'Steps count',
    source TINYINT(1) DEFAULT 0 COMMENT 'Source: 0-Manual, 1-Device',
    record_time DATETIME NOT NULL COMMENT 'Record time',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Created time',
    FOREIGN KEY (elderly_id) REFERENCES elderly(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Health data table';

CREATE TABLE location_data (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'Location data ID',
    elderly_id BIGINT NOT NULL COMMENT 'Elderly ID',
    latitude DECIMAL(10,6) NOT NULL COMMENT 'Latitude',
    longitude DECIMAL(10,6) NOT NULL COMMENT 'Longitude',
    accuracy DECIMAL(10,2) COMMENT 'Accuracy (meters)',
    address VARCHAR(255) COMMENT 'Address description',
    update_time DATETIME NOT NULL COMMENT 'Update time',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Created time',
    FOREIGN KEY (elderly_id) REFERENCES elderly(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Location data table';

CREATE TABLE fence (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'Fence ID',
    elderly_id BIGINT NOT NULL COMMENT 'Elderly ID',
    name VARCHAR(50) NOT NULL COMMENT 'Fence name',
    center_latitude DECIMAL(10,6) NOT NULL COMMENT 'Center latitude',
    center_longitude DECIMAL(10,6) NOT NULL COMMENT 'Center longitude',
    radius INT NOT NULL COMMENT 'Radius (meters)',
    enabled TINYINT(1) DEFAULT 1 COMMENT 'Enabled',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Created time',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Updated time',
    deleted TINYINT(1) DEFAULT 0 COMMENT 'Deleted flag',
    FOREIGN KEY (elderly_id) REFERENCES elderly(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Electronic fence table';

CREATE TABLE alarm (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'Alarm ID',
    elderly_id BIGINT NOT NULL COMMENT 'Elderly ID',
    type TINYINT(1) NOT NULL COMMENT 'Alarm type: 1-Emergency, 2-Geofence',
    status TINYINT(1) DEFAULT 0 COMMENT 'Status: 0-Unhandled, 1-Handled',
    message VARCHAR(255) COMMENT 'Alarm message',
    latitude DECIMAL(10,6) COMMENT 'Alarm location latitude',
    longitude DECIMAL(10,6) COMMENT 'Alarm location longitude',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Created time',
    handled_at DATETIME COMMENT 'Handled time',
    FOREIGN KEY (elderly_id) REFERENCES elderly(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Alarm record table';

INSERT INTO users (username, password, phone, nickname, user_type) VALUES
('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMye.IjzqAKL9xL5jvMFVdNJHvGCgTq/VEq', '13800138000', 'Admin', 'guardian'),
('guardian1', '$2a$10$N9qo8uLOickgx2ZMRZoMye.IjzqAKL9xL5jvMFVdNJHvGCgTq/VEq', '13800138001', 'Guardian', 'guardian'),
('elderly1', '$2a$10$N9qo8uLOickgx2ZMRZoMye.IjzqAKL9xL5jvMFVdNJHvGCgTq/VEq', '13900139001', 'ElderlyLi', 'elderly'),
('elderly2', '$2a$10$N9qo8uLOickgx2ZMRZoMye.IjzqAKL9xL5jvMFVdNJHvGCgTq/VEq', '13900139002', 'ElderlyWang', 'elderly');

INSERT INTO elderly (user_id, name, age, gender, phone, address, emergency_contact, emergency_phone) VALUES
(1, 'Admin', 65, 0, '13800138000', 'System', 'None', 'None'),
(3, 'Grandma Li', 75, 1, '13900139001', 'Beijing', 'Guardian', '13800138001'),
(4, 'Grandpa Wang', 80, 0, '13900139002', 'Beijing', 'Guardian', '13800138002');

INSERT INTO binding (guardian_id, elderly_id, status, invite_code) VALUES
(2, 2, 1, 'GUARDIAN1'),
(2, 3, 0, 'GUARDIAN1');

INSERT INTO health_data (elderly_id, heart_rate, systolic_pressure, diastolic_pressure, temperature, sleep_status, sleep_duration, record_time) VALUES
(2, 72, 120, 80, 36.5, 0, 7.5, NOW()),
(3, 68, 115, 75, 36.4, 1, 8.0, NOW());

INSERT INTO location_data (elderly_id, latitude, longitude, accuracy, address, update_time) VALUES
(2, 39.9042, 116.4074, 10.0, 'Beijing', NOW()),
(3, 39.9142, 116.4174, 15.0, 'Beijing', NOW());

INSERT INTO fence (elderly_id, name, center_latitude, center_longitude, radius, enabled) VALUES
(2, 'Home', 39.9042, 116.4074, 500, 1),
(3, 'Home', 39.9142, 116.4174, 300, 1);

INSERT INTO alarm (elderly_id, type, status, message, latitude, longitude) VALUES
(2, 1, 0, 'Emergency SOS', 39.9042, 116.4074);