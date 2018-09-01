var apps = [
	{
		"AppName":"JUNO",
		"Url":"http://www.google.com"
	},
	{
		"AppName":"UTKARSH",
		"Url":"http://10.85.225.138:23330"
	}
];

//--------------------------------------------------------------------------------------------
//      DO NOT MODIFY BELOW
//--------------------------------------------------------------------------------------------
function getUrl(url){
	for(var i=0; i<apps.length; i++){
		if(url.includes(apps[i].AppName)){
			return apps[i].Url;
		}
	}
	return "";
}


var proxy = require('express-http-proxy');
var express = require('express');
var app = express();
var request = require('request');
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

for(var i=0; i<apps.length; i++){
	// app.all('/*/' + apps[i].AppName + '/*', proxy(apps[i].Url));	
	app.all('/*/' + apps[i].AppName + "-BACKEND-APP" + '/*', function(req,res){
		 var from = req.url.search("-BACKEND-APP") + 12;
		 console.log(req.method, req.headers, req.body, getUrl(req.url) + req.url.substr(from));
		 // request(getUrl(req.url) + req.url.substr(from)).pipe(res);
		 request({
		 	method: req.method,
		 	uri: getUrl(req.url) + req.url.substr(from),
		 	headers : req.headers,
		 	body: (req.method == "GET")? null : JSON.stringify(req.body)
		 }).pipe(res);
	});	
}

app.use("/open-ui5/",express.static('openui5-runtime-1.56.6'));
app.use("/",express.static('launchpad'));


const fs = require('fs');
var app_to_be_served = [];

fs.readdirSync(__dirname).forEach(file => {
	var path = __dirname + "/" + file + "/config.json";
	if (fs.existsSync(path)) {
	    app.use("/" + file + "/", express.static(file));
	    var appDetails = JSON.parse(fs.readFileSync(path, 'utf8'));
	    appDetails.appId = file;
	    app_to_be_served.push(appDetails);
	}
});



app.get("/ui-apps/",function(req,res){
	res.json(app_to_be_served);
});

app.get("/backend-apps/",function(req,res){
	res.json(apps);
});


//-------------------------------------------------------------------------------------
var mongodbHandler = require("mongodbhandler");
app.post("/test/add-test-set",function(req,res){
	var test = req.body;
	mongodbHandler.insert("questionSet",test,function(err,result){
		if(err) res.end(err);
		else res.end("Done");
	})
});

app.get("/test/get-all-test", function(req,res){
	mongodbHandler.read("questionSet",{},function(err,result){
		if(err) res.end(err);
		else{
			var retTest = [];
			for(var i=0; i<result.length; i++){
				retTest.push({
					id: result[i]._id,
					name: result[i].name
				})
			}
			res.json(retTest);
		}
	})
});

app.post("/test/generate-test", function(req,res){
	var testID = req.body.testid;
	var name = req.body.name;
	mongodbHandler.readById("questionSet",testID,function(err,result){
		if(err) res.end(err);
		else{
			result[0].candidate_name = name;
			delete result[0]._id;
			
			mongodbHandler.insert("tests", result, function(err2, result2){
				if(err2) res.send(err2);
				else{
					res.json(result2);
				}
			});
		}
	});
});

app.get("/test/get-test/:id", function(req,res){
	var testID = req.params.id;
	mongodbHandler.readById("tests", testID, function(err,result){
		if(err) res.end(err);
		else{
			if(!result[0].started_at){

				mongodbHandler.patchById("tests",testID,{started_at:getTime()}, function(err2, result2){
					if(err) res.end(err2);
					else{
						result[0].started_at = getTime();
						res.json(result);
					}
				});
			}else{
				res.json(result);
			}
		}
	});
});

app.post("/test/submit",function(req,res){
	var answers = req.body;
	var id = answers._id;
	delete answers._id;
	mongodbHandler.updateById("tests", id, answers, function(err,result){
		if(err) res.json(err);
		else {console.log("----------------------",result);res.json({"OK":"OK"});};
	});
});

function getTime(){
	var d = new Date,
    dformat = [(d.getMonth()+1),
               d.getDate(),
               d.getFullYear()].join('/') +' ' +
              [d.getHours(),
               d.getMinutes(),
               d.getSeconds()].join(':');
     return dformat;
}

//--------------------------------------------------------------------------------------



port = 3000;
host = '127.0.0.1';
var server = app.listen(port, function(){
    console.log('Listening at http://' + host + ':' + port);    
});