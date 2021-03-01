
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
('Lesli', 'Knope', 3, 1),
('Lucille', 'Bluth', 4, 2),
('Leslie', 'Knope', 5, 3),
('Rosa', 'Diaz', 6, 3);