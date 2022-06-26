// Using mysql2/promise, so using a pool instead of the db, so we can await
const pool = require('../db/connection');
// Console prompt module
const inquirer = require('inquirer');
// A different way of logging tables to console (console.table)
const ct = require('console.table');

// Add functions specific to tables
const {
    viewAllDepartments,
    addDepartment,
    promptAddDepartment,
    promptDeleteDepartment,
    deleteDepartment,
    viewBudget } = require('./departments');

const {
    viewAllEmployees,
    addEmployee,
    promptAddEmployee,
    updateEmployee,
    promptUpdateEmployee,
    viewAllEmployeesByManager,
    viewAllEmployeesByDepartment,
    promptDeleteEmployee,
    deleteEmployee
} = require('./employees');

const {
    viewAllRoles,
    addRole,
    promptAddRole,
    promptDeleteRole,
    deleteRole
} = require('./roles');

// Main menu
const promptMenu = async () => {
    return new Promise((resolve, reject) => {

    inquirer.prompt([
        {
        type: 'rawlist',
        message: 'What would you like to do?',
        name: 'menu_action',
        choices: [
            'View',
            'Add',
            'Update',
            'Delete',
            new inquirer.Separator(),
            'Quit'
            ]
    },
    {
        type: 'rawlist',
        message: 'What would you like to view?',
        name: 'action',
        choices: [
            'View All Employees',
            'View All Employees By Manager',
            'View All Employees By Department',
            'View All Roles',
            'View All Departments',
            'View Budget By Department'
        ],
        when: (answers) => answers.menu_action === 'View'
    },
    {
        type: 'rawlist',
        message: 'What would you like to add?',
        name: 'action',
        choices: [
            'Add Employee',
            'Add Role',
            'Add Department'
        ],
        when: (answers) => answers.menu_action === 'Add'
    },
    {
        type: 'rawlist',
        message: 'What would you like to update?',
        name: 'action',
        choices: [
            'Update Employee'
        ],
        when: (answers) => answers.menu_action === 'Update'
    },
    {
        type: 'rawlist',
        message: 'What would you like to delete?',
        name: 'action',
        choices: [
            'Delete Employee',
            'Delete Role',
            'Delete Department'
        ],
        when: (answers) => answers.menu_action === 'Delete'
    },


])
    .then(answers => {
        resolve(answers);
    });;
});
};

// Main program loop
//  menuSelection.menu_action is the top menu level, action is the second level
const promptUser = async () => {
    const menuSelection = await promptMenu();
    if (menuSelection.action === 'View All Employees') {
        const employees = await viewAllEmployees();
        console.table(employees);
        promptUser();
    };

    if (menuSelection.action === 'View All Employees By Manager') {
        const employees = await viewAllEmployeesByManager();
        console.table(employees);
        promptUser();
    };

    if (menuSelection.action === 'View All Employees By Department') {
        const employees = await viewAllEmployeesByDepartment();
        console.table(employees);
        promptUser();
    };

    if (menuSelection.action === 'View All Roles') {
        const roles = await viewAllRoles();
        console.table(roles);
        promptUser();
    };

    if (menuSelection.action === 'View All Departments') {
        const departments = await viewAllDepartments();
        console.table(departments);
        promptUser();
    };

    if (menuSelection.action === 'View Budget By Department') {
        const budget = await viewBudget();
        console.table(budget);
        promptUser();
    };

    if (menuSelection.action === 'Add Employee') {
        answers = await promptAddEmployee();
        await addEmployee(answers);
        promptUser();
    };

    if (menuSelection.action === 'Update Employee') {
        answers = await promptUpdateEmployee();
        await updateEmployee(answers);
        promptUser();
    }

    if (menuSelection.action === 'Add Role') {
        answers = await promptAddRole();
        await addRole(answers);
        promptUser();
    }

    if (menuSelection.action === 'Add Department') {
        answers = await promptAddDepartment();
        await addDepartment(answers);
        promptUser();
    }

    if (menuSelection.action === 'Delete Employee') {
        answers = await promptDeleteEmployee();
        await deleteEmployee(answers);
        promptUser();
    }

    if (menuSelection.action === 'Delete Role') {
        answers = await promptDeleteRole();
        await deleteRole(answers);
        promptUser();
    }

    if (menuSelection.action === 'Delete Department') {
        answers = await promptDeleteDepartment();
        await deleteDepartment(answers);
        promptUser();
    }

    // Quit on the main menu
    if (menuSelection.menu_action === 'Quit') {
        process.kill(process.pid, 'SIGTERM');
    };

}

module.exports = promptUser;