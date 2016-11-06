//这是我们的入口文件,倾向于按照项目命名主文件

var express = require('express'),
    exphbs  = require('express-handlebars'),
    person = require('./lib/person.js'),
   	getWeather = require('./lib/weather.js'),
   	bodyparser = require('body-parser'),
   	formidable = require('formidable'),
   	cookieParser = require('cookie-parser'),
   	session = require('express-session'),
   	credentials = require('./credentials.js'),
   	emailService = require('./lib/email.js')(credentials);
   	


var app = express();

var hbs = exphbs.create({
	defaultLayout: 'main',
	helpers: {
		section:function(name, options){
			if(!this._sections){
				this._sections = {};
			}
			this._sections[name] = options.fn(this);
			return null;
		}
	}
});
//设置端口变量
app.set('port',process.env.PORT || 3000);

//设置模板引擎
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

//设置静态文件,static 中间件相当于给你想要发送的所有静态文件创建了一个路由
app.use(express.static(__dirname + '/public'));
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
	resave: false,
	secret: 'keyboard cat',
  	saveUninitialized: true
}));

//我们添加一个单元测试
app.use(function(req,res,next){
	res.locals.showTests = app.get('env')!=='production' && req.query.test === '1';
	next();
});

//即闪falsh消息
app.use(function(req, res, next){
	// 如果有即显消息，把它传到上下文中，然后清除它
	res.locals.flash = req.session.flash;
	//res.locals.flash = true;//我不想通过重定向来即显消息，就直接赋值
	delete req.session.flash;
	next();
});


//添加中间件用来渲染局部视图
app.use(function(req, res, next){
	if(!res.locals.partials){
		res.locals.partials = {};
	}
	
	res.locals.partials.weather = getWeather.weather();
	//console.log(res.locals.partials.weather.locations)
	next();
});

app.get('/',function(req,res){
	//console.log(res.locals.partials.weather.locations)
	res.render('home');
});

app.get('/headers',function(req,res){
	res.type('text/plain');
	var s = '';
	for(var name in req.headers){
		s+=name+':'+req.headers[name]+'\n'
	}
	res.send(s)
});

app.get('/about',function(req,res){
	//修改，让这个页面使用tests-about.js单元测试
	res.render('about',{person:person.person(),
		pageTestScript:'/qa/tests-about.js'})
})

app.get('/jquerytest',function(req,res){
	//console.log(res.locals.partials.weather.locations)
	res.render('jquerytest');
});

app.get('/nursery-rhyme', function(req, res){
	res.render('nursery-rhyme');
});

//ajax的请求
app.get('/data/nursery-rhyme', function(req, res){
	res.json({
		animal: 'squirrel',
		bodyPart: 'tail',
		adjective: 'bushy',
		noun: 'heck',
	});
});

app.get('/newsletter', function(req, res){
	res.render('newsletter',{ csrf: 'CSRF token goes here' });
});

app.post('/newsletter', function(req, res){
	var name = req.body.name || '', email = req.body.email || '';
	// 输入验证
	var VALID_EMAIL_REGEX = /\w+@\w+\.(cn|com)/;
	if(!email.match(VALID_EMAIL_REGEX)) {
		if(req.xhr){
			return res.json({ error: 'Invalid name email address.' });
		} 

		//如果是表单提交就为即闪消息（出现后可关闭）赋值，再删除，以便下次刷新后没有。
		req.session.flash = {
			type: 'danger',
			intro: 'Thank you!',
			message: 'The email address you entered was not valid.',
		};
		return res.redirect(303, '/newsletter/archive');
	}
	//以下是储存到数据库
	// new NewsletterSignup({ name: name, email: email }).save(function(err){
	// 	if(err) {
	// 		if(req.xhr){
	// 			return res.json({ error: 'Database error.' });	
	// 		}
	// 		req.session.flash = {
	// 			type: 'danger',
	// 			intro: 'Database error!',
	// 			message: 'There was a database error; please try again later.',
	// 		}
	// 		return res.redirect(303, '/newsletter/archive');
	// 	}
	// 	if(req.xhr){
	// 		return res.json({ success: true });	
	// 	}
	// 	req.session.flash = {
	// 		type: 'success',
	// 		intro: 'Thank you!',
	// 		message: 'You have now been signed up for the newsletter.',
	// 	};
	// 	return res.redirect(303, '/newsletter/archive');
	// });
});


