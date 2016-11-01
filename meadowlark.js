//这是我们的入口文件,倾向于按照项目命名主文件

var express = require('express'),
	exphbs  = require('express-handlebars'),
	person = require('./lib/person.js');

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

app.get('/',function(req,res){
	res.render('home')
})


app.get('/about',function(req,res){
	//修改，让这个页面使用tests-about.js单元测试
	res.render('about',{person:person.person(),
		pageTestScript:'/qa/tests-about.js'})
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