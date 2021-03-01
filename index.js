const mysql = require("mysql");
const inquirer = require("inquirer");
require("console.table");
const util = require("util");
const fs = require("fs");
// set up db
const db = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "jbm12345",
  database: "employee_db",
});
db.connect();

db.query = util.promisify(db.query);

async function start() {
  console.log("-----------------------------------------");
  let choice = await inquirer.prompt([
    {
      type: "list",
      message: "Choose an action: ",
      name: "choice",
      choices: [
        "View employees",
        "View Managers",
        "View employees by department",
        "Add new employee",
        "Edit an exsisting employee",
        "Remove an employee",
        "Update an employee role",
        "Add new role for employees",
        "View all departments",
        "Add new department",
        "Remove department",
        "End",
      ],
    },
  ]);
  console.log(choice.choice);
  switch (choice.choice) {
    case "View employees":
      showEmps();
      break;
    case "View Managers":
      getManagers();
      break;
    case "View employees by department":
      showByDept();
      break;
    case "Add new employee":
      addEmp();
      break;
    case "Edit an exsisting employee":
      editEmp();
      break;
    case "Remove an employee":
      rmvEmp();
      break;
    case "Update an employee role":
      changeRole();
      break;
    case "Add new role for employees":
      newRole();
      break;
    case "Add new department":
      newDept();
      break;
    case "View all departments":
      showDept();
      break;
    case "Remove department":
      rmvDept();
      break;
    default:
      console.log("BYE");
      break;
  }
}

async function showEmps() {
  let query =
    "SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager FROM employee LEFT JOIN role on employee.role_id = role.id LEFT JOIN department on role.department_id = department.id LEFT JOIN employee manager on manager.id = employee.manager_id;";
  await db.query(query, (err, res) => {
    if (err) throw err;
    console.log("-----------------------------------------");
    console.table(res);
    console.log("-----------------------------------------");
    start();
  });
}

//gets department names then gets + displays employees after receiving inquirer input on which department
async function showByDept() {
  let query = await db.query("SELECT * FROM department;");
  //res.forEach((v) => console.log(v));
  const depchoices = query.map((choice) => ({
    name: choice.name,
    id: choice.id,
  }));
  const depatments = await inquirer
    .prompt([
      {
        name: "deptChoice",
        type: "list",
        message: "Pick a department",
        choices: depchoices,
      },
    ])
    .then(async (res) => {
      let query =
        "SELECT employee.first_name, employee.last_name, department.name FROM employee LEFT JOIN role ON employee.role_id = role.id LEFT JOIN department ON department.id = role.department_id WHERE department.name= ?;";

      const results = await db.query(query, res.deptChoice);
      console.log("-----------------------------------------");
      console.table(results);
      console.log("-----------------------------------------");
      start();
    });
}

//gets roles to give to new employee then gets user inputs for new employee and adds to database
async function addEmp() {
  let query = "SELECT role.id, role.title, role.salary FROM role";
  const roledata = await db.query(query);
  const roles = roledata.map(({ id, title, salary }) => ({
    value: id,
    title: title,
    salary: salary,
  }));
  console.table(roles);
  await inquirer
    .prompt([
      {
        type: "input",
        name: "firstName",
        message: "Enter the employee's first name: ",
      },
      {
        type: "input",
        name: "lastName",
        message: "Enter the employee's last name: ",
      },
      {
        type: "list",
        name: "role",
        message: "Select a role for new employee: ",
        choices: roles,
      },
      {
        type: "input",
        name: "managerId",
        message:
          "Enter the manager id, if none employee will be set as a manager",
        default: "null",
      },
    ])
    .then(async (res) => {
      //if (res.mangerId == "" || undefined) res.mangerId = NULL;
      let query = "INSERT INTO employee SET ?";
      await db.query(query, {
        first_name: res.firstName,
        last_name: res.lastName,
        role_id: res.role,
        manager_id: `${res.managerId}`,
      });
      console.log("Employee was added");
      //showEmps();
      start();
    });
}

// gets list of employees and passes it to updateEmp function
async function editEmp() {
  let query =
    "SELECT id, CONCAT(first_name, ' ', last_name) AS name FROM employee";
  const empdata = await db.query(query);
  const empList = empdata.map(({ id, name }) => ({
    value: id,
    name: name,
  }));
  let query2 = "SELECT role.id, role.title, role.salary FROM role";
  const roleData = await db.query(query2);
  const roles = roleData.map(({ id, title, salary }) => ({
    value: id,
    title: title,
    salary: salary,
  }));
  console.table(roles);
  let query3 =
    "SELECT id, CONCAT(first_name, ' ', last_name) AS manager FROM employee WHERE manager_id IS NULL; ";
  const managerData = await db.query(query3);
  const managers = managerData.map(({ id, manager }) => ({
    value: id,
    name: manager,
  }));
  await inquirer
    .prompt([
      {
        type: "list",
        name: "emp",
        message: "Which employee would you like to change roles? ",
        choices: empList,
      },
      {
        type: "input",
        name: "firstName",
        message: "Update the employee's first name: ",
      },
      {
        type: "input",
        name: "lastName",
        message: "Update the employee's last name: ",
      },
      {
        type: "list",
        name: "role",
        message: "Update a role for new employee: ",
        choices: roles,
      },
      {
        type: "list",
        name: "managerId",
        message:
          "Enter the manager id, if none employee will be set as a manager",
        choices: managers,
        default: "null",
      },
    ])
    .then((res) => {
      console.log(res);
      //if (res.mangerId == "" || undefined) res.mangerId = NULL;
      let query = "UPDATE employee SET ? WHERE id=?";
      db.query(query, [
        {
          first_name: res.firstName,
          last_name: res.lastName,
          role_id: res.role,
          manager_id: `${res.managerId}`,
        },
        res.emp,
      ]);

      console.log("Employee was Updated");
      //showEmps();
    });
  start();
}

