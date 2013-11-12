var gzippo = require('gzippo'),
	express = require('express'),
	app = express();
 
app.use(express.logger('dev'));
app.use(gzippo.staticGzip(__dirname + "/demo/dist"));

// configure server
app.configure(function() {

	// parses request body and populates request.body
	app.use( express.bodyParser() );

	// check for http overides
	app.use( express.methodOverride() );

})

//The 404 Route (ALWAYS Keep this as the last route)
app.get('*', function(req, res){
  res.sendfile('/index.html');
});

app.listen(process.env.PORT || 3000);
console.log('Listening on port 3000');