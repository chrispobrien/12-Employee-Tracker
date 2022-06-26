// Modules
const inquirer = require('inquirer');
const pool = require('../db/connection');

// Return all employees, joining roles, departments, and employees again for the manager name
const viewAllEmployees = async () => {
    const sql = `   SELECT e.id, e.first_name, e.last_name, r.title, d.name AS department, r.salary,
                        IF(IFNULL(e.manager_id,'')='','',CONCAT(m.first_name,' ',m.last_name)) AS manager FROM employees e
                    LEFT JOIN roles r ON e.role_id=r.id
                    LEFT JOIN departments d ON r.department_id = d.id
                    LEFT JOIN employees m ON e.manager_id = m.id`;

    const conn = await pool.getConnection();
    const [rows, fields] = await conn.execute(sql);
    conn.release();

    return rows;
};

// Return all employees sorted by manager last name, first name
const viewAllEmployeesByManager = async () => {
    const sql = `   SELECT IF(IFNULL(e.manager_id,'')='','',CONCAT(m.first_name,' ',m.last_name)) AS manager,
                        e.id, e.first_name, e.last_name, IFNULL(r.title,'') AS title, IFNULL(d.name,'') AS department, IFNULL(r.salary,0)
                    FROM employees e
                    LEFT JOIN roles r ON e.role_id=r.id
                    LEFT JOIN departments d ON r.department_id = d.id
                    LEFT JOIN employees m ON e.manager_id = m.id
                    ORDER BY IF(IFNULL(e.manager_id,'')='','',m.last_name), IF(IFNULL(e.manager_id,'')='','',m.first_name)`;

    const conn = await pool.getConnection();
    const [rows, fields] = await conn.execute(sql);
    conn.release();

    return rows;
};

// Return all employees sorted by department name
const viewAllEmployeesByDepartment = async () => {
    const sql = `   SELECT d.name AS department, e.id, e.first_name, e.last_name, r.title, r.salary,
                        IF(IFNULL(e.manager_id,'')='','',CONCAT(m.first_name,' ',m.last_name)) AS manager FROM employees e
                    LEFT JOIN roles r ON e.role_id=r.id
                    LEFT JOIN departments d ON r.department_id = d.id
                    LEFT JOIN employees m ON e.manager_id = m.id
                    ORDER BY d.name, e.last_name, e.first_name`;

    const conn = await pool.getConnection();
    const [rows, fields] = await conn.execute(sql);
    conn.release();

    return rows;
};


// Add new employee
const addEmployee = async (answers) => {
    const sql = 'INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES(?,?,?,?)';
    const params = [answers.first_name, answers.last_name, answers.role_id, answers.manager_id];
    const conn = await pool.getConnection();
    const returnVal = await conn.execute(sql,params);
    conn.release();

    return returnVal;
};

// Prompt to solicit employee data for later add new employee
const promptAddEmployee = async () => {

    // Loading roles and managers to populate list choices [name, value] where name is displayed, value is stored
    const conn = await pool.getConnection();
    const [ roles, roleFields ] = await conn.query(`SELECT '(none)' AS name, null AS value UNION SELECT title AS name, id AS value FROM roles`);
    const [ managers, managerFields ] = await conn.query(`SELECT '(none)' AS name, null AS value UNION SELECT CONCAT(first_name,' ',last_name) AS name, id AS value FROM employees`);
    conn.release();

    return new Promise((resolve, reject) => {
        //console.log(roles);
        
        inquirer.prompt([{
                    type: 'input',
                    message: "What is the employee's first name? (required)",
                    name: 'first_name',
                    validate: firstNameInput => {
                        if (firstNameInput) {
                            return true;
                        } else {
                            console.log('Please enter the first name of the employee!');
                            return false;
                        }
                    }
                },
                {
                    type: 'input',
                    message: "What is the employee's last name? (required)",
                    name: 'last_name',
                    validate: lastNameInput => {
                        if (lastNameInput) {
                            return true;
                        } else {
                            console.log('Please enter the last name of the employee!');
                            return false;
                        }
                    }
                },
                {
                    type: 'list',
                    message: "What is the employee's role?",
                    name: 'role_id',
                    choices: roles
                },
                {
                    type: 'list',
                    message: "Who is the employee's manager?",
                    name: 'manager_id',
                    choices: managers
                }])
                .then(answers => {
                    resolve(answers);
                })
    
    })
};