//提交数据
app.post('/process', function(req, res){
	//我们改用ajax后要改写
	if(req.xhr || req.accepts('json,html')==='json'){
	// 如果发生错误，应该发送 { error: 'error description' }
		res.send({ success: true });
	} else {
	// 如果发生错误，应该重定向到错误页面
		res.redirect(303, '/thank-you');
	}
	//console.log('Form (from querystring): ' + req.query.form);
	//console.log('CSRF token (from hidden form field): ' + req.body._csrf);
	//console.log('Name (from visible form field): ' + req.body.name);
	//console.log('Email (from visible form field): ' + req.body.email);
	//res.redirect(303, '/thank-you');
});

app.get('/contest/vacation-photo',function(req,res){
	var now = new Date();
	res.render('contest/vacation-photo',{year:now.getFullYear(),month:now.getMonth()+1});
})

//上传文件
app.post('/contest/vacation-photo/:year/:month', function(req, res){
	var form = new formidable.IncomingForm();
	form.parse(req, function(err, fields, files){
		if(err){
			return res.redirect(303, '/error');
		};
		console.log('received fields:');
		console.log(fields);
		console.log('received files:');
		console.log(files);
		res.redirect(303, '/thank-you');
		});
});


app.get('/tours/hood-river',function(req,res){
	res.render('tours/hood-river')
})

app.get('/tours/request-group-rate',function(req,res){
	res.render('tours/request-group-rate')
})

//发送邮件
// var mailTransport = nodemailer.createTransport(smtpTransport({
// 	host: 'smtp.qq.com',
// 	secureConnection: true, 
// 	port:465,
// 	auth: {
// 		user: credentials.gmail.user,
// 		pass: credentials.gmail.password,
// 	}
// }));

// mailTransport.sendMail({
// 	from: '"全世界最帅的男人" <395340017@qq.com>',
// 	to: '1442665433@qq.com',
// 	subject: '哈哈哈哈',
// 	html:'<h1>这是一份邮件，是不是很大的一个标题</h1>',
// 	generateTextFromHtml: true,
// 	text: '你们两个大笨蛋，哈哈哈哈'
// }, function(err){
// 	if(err){
// 		console.error( 'Unable to send email: ' + err );	
// 	}
// });

//封装后的邮件发送
//emailService.send('1442665433@qq.com', 'Hood River tours on sale today!','Get \'em while they\'re hot!');

//购物车感谢页面,我们还是将发送邮寄模块化吧
app.post('/cart/checkout', function(req, res){
	var cart = req.session.cart;
	console.log(cart)
	if(!cart) next(new Error('Cart does not exist.'));
	var name = req.body.name || '', email = req.body.email || '';
	// 输入验证
	if(!email.match(VALID_EMAIL_REGEX)){
		return res.next(new Error('Invalid email address.'));
	}
	// 分配一个随机的购物车 ID；一般我们会用一个数据库 ID
	cart.number = Math.random().toString().replace(/^0\.0*/, '');
	cart.billing = {
		name: name,
		email: email,
	};
	res.render('email/cart-thank-you',{ layout: null, cart: cart }, function(err,html){
		if( err ){
			console.log('error in email template');
		}
		mailTransport.sendMail({
			from: '"Meadowlark Travel": 395340017@qq.com',
			to: cart.billing.email,
			subject: 'Thank You for Book your Trip with Meadowlark',
			html: html,
			generateTextFromHtml: true
		}, function(err){
			if(err) console.error('Unable to send confirmation: '
		+ err.stack);
		});
	});
	res.render('cart-thank-you', { cart: cart });
});




//定制404页面
app.use(function(req,res,next){
	res.status(404);
	res.render('404')
});

//定制500页面
app.use(function(err,req,res,next){
	console.error(err.stack);
	res.status(500);
	res.render('500')
});


//监听端口
app.listen(app.get('port'),function(){
	console.log('express started on http://locahost:'+app.get('port')+';press Ctrl-C to terminate.')
});