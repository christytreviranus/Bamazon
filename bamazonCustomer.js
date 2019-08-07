//Dependencies
const mysql = require("mysql");
const inquirer = require("inquirer");

// Create the connection information for the sql database
const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "",
    database: "bamazon"
  });

//Connect to the database
connection.connect(function(err){
    if (err) throw err;
    console.log("Server connected as id: " + connection.threadId);
    queryAllItems();
});

//Function for querying database for items
function queryAllItems(){
    connection.query("SELECT * FROM products", function(err, res){
        for (let i = 0; i < res.length; i++){
            console.log(res[i].item_id + " | " + res[i].product_name + " | " + res[i].department_name + " | " + res[i].price);
        }
        console.log("-----------------------------------");
        purchasePrompt();
    });
}

//Function for customers to purchase items
function purchasePrompt(){
    inquirer.prompt([
        {
        type: 'input',
        name: 'item_id',
        message: 'Please enter the item_id that you would like to purchase: ',
        filter: Number,
        validate: validateData
        },
        {
        type: 'input',
        name: 'stock_quantity',
        message: 'Please enter the quantity you would like to purchase: ',
        filter: Number,
        validate: validateData   
        }
    ])
}

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




  