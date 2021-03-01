

DROP DATABASE IF EXISTS employee_db;
CREATE DATABASE employee_db;

USE employee_db;
CREATE TABLE department(
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(30) UNIQUE NOT NULL
);

CREATE TABLE role(
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(30) UNIQUE NOT NULL,
    salary DECIMAL UNSIGNED NOT NULL,
    department_id INT UNSIGNED NOT NULL,
    CONSTRAINT fk_department FOREIGN KEY (department_id) REFERENCES department(id) ON DELETE CASCADE
);


CREATE TABLE employee(
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(30) NOT NULL,
    last_name VARCHAR(30) NOT NULL,
    role_id INT UNSIGNED NOT NULL, 
    CONSTRAINT fk_role FOREIGN KEY (role_id) REFERENCES role(id) ON DELETE CASCADE,
    manager_id INT UNSIGNED,
    INDEX manager_ind (manager_id),
    CONSTRAINT fk_manager FOREIGN KEY (manager_id) REFERENCES employee(id) ON DELETE SET NULL 
);

INSERT INTO department (`name`)
VALUES 
('SALES'),
('DEVELOPMENT'),
('LEGAL');

INSERT INTO role (title, salary, department_id)
VALUES
('Sales', 75000, 1),
('Sales Lead', 90000, 1),
('Developer', 80000, 2),
('Dev Lead', 125000, 2),
('Lawyer', 15000, 3),
('Lawyer Lead', 175000, 3);
-- insert managers
INSERT INTO employee (first_name, last_name, role_id)
VALUES
('Bob', 'Ross', 2),
('Joe' , 'Rogan' , 4),
('Jack', 'Harlow', 6);

-- insert employees
INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES
('Bob', 'Robertson', 1, 1),
('Meek', 'Mills', 2, 2),
('Van', 'Wilder', 3, 1),
('Gill', 'Jackson', 4, 2),
('Marsha', 'Brady', 5, 3),
('Jane', 'Doe', 6, 3);

