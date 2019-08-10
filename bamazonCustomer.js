//Dependencies
const mysql = require('mysql');
const inquirer = require('inquirer');
const Table = require('cli-table');


//Build connection to database and connect
const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "enter your password here",
    database: "bamazon"
});

connection.connect((err) => {
    if (err) throw err;
    console.log("You are connected to the database! Connection id: " + connection.threadId);
    console.log("Welcome to the Bamazon Marketplace!  Check out our inventory: ")
    //Call getAllItems to Display
    getAllItems();
});


//Function for displaying all products from the database into table
function getAllItems() {
    connection.query("SELECT * FROM products", (err, res) => {
        if (err) throw err;

        //Create & Instantiate table variable for displaying database content into Table format via cli-table
        let table = new Table({
            head: ['ID', 'Product Name', 'Department', 'Price', 'Quantity Remaining'],
            colWidths: [10, 25, 25, 10, 25]
        });
        for(let i = 0; i < res.length; i++){
            table.push(
                [res[i].item_id, res[i].product_name, res[i].department_name, res[i].price, res[i].stock_quantity]
            );
        }
        console.log(table.toString());
        //Call to purchasing prompt to ask user what they want to purchase
        purchasingPrompt(); 
    });
}

//Function for prompt with inquirer to purchase items
function purchasingPrompt(){
    inquirer.prompt([
        {
            //prompt for item to be purchase object
            name: "item_id",
            type: "input",
            message: "Please enter the ID of the item you wish to purchase today: ",
            filter: Number,
            validate: validateData
        },
        {
            //prompt for quantity of item to be purchased object
            name: "stock_quantity",
            type: "input",
            message: "Please enter your purchase quantity for the selected item:",
            filter: Number,
            validate: validateData
        }
    ]).then(function(input){
        let item = input.item_id;
        let quantity = input.stock_quantity;
        purchaseOrder(item, quantity);
    });
    };

//Purchase Function
function purchaseOrder(item, quantity){
    connection.query("SELECT * FROM products WHERE item_id =" + item, (err, res) =>{
        if (err) throw err;
        if(quantity <= res[0].stock_quantity){
            let tCost = quantity * res[0].price;
            console.log("Good news!  We are able to fulfill your order!");
            console.log("The total cost is $" + tCost + " for your order of " + quantity + " " + res[0].product_name + "(s)");
            //Update database with new inventory stock_quantity
            connection.query("UPDATE products SET ? WHERE ?", [ 
                {
                    stock_quantity: res[0].stock_quantity - quantity,
                },
                {
                    item_id: item
                }
            ]);
        } else {
            console.log("Oops! Looks like we don't have enough in stock to fulfill your order for " + res[0].product_name + ". Try placing another order.");
        };
        getAllItems();
    });
};

//Prevent negative integer quantities
function validateData(value){
    let integer = Number.isInteger(parseFloat(value));
    let sign = Math.sign(value);

    if(integer && sign === 1){
        return true;
    }else{
        return "Please enter a number greater than 0."
    }
}
