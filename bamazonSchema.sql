-- If database exists, drop it first --
DROP DATABASE IF EXISTS bamazon;

-- Create bamazon database --
CREATE DATABASE bamazon;

--Use database for remaining queries --
USE bamazon;

-- Create products table with columns needed --
CREATE TABLE products(

    item_id INT NOT NULL AUTO_INCREMENT,
    product_name VARCHAR(200) NOT NULL,
    department_name VARCHAR(150) NOT NULL,
    price INT default 0,
    stock_quantity INT default 0,
    PRIMARY KEY(item_id)
);

-- Add Items to populate table rows --
INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("Pet Sofa Lounger Bed", "Pets", 54.99, 500), 
("Furbo Dog Camera", "Pets", 198.95, 200), 
("Nintendo Switch Console w Mario Kart 8", "Video Games", 409.00, 150), 
("Playstation 4 Pro 1TB", "Video Games", 367.88, 150), 
("Amazon Echo Spot Black", "Smart Devices", 179.99, 75), 
("6 Pack Fitness Innovator Lunch Box", "Fitness", 45.99, 50), 
("Bowflex Adjustable Dumbbells", "Fitness", 298.99, 50), 
("Oakley Mens Tincan Cap Black", "Clothing", 17.99, 40), 
("Muscle Tank Tops Mens 3 pack", "Clothing", 24.99, 25), 
("Kitchen Aid Standup Mixer Steel Gray", "Kitchen Gadgets", 249.95, 25);




