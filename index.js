const inquirer = require('inquirer');
const consoleTable = require('console.table');
const connection = require('./app.js');

function startApp() {
    const choices = [
      'View all departments',
      'View all roles',
      'View all employees',
      'Add a department',
      'Add a role',
      'Add an employee',
      'Update an employee role',
      'Exit'
    ];
  
    inquirer
      .prompt({
        name: 'menuChoice',
        type: 'list',
        message: 'Please select an option:',
        choices: choices
      })
      .then(answer => {
        switch (answer.menuChoice) {
          case 'View all departments':
            viewDepartments();
            break;
          case 'View all roles':
            viewRoles();
            break;
          case 'View all employees':
            viewEmployees();
            break;
          case 'Add a department':
            addDepartment();
            break;
          case 'Add a role':
            addRole();
            break;
          case 'Add an employee':
            addEmployee();
            break;
          case 'Update an employee role':
            updateEmployeeRole();
            break;
          case 'Exit':
            connection.end();
            console.log('Disconnected from the database.');
            break;
        }
      });
  }
  
function viewDepartments() {
  connection.query('SELECT * FROM department', (err, departments) => {
    if (err) {
      console.error('Error retrieving departments: ' + err.stack);
      return;
    }
    console.table('Departments', departments);
    startApp();
  });
}

function viewRoles() {
  connection.query('SELECT * FROM role', (err, roles) => {
    if (err) {
      console.error('Error retrieving roles: ' + err.stack);
      return;
    }
    console.table('Roles', roles);
    startApp();
  });
}

function viewEmployees() {
  const query = `
    SELECT employee.id, employee.first_name, employee.last_name, role.title, role.salary, department.name AS department, CONCAT(manager.first_name, ' ', manager.last_name) AS manager
    FROM employee
    LEFT JOIN role ON employee.role_id = role.id
    LEFT JOIN department ON role.department_id = department.id
    LEFT JOIN employee manager ON employee.manager_id = manager.id
  `;
  connection.query(query, (err, employees) => {
    if (err) {
      console.error('Error retrieving employees: ' + err.stack);
      return;
    }
    console.table('Employees', employees);
    startApp();
  });
}

function addDepartment() {
  inquirer
    .prompt({
      name: 'departmentName',
      type: 'input',
      message: 'Enter the name of the department:'
    })
    .then(answer => {
      const query = 'INSERT INTO department (name) VALUES (?)';
      connection.query(query, [answer.departmentName], err => {
        if (err) {
          console.error('Error adding department: ' + err.stack);
          return;
        }
        console.log('Department added successfully!');
        startApp();
      });
    });
}

function addRole() {
  connection.query('SELECT * FROM department', (err, departments) => {
    if (err) {
      console.error('Error retrieving departments: ' + err.stack);
      return;
    }
    inquirer
      .prompt([
        {
          name: 'title',
          type: 'input',
          message: 'Enter the title of the role:'
        },
        {
          name: 'salary',
          type: 'number',
          message: 'Enter the salary for the role:'
        },
        {
          name: 'departmentId',
          type: 'list',
          message: 'Select the department for the role:',
          choices: departments.map(department => ({
            name: department.name,
            value: department.id
          }))
        }
      ])
      .then(answer => {
        const query = 'INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)';
        connection.query(query, [answer.title, answer.salary, answer.departmentId], err => {
          if (err) {
            console.error('Error adding role: ' + err.stack);
            return;
          }
          console.log('Role added successfully!');
          startApp();
        });
      });
  });
}

function addEmployee() {
  connection.query('SELECT * FROM role', (err, roles) => {
    if (err) {
      console.error('Error retrieving roles: ' + err.stack);
      return;
    }
    connection.query('SELECT * FROM employee', (err, employees) => {
      if (err) {
        console.error('Error retrieving employees: ' + err.stack);
        return;
      }
      inquirer
        .prompt([
          {
            name: 'firstName',
            type: 'input',
            message: "Enter the employee's first name:"
          },
          {
            name: 'lastName',
            type: 'input',
            message: "Enter the employee's last name:"
          },
          {
            name: 'roleId',
            type: 'list',
            message: "Select the employee's role:",
            choices: roles.map(role => ({
              name: role.title,
              value: role.id
            }))
          },
          {
            name: 'managerId',
            type: 'list',
            message: "Select the employee's manager:",
            choices: [...employees.map(employee => ({
              name: `${employee.first_name} ${employee.last_name}`,
              value: employee.id
            })), { name: 'None', value: null }]
          }
        ])
        .then(answer => {
          const query = 'INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)';
          connection.query(query, [answer.firstName, answer.lastName, answer.roleId, answer.managerId], err => {
            if (err) {
              console.error('Error adding employee: ' + err.stack);
              return;
            }
            console.log('Employee added successfully!');
            startApp();
          });
        });
    });
  });
}

function updateEmployeeRole() {
  connection.query('SELECT * FROM employee', (err, employees) => {
    if (err) {
      console.error('Error retrieving employees: ' + err.stack);
      return;
    }
    connection.query('SELECT * FROM role', (err, roles) => {
      if (err) {
        console.error('Error retrieving roles: ' + err.stack);
        return;
      }
      inquirer
        .prompt([
          {
            name: 'employeeId',
            type: 'list',
            message: 'Select the employee to update:',
            choices: employees.map(employee => ({
              name: `${employee.first_name} ${employee.last_name}`,
              value: employee.id
            }))
          },
          {
            name: 'roleId',
            type: 'list',
            message: 'Select the new role for the employee:',
            choices: roles.map(role => ({
              name: role.title,
              value: role.id
            }))
          }
        ])
        .then(answer => {
          const query = 'UPDATE employee SET role_id = ? WHERE id = ?';
          connection.query(query, [answer.roleId, answer.employeeId], err => {
            if (err) {
              console.error('Error updating employee role: ' + err.stack);
              return;
            }
            console.log('Employee role updated successfully!');
            startApp();
          });
        });
    });
  });
}

connection.connect(err => {
  if (err) {
    console.error('Error connecting to the database: ' + err.stack);
    return;
  }
  console.log('Connected to the employee_db database.');
  startApp();
});
