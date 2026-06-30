-- Silver14 Nail Database Initialization Script
-- This script runs on first container start

USE silver14_nail_db;

-- Create additional indexes for performance (optional)
-- Add your custom SQL initialization here if needed

-- Example: Create a simple health check table
CREATE TABLE IF NOT EXISTS health_check (
    id INT PRIMARY KEY AUTO_INCREMENT,
    status VARCHAR(20) DEFAULT 'healthy',
    last_check TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO health_check (status) VALUES ('healthy');

-- Set default timezone
SET GLOBAL time_zone = '+00:00';
