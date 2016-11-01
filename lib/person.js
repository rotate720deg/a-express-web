var person = ['小明','小强','小红','小詹','小向','小鑫','小刘'];

exports.person = function(){
	return person[Math.floor(Math.random()*person.length)];

}