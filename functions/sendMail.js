const mailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const db = require("../database/db");

// console.log(process.env)

let transporter = mailer.createTransport({
	service: "gmail",
	host: "smtp.gmail.com",
	port: 465,
	auth: {
		type: 'OAuth2',
		user: 'matchwtc@gmail.com',
		clientId: '311779668400-4us7aps25ngnd5sdghdqu6plejs1mf0l.apps.googleusercontent.com',
		clientSecret: 'Da9DOV1PBJjLTrPGXucAN52M',
		refreshToken: '1//04WkYpV-YEEEKCgYIARAAGAQSNwF-L9IrJ2j8GfLPF9pChQtiNyg6ukV_GG3ozgBr8gUiikr0BaOqAYctgbHnkF--_s1ekJCho2k',
		accessToken: 'ya29.a0AfH6SMAg5cs9dUuklcdRWiLndh5Qq_8LsIm3Builamrt3fO4dyRulsqhy-0KOMqqM_cVzO0YrElh1hnm9Ek2Gw-0QfnKq_43wNbXs804xig37znq4huK2Og-l8ih5PMd6_fP4z1fIAqrOLO6hTHy1pHnAjJQQ9fkD9U'
	}
});

function sendVerifyEmail(email, verifykey) {
	let mailOptions = {
		from: "'Matcha' <kyletwomey99@gmail.com>",
		to: email + ", <" + email + ">",
		subject: "Matcha Welcomes you",
		text: "Matcha Verify",
		html:
			"<h1> Good day User </h1> <br><hr> <p>Verify Account please</p>" +
			verifykey
	};
	transporter
		.sendMail(mailOptions)
		.then(info => { })
		.catch(error => {
			console.log("Error sending mail: " + error);
		});
}

function sendPassForgetEmail(email, url) {
	let mailOptions = {
		from: "'Matcha' <jwolfmatcha@gmail.com>",
		to: email + ", <" + email + ">",
		subject: "Matcha Forgot Password",
		text: "Matcha Forgot password",
		html:
			"<h1> Good day User </h1> <br><hr> <p>Click here to reset your password</p>" +
			url
	};
	transporter
		.sendMail(mailOptions)
		.then(info => {})
		.catch(error => {
			console.log("Error sending mail: " + error);
		});
}

function sendPassForget(email) {
	let user = db.connection.query("SELECT * from Users WHERE email = ?", email, (err, rows) => {
		if (rows && rows.length) {
			sendPassForgetEmail(email, "127.0.0.1:3000/resetPassword/" + email);
			return true;
		}
		else {
			return false;
		}
	});
}

module.exports = {
	sendVerifyEmail: sendVerifyEmail,
	sendPassForget: sendPassForget
};