async function getManagers() {
  let query =
    "SELECT id, CONCAT(first_name, ' ', last_name) AS manager FROM employee WHERE manager_id IS NULL; ";
  await db.query(query, (err, res) => {
    if (err) throw err;
    const managers = res.map(({ id, manager }) => ({
      value: id,
      name: manager,
    }));
    console.table(managers);
    start();
    return;
    // return managers;
  });
}

// gets employees and passses to rmvEmp fnct
async function rmvEmp() {
  let query =
    "SELECT id, CONCAT(first_name, ' ', last_name) AS name FROM employee";
  const data = await db.query(query);
  const empList = data.map(({ id, name }) => ({
    value: id,
    name: name,
  }));
  await inquirer
    .prompt([
      {
        type: "list",
        name: "emp",
        message: "Select the employee to remove: ",
        choices: empList,
      },
    ])
    .then(async (res) => {
      console.log(res);
      let thisID = parseInt(res.emp);
      let query = "DELETE FROM employee WHERE id = ?";
      await db.query(query, thisID);
      console.log("Employee was removed");
      //showEmps();
    });

  start();
  return;
}

// takes iquirer info to delete a department from the data
async function rmvDept() {
  let query = await db.query("SELECT * FROM department;");
  //res.forEach((v) => console.log(v));
  const depchoices = query.map((choice) => ({
    name: choice.name,
    id: choice.id,
  }));

  await inquirer
    .prompt([
      {
        type: "list",
        name: "dept",
        message: "Select the department to remove: ",
        choices: depchoices,
      },
    ])
    .then(async (res) => {
      let query = "DELETE FROM department WHERE name = ?";
      await db.query(query, res.dept);
      console.log("department was removed");
    });
  showDept();
  start();
  return;
}

async function newRole() {
  const deptData = await db.query("SELECT name, id FROM department;");
  const departments = deptData.map(({ name, id }) => ({
    name: name,
    value: id,
  }));
  await inquirer
    .prompt([
      {
        type: "input",
        name: "role",
        message: "New role title: ",
      },
      {
        type: "number",
        name: "salary",
        message: "What is the salary for the new role? $",
      },
      {
        type: "list",
        name: "depts",
        message: "what department is the new role in? ",
        choices: departments,
      },
    ])
    .then(async (res) => {
      console.log(res.depts);
      let query = "INSERT INTO role SET ?";
      await db.query(query, {
        title: res.role,
        salary: res.salary,
        department_id: res.depts,
      });
      console.log("Role was added");
    });
  start();
  return;
}

// displays all departments to the user
async function showDept() {
  let query = await db.query("SELECT * FROM department;");
  //res.forEach((v) => console.log(v));
  const depchoices = query.map((choice) => ({
    name: choice.name,
    id: choice.id,
  }));
  console.table(depchoices);
  start();
  return;
}

// takes in user input from iquirer to add new department to DB
async function newDept() {
  await inquirer
    .prompt([
      {
        type: "input",
        name: "name",
        message: "New department name: ",
      },
    ])
    .then(async (res) => {
      console.log(res.name);
      let query = "INSERT INTO department SET ?";
      await db.query(query, {
        name: res.name,
      });
      console.log("Department was added");
    });
  showDept();
  start();
}

// gets employee+role selection for inquirer then updates role in DB
async function changeRole() {
  let query1 =
    "SELECT CONCAT(id,' ',first_name,' ', last_name) AS name FROM employee;";
  const q1res = await db.query(query1);
  const empList = q1res.map(({ name }) => ({
    name: name,
  }));
  let query2 = "SELECT id, CONCAT( id, ' ', title) AS title_id FROM role";
  const roles = await db.query(query2);
  const roleList = roles.map(({ title_id }) => ({
    title_id: title_id,
  }));
  let newrole = [];
  let listEmp = [];
  empList.forEach((emp) => listEmp.push(emp));
  roleList.forEach((role) => newrole.push(role.title_id));
  await inquirer
    .prompt([
      {
        type: "list",
        name: "emp",
        message: "Which employee would you like to change roles? ",
        choices: listEmp,
      },
      {
        type: "list",
        name: "role",
        message: "What is there new role? ",
        choices: newrole,
      },
    ])
    .then(async (res) => {
      console.log(res);
      var x = res;
      console.log(x);
      firstName = res.emp.split(" ");
      var y = x.role.split(" ");
      var z = parseInt(y[0]);
      console.log(z);
      let query =
        "UPDATE employee SET " +
        `role_id = ${z}` +
        ` WHERE id = ${firstName[0]}`;
      const addemp = await db.query(query);
      console.log("Role was updated");
    });
  start();
  // start();
  return;
}

start();
