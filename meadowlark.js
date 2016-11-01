//这是我们的入口文件,倾向于按照项目命名主文件

var express = require('express'),
	exphbs  = require('express-handlebars');

var app = express();

//设置端口变量
app.set('port',process.env.PORT || 3000);

//设置模板引擎
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

//设置静态文件,static 中间件相当于给你想要发送的所有静态文件创建了一个路由
app.use(express.static(__dirname + '/public'));

app.get('/',function(req,res){
	res.render('home')
})

var person = ['小明','小强','小红'];
app.get('/about',function(req,res){
	var p = person[Math.floor(Math.random()*3)];
	res.render('about',{person:p})
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