var nodemailer = require('nodemailer'),
   	smtpTransport = require('nodemailer-smtp-transport');

module.exports = function(credentials){
	var mailTransport = nodemailer.createTransport(smtpTransport({
		host: 'smtp.qq.com',
		secureConnection: true, 
		port:465,
		auth: {
			user: credentials.gmail.user,
			pass: credentials.gmail.password,
		}
	}));
	var from = '"Meadowlark Travel" <395340017@qq.com>';
	var errorRecipient = '395340017@qq.com';

	return {
		send: function(to, subj, body){
			mailTransport.sendMail({
				from: from,
				to: to,
				subject: subj,
				html: body,
				generateTextFromHtml: true
			}, function(err){
				if(err){
					console.error('Unable to send email: ' + err);
				}
			});
		},
		emailError: function(message, filename, exception){
			var body = '<h1>Meadowlark Travel Site Error</h1>' +'message:<br><pre>' + message + '</pre><br>';
			if(exception){
				body += 'exception:<br><pre>' + exception+ '</pre><br>';
			}
			if(filename){
				body += 'filename:<br><pre>' + filename+ '</pre><br>';
			}
			mailTransport.sendMail({
				from: from,
				to: errorRecipient,
				subject: 'Meadowlark Travel Site Error',
				html: body,
				generateTextFromHtml: true
			}, function(err){
				if(err){
					console.error('Unable to send email: ' + err);
				}
			});
		}
	}
}

