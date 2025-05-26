-- Insert default roles
INSERT INTO roles (name) VALUES
('ROLE_ADMIN'),
('ROLE_VIP'),
('ROLE_USER');

-- Insert admin user with SCrypt encoded password ('password')
INSERT INTO users (username, email, password, enabled)
VALUES ('admin', 'admin@depo-plans.com', '$e0801$pNRgY7HwlTgBaXWrlA3CMdrCQHIAnL6vX71+PG/VPp94da8O+9xjKp2uPLy17pRnGCmWVGa6qUkXXWBYn5pUCA==$+cwf/eFVt5WHDBasc42X+W84cjIfkeJNJyaNSX0FtzA=', true);

-- Insert VIP and standard users with the same password as admin
INSERT INTO users (username, email, password, enabled)
VALUES 
('vipuser', 'vip@agentstore.com', '$e0801$pNRgY7HwlTgBaXWrlA3CMdrCQHIAnL6vX71+PG/VPp94da8O+9xjKp2uPLy17pRnGCmWVGa6qUkXXWBYn5pUCA==$+cwf/eFVt5WHDBasc42X+W84cjIfkeJNJyaNSX0FtzA=', true),
('user1', 'user1@agentstore.com', '$e0801$pNRgY7HwlTgBaXWrlA3CMdrCQHIAnL6vX71+PG/VPp94da8O+9xjKp2uPLy17pRnGCmWVGa6qUkXXWBYn5pUCA==$+cwf/eFVt5WHDBasc42X+W84cjIfkeJNJyaNSX0FtzA=', true),
('user2', 'user2@agentstore.com', '$e0801$pNRgY7HwlTgBaXWrlA3CMdrCQHIAnL6vX71+PG/VPp94da8O+9xjKp2uPLy17pRnGCmWVGa6qUkXXWBYn5pUCA==$+cwf/eFVt5WHDBasc42X+W84cjIfkeJNJyaNSX0FtzA=', true);

-- Assign ADMIN role to admin user
INSERT INTO user_roles (user_id, role_id)
VALUES (
    (SELECT id FROM users WHERE username = 'admin'),
    (SELECT id FROM roles WHERE name = 'ROLE_ADMIN')
);

-- Assign VIP role to vipuser
INSERT INTO user_roles (user_id, role_id)
VALUES (
    (SELECT id FROM users WHERE username = 'vipuser'),
    (SELECT id FROM roles WHERE name = 'ROLE_VIP')
);

-- Assign USER role to user1 and user2
INSERT INTO user_roles (user_id, role_id)
VALUES 
(
    (SELECT id FROM users WHERE username = 'user1'),
    (SELECT id FROM roles WHERE name = 'ROLE_USER')
),
(
    (SELECT id FROM users WHERE username = 'user2'),
    (SELECT id FROM roles WHERE name = 'ROLE_USER')
);