// Update existing employee role_id and manager_id
const updateEmployee = async (answers) => {
    const sql = 'UPDATE employees SET role_id = ?, manager_id = ? WHERE id = ?';
    const params = [answers.role_id, answers.manager_id, answers.id];
    const conn = await pool.getConnection();
    const returnVal = await conn.execute(sql,params);
    conn.release();

    return returnVal;
};


// prompt to update employee role and manager
const promptUpdateEmployee = async () => {

    // Loading roles and employees to populate list choices [name, value] where name is displayed, value is stored
    const conn = await pool.getConnection();
    // First element is null, so user can choose no role UNION combines results from two or more SELECT statements
    const [ roleChoices, roleFields ] = await conn.query(`SELECT '(none)' AS name, null AS value UNION SELECT title AS name, id AS value FROM roles`);
    // First element is null, so user can choose no manager UNION combines results from two or more SELECT statements
    const [ managerChoices, employeeFields ] = await conn.query(`SELECT '(none)' AS name, null AS value UNION SELECT CONCAT(first_name,' ',last_name) AS name, id AS value FROM employees`);
    // Employees but no null choice
    const [ employeeChoices, employeeChoicesFields ] = await conn.query(`SELECT CONCAT(first_name,' ',last_name) AS name, id AS value FROM employees`);
    const [ employees, otherFields ] = await conn.query(`SELECT id, role_id, manager_id FROM employees`);
    conn.release();

    
    return new Promise((resolve, reject) => {
        //console.log(roles);
        
        inquirer.prompt([
                {
                    type: 'list',
                    message: "Select an employee to update?",
                    name: 'id',
                    choices: employeeChoices
                },
                {
                    type: 'list',
                    message: "Select a new role?",
                    name: 'role_id',
                    choices: roleChoices,
                    // Sets default to existing value, so user can press Enter if no change
                    default: (answers) => roleChoices.findIndex(r => r.value == employees[employees.findIndex(e => e.id == answers.id)].role_id)
                },
                {
                    type: 'list',
                    message: "Select a new manager?",
                    name: 'manager_id',
                    choices: managerChoices,
                    // Sets default to existing value, so user can press Enter if no change
                    default: (answers) => managerChoices.findIndex(e => e.value == employees[employees.findIndex(e => e.id == answers.id)].manager_id)
                }
            ])
            .then(answers => {
                resolve(answers);
            });
    });
};

// Delete existing employee
const deleteEmployee = async (answers) => {
    const sql = 'DELETE FROM employees WHERE id = ?';
    const params = [answers.id];
    const conn = await pool.getConnection();
    const returnVal = await conn.execute(sql,params);
    conn.release();

    return returnVal;
};

// Prompt for id of employee to delete, but show name
const promptDeleteEmployee = async () => {
    // Loading roles and employees to populate list choices [name, value] where name is displayed, value is stored
    const conn = await pool.getConnection();
    const [ employeeChoices, employeeFields ] = await conn.query(`SELECT CONCAT(first_name,' ',last_name) AS name, id AS value FROM employees`);
    conn.release();

    return new Promise((resolve, reject) => {
        
        inquirer.prompt([
                {
                    type: 'rawlist',
                    message: "Select an employee to delete?",
                    name: 'id',
                    choices: employeeChoices
                }])
                .then(answers => {
                    resolve(answers);
                });
            });
}

module.exports = {
    viewAllEmployees,
    addEmployee,
    promptAddEmployee,
    updateEmployee,
    promptUpdateEmployee,
    viewAllEmployeesByManager,
    viewAllEmployeesByDepartment,
    promptDeleteEmployee,
    deleteEmployee
};