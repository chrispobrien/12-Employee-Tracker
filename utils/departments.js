const inquirer = require('inquirer');
const pool = require('../db/connection');

// Returns all departments
const viewAllDepartments = async() => {
    const sql = `SELECT * FROM departments`;

    // Using await for database operations
    const conn = await pool.getConnection();
    const [rows, fields] = await conn.execute(sql);
    conn.release();

    // Return all rows
    return rows;
};

const viewBudget = async() => {
    const sql = `   SELECT IFNULL(d.name,'') AS department, SUM(r.salary) AS Total_Salary FROM employees e
                    LEFT JOIN roles r ON e.role_id = r.id
                    LEFT JOIN departments d ON r.department_id = d.id
                    GROUP BY IFNULL(d.name,'')`
    const conn = await pool.getConnection();
    const [rows, fields] = await conn.execute(sql);
    conn.release();
                
    // Return all rows
    return rows;
                
};

// Insert new department and return value from sql execute
const addDepartment = async (answers) => {
    const sql = 'INSERT INTO departments (name) VALUES(?)';
    const params = [answers.name];
    const conn = await pool.getConnection();
    const returnVal = await conn.execute(sql,params);
    conn.release();

    return returnVal;
};

// Prompts for a new department
const promptAddDepartment = async () => {
    return new Promise((resolve, reject) => {
        inquirer.prompt([{
                    type: 'input',
                    message: "What is the department's name? (required)",
                    name: 'name',
                    validate: nameInput => {
                        if (nameInput) {
                            return true;
                        } else {
                            console.log("Please enter the department's name!");
                            return false;
                        }
                    }
                }])
                .then(answers => {
                    resolve(answers);
                })
    
    })
};

// Delete existing department
const deleteDepartment = async (answers) => {
    const sql = 'DELETE FROM departments WHERE id = ?';
    const params = [answers.id];
    const conn = await pool.getConnection();
    const returnVal = await conn.execute(sql,params);
    conn.release();

    return returnVal;
};

const promptDeleteDepartment = async () => {
    // Loading roles to populate list choices [name, value] where name is displayed, value is stored
    const conn = await pool.getConnection();
    const [ departmentChoices, employeeFields ] = await conn.query(`SELECT name, id AS value FROM departments`);
    conn.release();

    return new Promise((resolve, reject) => {
        
        inquirer.prompt([
                {
                    type: 'list',
                    message: "Select a department to delete?",
                    name: 'id',
                    choices: departmentChoices
                }])
                .then(answers => {
                    resolve(answers);
                });
            });
}

module.exports = { viewAllDepartments, addDepartment, promptAddDepartment, promptDeleteDepartment, deleteDepartment, viewBudget }
