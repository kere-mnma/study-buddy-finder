CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  course VARCHAR(100) NOT NULL,
  security_question VARCHAR(255) NOT NULL DEFAULT 'What was your first module studied?',
  security_answer_hash VARCHAR(255),
  last_active TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  modules VARCHAR(255),
  study_location ENUM('online', 'on-campus', 'both') DEFAULT 'both',
  bio TEXT,
  profile_picture VARCHAR(255) DEFAULT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE connections (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sender_id INT NOT NULL,
  receiver_id INT NOT NULL,
  status ENUM('pending', 'accepted', 'declined') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES users(id),
  FOREIGN KEY (receiver_id) REFERENCES users(id)
);

CREATE TABLE study_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  connection_id INT NOT NULL,
  proposed_by INT NOT NULL,
  session_date DATE NOT NULL,
  session_time TIME NOT NULL,
  location VARCHAR(255) NOT NULL,
  status ENUM('proposed', 'confirmed', 'declined') NOT NULL DEFAULT 'proposed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (connection_id) REFERENCES connections(id),
  FOREIGN KEY (proposed_by) REFERENCES users(id)
);

CREATE TABLE user_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  theme VARCHAR(20) NOT NULL DEFAULT 'dark',
  push_notifications BOOLEAN NOT NULL DEFAULT TRUE,
  email_notifications BOOLEAN NOT NULL DEFAULT TRUE,
  sound_effects BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE KEY unique_user_settings (user_id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
