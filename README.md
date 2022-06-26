# 12-Employee-Tracker [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Description

Week 12 of Columbia Engineering Coding Bootcamp challenges us to create an employee tracker, using three node packages:

* Inquirer
* Mysql2
* Console.table

We use MySQL to store database for the employee tracker.  The database consists of three tables:

* departments
* roles
* employees

I took the liberty to pluralize the table names since they will contain more than one record. Each table contains an id as integer, primary key and auto_increment, making sure it is unique. Roles contains a reference to the department id and a foreign key constraint is declared to make sure the department id exists or is null. Employees contains a role id and likewise, a foreign key constraint, and a manager id with another foreign key back to the employees table (a manager must also be an employee, or null).

All foreign keys will change to null if the record they reference is deleted. In other words, if a role is deleted, the employee's role_id will be null and they will have no role.

In order to clean things up on the menu, I have a main menu and sub-menus for View, Add, Update, Delete, Quit.

Finally, I chose to use the async/await approach to syncronize menu prompts and outputs.

## Installation

```sh
git clone https://github.com/chrispobrien/12-Employee-Tracker.git
```

This creates the folder 12-Employee-Tracker within which you will find the project files. Issue these commands to download node dependencies:

```sh
cd 12-Employee-Tracker
npm i
```

Initialize the MySQL database:

```sh
mysql -u root -p
source db/db.sql
source db/schema.sql
source db/seeds.sql
exit
```

Change connection.js to use your user id and password for your MySQL.

## Usage

[![Employee Tracker][screenshot]](./assets/images/screenshot.png)

```sh
node index.js
```

Follow the menu prompts to view, add, update or delete table information, and select quit to end.

## Credits

This solution is my own for Week 12 of Coding Bootcamp.

## License

MIT License [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

<!-- MARKDOWN LINKS & IMAGES -->
[screenshot]: ./assets/images/screenshot.png