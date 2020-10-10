const db = require('../database/db');

function geolocation(session) {
	var unirest = require("unirest");

	var req = unirest("GET", "http://api.ipstack.com/196.50.192.239?access_key=");

	req.query({
		"language": "en",
	});

	req.end(function (res) {
		if (res.error) throw new Error(res.error);

		const promise = db.connection.query("select locationID from location where userID = ?", [session.session.userID], (err, rows) => {
			rows.forEach(row => {
				db.connection.query('INSERT INTO `location`(`locationID` ,`city`, `userID`) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE `city`= ?', [`${row.locationID}`, res.body.city, session.session.userID, res.body.city]);
			})
		});
		console.log(res.body);
	});
}

module.exports = {
	geolocation: geolocation
}