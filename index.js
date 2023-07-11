const inquirer = require('inquirer');
const consoleTable = require('console.table');
const connection = require('./app.js');

function startApp() {
    inquirer
      .prompt({
        name: 'menuChoice',
        type: 'list',
        message: 'Please select an option:',
        choices: ['View all departments', 'View all roles', 'View all employees', 'Exit'],
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
    connection.query('SELECT * FROM employee', (err, employees) => {
      if (err) {
        console.error('Error retrieving employees: ' + err.stack);
        return;
      }
      console.table('Employees', employees);
      startApp();
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