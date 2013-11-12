var gzippo = require('gzippo'),
	express = require('express'),
	app = express();
 
app.use(express.logger('dev'));
app.use(gzippo.staticGzip(__dirname + "/dist"));

// configure server
app.configure(function() {

	// parses request body and populates request.body
	app.use( express.bodyParser() );

	// check for http overides
	app.use( express.methodOverride() );

})

app.get('/about', function(req,res) {
  res.sendfile('./dist/about.html');
});

app.get('/contact', function(req,res) {
  res.sendfile('./dist/contact.html');
});

//The 404 Route (ALWAYS Keep this as the last route)
app.get('*', function(req, res){
  res.sendfile('./dist/index.html');
});

app.listen(process.env.PORT || 3000);
console.log('Listening on port 3000');