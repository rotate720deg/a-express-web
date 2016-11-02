//这是我们的入口文件,倾向于按照项目命名主文件

var express = require('express'),
    exphbs  = require('express-handlebars'),
    person = require('./lib/person.js'),
   	getWeather = require('./lib/weather.js');

var app = express();

//设置端口变量
app.set('port',process.env.PORT || 3000);

//设置模板引擎
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

//设置静态文件,static 中间件相当于给你想要发送的所有静态文件创建了一个路由
app.use(express.static(__dirname + '/public'));

//我们添加一个单元测试
app.use(function(req,res,next){
	res.locals.showTests = app.get('env')!=='production' && req.query.test === '1';
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