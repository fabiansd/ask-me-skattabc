-- This runs AFTER Prisma migrations when you first run migrate dev
-- So we insert data here knowing tables exist

-- Test users (using ON CONFLICT to prevent duplicates)
INSERT INTO users (username, email, auth_provider, google_id) VALUES
('testuser1', 'test1@example.com', 'username', NULL),
('googleuser', 'google@example.com', 'google', 'google_123456789'),
('admin', 'admin@skattabc.no', 'username', NULL),
('fabian', 'fabian@example.com', 'username', NULL),
('default', 'default@example.com', 'username', NULL)
ON CONFLICT (username) DO NOTHING;

-- Test query history
INSERT INTO query_history (user_id, question, answer, feedback) VALUES
(1, 'What is tax deduction?', 'A tax deduction reduces your taxable income...', true),
(2, 'How to file taxes?', 'You can file taxes online or by mail...', NULL),
(1, 'VAT rules in Norway?', 'VAT in Norway is generally 25%...', true);

-- Test feedback
INSERT INTO user_feedback (user_id, desired_features, happiness_feedback) VALUES
(1, 'Better search functionality', 'Very satisfied with the service'),
(2, 'Mobile app', 'Good but could be faster');