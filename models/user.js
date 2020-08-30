const db = require('../database/db'); 

db.connection.query('SELECT * from Users', (err,rows) => {
    if(err) throw err;

    console.log(rows);
});