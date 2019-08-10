// Dependencies and Database Connection
const mysql = require('mysql');
const inquirer = require('inquirer');
const chalk = require('chalk');
const Table = require('cli-table');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    port: 3306,
    password: 'enter your password',
    database: 'bamazon'
});

connection.connect((err) => {
    if (err) throw err;
    console.log("You are connected to the database! Connection id: " + connection.threadId);
    console.log("Welcome to the Bamazon Marketplace Admin!  What would you like to do? ");
    resetData();
    displayMenu();
});

// Set global variables
let itemToUpdate = {};
let itemToDelete = {};

// Functions to complete operations
const resetData = function() {
    itemToUpdate = {};
    itemToDelete = {};
}

const displayMenu = function() {
    inquirer.prompt({
        name: 'action',
        type: 'rawlist',
        message: '\n\nChoose an action:',
        choices: [
            'View Products for Sale',
            'View Low Inventory',
            'Add to Inventory',
            'Add New Product',
            'Remove A Product',
            'Quit'
        ]
    }).then((answer) => {
        switch (answer.action) {
            case 'View Products for Sale':
                viewActiveProducts();
            break;
            case 'View Low Inventory':
                viewLowInventory();
            break;
            case 'Add to Inventory':
                addToInventory();
            break;
            case 'Add New Product':
                addNewProduct();
            break;
            case 'Remove A Product':
                deleteProduct();
            break;
            case 'Quit':
                connection.end();
            break;
        }
    });
};

const viewActiveProducts = function() {
    connection.query(`SELECT * FROM products`, (err, res) => {
        const listTable = new Table({
            head: ['ID', 'Product Name', 'Department', 'Price', 'Quantity Remaining'],
            colWidths: [10, 25, 25, 10, 25]
        });

        for (let i = 0; i < res.length; i++) {
            listTable.push([res[i].item_id, res[i].product_name, res[i].department_name, res[i].price, res[i].stock_quantity]);
        }

        console.log(`\n\n${listTable.toString()}\n\n`);
        displayMenu();
    });
};

const viewLowInventory = function() {
    connection.query(`SELECT * FROM products WHERE stock_quantity < 5 ORDER BY stock_quantity DESC`, (err, res) => {
        if (res.length > 0) {
            let listTable = new Table({
                head: ['Item ID', 'Product Name', 'In Stock', 'Price'],
                colWidths: [10, 45, 10, 12]
            });

            for (let i = 0; i < res.length; i++) {
                listTable.push([res[i].item_id, res[i].product_name, res[i].stock_quantity, `$${res[i].price}`]);
                // console.log(chalk.blue.bold(`\n\tItem ID: ${res[i].item_id}\n\tProduct Name: ${res[i].product_name}\n\tPrice: $${res[i].price}\n`));
            }

            console.log(`\n\n${listTable.toString()}\n\n`);

        } else {
            console.log(chalk.blue.bold('\n\tThere are no low-stock items currently!\n'));
        }
        displayMenu();
    });
};

const addToInventory = function() {
    askForID();
};

const addNewProduct = function() {
    inquirer.prompt([
        {
            name: 'name',
            type: 'input',
            message: 'Enter the product name:'
        },
        {
            name: 'department',
            type: 'input',
            message: 'Enter the product department:'
        },
        {
            name: 'price',
            type: 'input',
            message: 'Enter the product price:',
            validate: (value) => {
                if (!isNaN(value) && value > 0) {
                    return true;
                } else {
                    console.log(chalk.red(` => Oops, please enter a number greater than 0`));
                    return false;
                }
            }
        }, 
        {
            name: 'stockNum',
            type: 'input',
            message: 'Enter the number of items in stock:',
            validate: (value) => {
                if (!isNaN(value) && value > 0) {
                    return true;
                } else {
                    console.log(chalk.red(` => Oops, please enter a number greater than 0`));
                    return false;
                }
            }
        }
    ]).then((answers) => {
        connection.query('INSERT INTO products SET ?', {
            product_name: answers.name,
            department_name: answers.department,
            price: answers.price,
            stock_quantity: answers.stockNum
        }, (err, res) => {
            if (err) throw err;
            console.log(chalk.blue.bold('\n\tItem successfully added!'));
            viewActiveProducts();
        });
    });
};

const deleteProduct = function() {
    inquirer.prompt({
        name: 'itemID',
        type: 'input',
        message: 'Enter the ID of the product you\'d like to remove:'
    }).then((answer) => {
        connection.query('SELECT * FROM products WHERE ?', { item_id: answer.itemID }, (err, res) => {
            inquirer.prompt({
                name: 'confirm',
                type: 'confirm',
                message: `You would like to delete` + chalk.blue.bold(` '${res[0].product_name}'. `) + `Is this correct?`
            }).then((answer) => {
                if (answer.confirm) {
                    itemToDelete = {
                        item_id: res[0].item_id
                    };
                    connection.query('DELETE FROM products WHERE ?', { item_id: itemToDelete.item_id }, (err, res) => {
                        if (err) throw err;
                        console.log(chalk.blue.bold('\n\tItem successfully removed!'));
                        viewActiveProducts();
                    });
                } else {
                    displayMenu();
                }
            });
        });
    });
};

var askForID = function() {
    inquirer.prompt({
        name: 'itemID',
        type: 'input',
        message: 'Enter the ID of the item you\'d like to update:',
        // validate input is number from 1-10
        validate: (value) => {
            if (!isNaN(value) && (value > 0 && value <= 10)) {
                return true;
            } else {
                console.log(chalk.red(' => Please enter a number from 1-10'));
                return false;
            }
        }
        // select all rows where ID = user's input
    }).then((answer) => {
        connection.query('SELECT * FROM products WHERE ?', { item_id: answer.itemID }, (err, res) => {
            confirmItem(res[0].product_name, res);
        });
    });
};

var confirmItem = function(product, object) {
    inquirer.prompt({
        name: 'confirmItem',
        type: 'confirm',
        message: `You chose` + chalk.blue.bold(` '${product}'. `) + `Is this correct?`
    }).then((answer) => {
        if (answer.confirmItem) {
            itemToUpdate = {
                item_id: object[0].item_id,
                product_name: object[0].product_name,
                department_name: object[0].department_name,
                price: object[0].price,
                stock_quantity: object[0].stock_quantity,
                product_sales: object[0].product_sales
            };
            askHowMany();
        } else {
            askForID();
        }
    });
};

var askHowMany = function() {
    inquirer.prompt({
        name: 'howMany',
        type: 'input',
        message: 'Enter the quantity you would like to add:',
        validate: (value) => {
            if (!isNaN(value) && value > 0) {
                return true;
            } else {
                console.log(chalk.red(' => Oops, please enter a number greater than 0'));
                return false;
            }
        }
    }).then((answer) => {
        itemToUpdate.howMany = answer.howMany;
        connection.query('UPDATE products SET ? WHERE ?', [
            {
                stock_quantity: Number(itemToUpdate.stock_quantity) + Number(answer.howMany)
            },
            {
                item_id: itemToUpdate.item_id
            }
        ], (err, res) => {
            console.log(chalk.blue.bold(`\n\tInventory updated! '${itemToUpdate.product_name}' now has ${Number(itemToUpdate.stock_quantity) + Number(itemToUpdate.howMany)} items in stock\n`));
            displayMenu();
        });
    });
}