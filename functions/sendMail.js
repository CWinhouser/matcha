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
		refreshToken: '1//04c0TNNE8KfH-CgYIARAAGAQSNwF-L9IrDpQgFVJV9MWoXaJC4FB-gAazVpfZd4giKCPqt7Kdo8wjEUxd9trER5LCcTqps-aUrqo',
		accessToken: 'ya29.a0AfH6SMBvUtsJ7L-67HkAblHAudGWuID9y-4vm5OsxzB86ftyCqaj4dPH_u6aVJZBb4MHdopFkxv1OFX3XEQNjfrgZsTHx6qpgTGu90X6IPjvzSI30dSY4UJD9wtpo5ApNwbmVUJn_xKwJ1iTOPRpgDOALFaDHF4VBPI'
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