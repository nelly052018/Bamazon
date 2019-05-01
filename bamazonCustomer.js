var mysql = require("mysql");
var inquirer = require("inquirer");
var columnify = require("columnify");

var connection = mysql.createConnection({
    host: "localhost",

    // Your port; if not 3306
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "yourRootPassword",
    database: "bamazon"
});

connection.connect(function (err) {
    if (err) throw err;
    start();
});

function start() {
    //display all items
    connection.query("SELECT * FROM products", function (err, results) {
        if (err) throw err;
        console.log(columnify(results, { columnSplitter: " | " }))
        selectItem();
    })

}


//function to select an item from the array of choices
function selectItem() {
    inquirer
        .prompt([{
            name: "itemId",
            type: "input",
            message: "Which Item ID would you like to buy?",

        },
        {
            name: "itemQuantity",
            type: "input",
            message: "How many units would you like to buy?",

        },
        ])
        .then(function (answer) {
            // based on their answer, either ask for the quantity or relay a not available message
            var itemId = answer.itemId;
            var itemQuantity = answer.itemQuantity;
            connection.query("SELECT * FROM products WHERE ?", { item_id: itemId }, function (err, results) {
                if (err) throw err;
                //console.log(columnify(results, { columnSplitter: " | " }))
                var stockQuantity = results[0].stock_quantity;
                var price = results[0].price;
                var totalPrice = itemQuantity * price
                var remainingStock = stockQuantity - itemQuantity
                //if the user selects a quantity, compare to the stock quantity to determine if there is enough stock
                if (itemQuantity > stockQuantity) {
                    console.log("Insufficient Stock Available")
                    connection.end()
                }
                else {
                    connection.query(
                        "UPDATE products SET ? WHERE ?",
                        [
                            {
                                stock_quantity: remainingStock,

                            },
                            {
                                item_id: itemId
                            }
                        ],
                        function (err, results) {
                            if (err) throw err;
                            console.log("Your total price is: " + totalPrice)
                            connection.end()
                        })
                }

            })

        });
}

