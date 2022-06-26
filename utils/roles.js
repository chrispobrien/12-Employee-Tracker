const inquirer = require('inquirer');
const pool = require('../db/connection');

// Return all roles
const viewAllRoles = async () => {
    const sql = `   SELECT r.id, r.title, IFNULL(d.name,'') AS department, r.salary FROM roles r
                    LEFT JOIN departments d ON r.department_id = d.id`;

    const conn = await pool.getConnection();
    const [rows, fields] = await conn.execute(sql);
    conn.release();

    return rows;
};

// Add new role to database
const addRole = async (answers) => {
    const sql = 'INSERT INTO roles (title, salary, department_id) VALUES(?,?,?)';
    const params = [answers.title, answers.salary, answers.department_id];
    const conn = await pool.getConnection();
    const returnVal = await conn.execute(sql,params);
    conn.release();

    return returnVal;
};

// Prompt for new role
const promptAddRole = async () => {
    // Populate departments as list choices, [id, value]
    const conn = await pool.getConnection();
    const [ departments, departmentFields ] = await conn.query(`SELECT name, id AS value FROM departments`);
    conn.release();

    return new Promise((resolve, reject) => {
        inquirer.prompt([{
                    type: 'input',
                    message: "What is the role's title? (required)",
                    name: 'title',
                    validate: titleInput => {
                        if (titleInput) {
                            return true;
                        } else {
                            console.log("Please enter the role's title!");
                            return false;
                        }
                    }
                },
                {
                    type: 'input',
                    message: "What is the salary of the role? (required)",
                    name: 'salary',
                    validate: salaryInput => {
                        if (salaryInput) {
                            return true;
                        } else {
                            console.log("Please enter the role's salary!");
                            return false;
                        }
                    }
                },
                {
                    type: 'rawlist',
                    message: "What department does the role belong to?",
                    name: 'department_id',
                    choices: departments
                }])
                .then(answers => {
                    resolve(answers);
                })
    
    })
};

// Delete existing role
const deleteRole = async (answers) => {
    const sql = 'DELETE FROM roles WHERE id = ?';
    const params = [answers.id];
    const conn = await pool.getConnection();
    const returnVal = await conn.execute(sql,params);
    conn.release();

    return returnVal;
};

// Prompt for id of role to delete, using role title as choice
const promptDeleteRole = async () => {
    // Loading roles to populate list choices [name, value] where name is displayed, value is stored
    const conn = await pool.getConnection();
    const [ roleChoices, employeeFields ] = await conn.query(`SELECT title AS name, id AS value FROM roles`);
    conn.release();

    return new Promise((resolve, reject) => {
        
        inquirer.prompt([
                {
                    type: 'rawlist',
                    message: "Select a role to delete?",
                    name: 'id',
                    choices: roleChoices
                }])
                .then(answers => {
                    resolve(answers);
                });
            });
}

module.exports = { viewAllRoles, addRole, promptAddRole, promptDeleteRole, deleteRole };