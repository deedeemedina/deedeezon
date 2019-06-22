var mysql = require("mysql");
var inquirer = require("inquirer");

// create the connection information for the sql database
var connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "",
  database: ""
});

// connect to the mysql server and sql database
connection.connect(function(err) {
  if (err) throw err;
  // run the start function after the connection is made to prompt the user
  display();
  setTimeout(function() {
    start();
  }, 500);
});

function display() {
  console.log(
    "================================================================\nHere is a listing of all of our products here at Bamazon\n================================================================"
  );
  connection.query("SELECT * FROM products", function(err, res) {
    if (err) throw err;
    res.forEach(element => {
      console.log(
        `Item ID: ${element.item_id}\nProduct Name: ${
          element.product_name
        }\nDepartment Name: ${element.department_name}\nPrice: $${
          element.price
        }\nQuantity: ${
          element.stock_quantity
        }\n================================================================`
      );
    });
  });
}

function start() {
  inquirer
    .prompt([
      {
        name: "selectID",
        type: "input",
        message: "What is the item ID of the product you would like to buy?"
      },
      {
        name: "quantity",
        type: "input",
        message: "How much of the product do you wish to purchase?"
      }
    ])
    .then(function(answer) {
      // based on their answer, either call the bid or the post functions
      connection.query(
        "SELECT * FROM products WHERE ?",
        {
          item_id: answer.selectID
        },
        function(err, res) {
          if (err) throw err;
          if (res && res.length) {
            console.log("Product Found");
            if (parseInt(res[0].stock_quantity) >= parseInt(answer.quantity)) {
              var newStock = res[0].stock_quantity - answer.quantity;
              updateInventory(newStock, answer.selectID);

              setTimeout(function() {
                console.log(
                  `You have purchased ${answer.quantity} of the product ${
                    res[0].product_name
                  }`
                );

                let totalCost = res[0].price * answer.quantity;
                console.log(`The total cost of the purchase is $${totalCost}`);
              }, 500);
            } else {
              console.log("Sorry, Not enough stock to fulfill your order.");
              connection.end();
            }
          } else {
            console.log("Product Unavailable");
            connection.end();
          }
        }
      );
    });
}

function updateInventory(stock, id) {
  console.log("Updating deedeezon Inventory");
  connection.query(
    "UPDATE products SET ? WHERE ?",
    [
      {
        stock_quantity: stock
      },
      {
        item_id: id
      }
    ],
    function(err, res) {
      if (err) throw err;
      console.log(res.affectedRows + " product updated");
      display();
      connection.end();
    }
  );
}
