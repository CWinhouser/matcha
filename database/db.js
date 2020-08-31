const mysql = require('mysql');
const { request } = require('express');
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'matcha'
});
connection.connect((err) => {
  if (err) throw err;
  console.log('Connected!');
});

function createTables() {
  connection.query(`
  create table if not exists users (
    userID int NOT NULL AUTO_INCREMENT PRIMARY KEY,
    fullname VARCHAR(120) NOT NULL,
    email VARCHAR(120) NOT NULL,
    password VARCHAR(120) NOT NULL,
    active INT
);`)
  
  connection.query(`create table if not exists profile (
    profileID int AUTO_INCREMENT PRIMARY KEY,
    userID INT,
    gender VARCHAR(120),
    bio VARCHAR(255),
    gaming BOOLEAN,
    netflix BOOLEAN,
    music BOOLEAN,
    popularity INT,
    age INT,
    FOREIGN KEY (userID) REFERENCES users(userID)
  );`)

  connection.query(`create table if not exists images (
    imgID int NOT NULL AUTO_INCREMENT PRIMARY KEY,
    filepath VARCHAR(120) NOT NULL,
    userID INT,
    FOREIGN KEY (userID) REFERENCES users(userID)
  );
  `)
};

module.exports = {
  connection,
  createTables: createTables
};