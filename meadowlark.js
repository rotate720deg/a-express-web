//这是我们的入口文件,倾向于按照项目命名主文件

var express = require('express'),
    exphbs  = require('express-handlebars'),
    person = require('./lib/person.js'),
   	getWeather = require('./lib/weather.js'),
   	bodyparser = require('body-parser'),
   	formidable = require('formidable'),
   	cookieParser = require('cookie-parser'),
   	session = require('express-session');


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
app.use(cookieParser());
app.use(session());
//我们添加一个单元测试
app.use(function(req,res,next){
	res.locals.showTests = app.get('env')!=='production' && req.query.test === '1';
	next();
});

//即闪falsh消息
app.use(function(req, res, next){
	// 如果有即显消息，把它传到上下文中，然后清除它
	res.locals.flash = req.session.flash;
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
	if(!email.match(VALID_EMAIL_REGEX)) {
		if(req.xhr){
			return res.json({ error: 'Invalid name email address.' });
		} 
		req.session.flash = {
			type: 'danger',
			intro: 'Validation error!',
			message: 'The email address you entered was not valid.',
		};
		return res.redirect(303, '/newsletter/archive');
	}
	//以下是储存到数据库
	new NewsletterSignup({ name: name, email: email }).save(function(err){
		if(err) {
			if(req.xhr){
				return res.json({ error: 'Database error.' });	
			}
			req.session.flash = {
				type: 'danger',
				intro: 'Database error!',
				message: 'There was a database error; please try again later.',
			}
			return res.redirect(303, '/newsletter/archive');
		}
		if(req.xhr){
			return res.json({ success: true });	
		}
		req.session.flash = {
			type: 'success',
			intro: 'Thank you!',
			message: 'You have now been signed up for the newsletter.',
		};
		return res.redirect(303, '/newsletter/archive');
	});
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