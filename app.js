var express = require('express');
var path = require('path');
var mongoose = require('mongoose');
mongoose.set('useNewUrlParser', true);
mongoose.set('useUnifiedTopology', true);
mongoose.set('useFindAndModify', false);
var config = require ('./config/database');
var bodyParser = require('body-parser');
var session = require('express-session');
var expressValidator =  require('express-validator');
var fileUpload = require('express-fileupload');
// connect to db

mongoose.connect(config.database)
.then(() => console.log('Connect to MongoDB... '))
.catch(err =>console.error('Could not connect tp MongoDB...',err))

//init app
var app = express();

//view engine setup

app.set('views', path.join(__dirname,'./views/layout'));
app.set('view engine', 'ejs');


//Set public folder
app.use(express.static(path.join(__dirname, 'public')));

app.locals.errors = null;
//Express fileUpload middleware
app.use(fileUpload());

//Body parser middleware



// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

//Express Session Middleware
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
   // cookie: { secure: true }
  }));


  //Express Validator middleware

app.use(expressValidator({
    errorFormatter: function (param, msg,value) {
        var namespace = param.split('.')
        , root = namespace.shift()
        , formParam = root;

        while(namespace.length){
            formParam +='[' + namespace.shift() + ']';
        }
        return {
            param : formParam,
            msg : msg,
            value : value
        };
        
    },
    customValidators: {
        isImage: function (value, filename) {
            var extension = (path.extname(filename)).toLowerCase();
            switch (extension) {
                case '.jpg':
                    return '.jpg';
                case '.jpeg':
                    return '.jpeg';
                case '.png':
                    return '.png';
                case '':
                    return '.jpg';
                default:
                    return false;
            }
        }
    }

}));


//Express Messages middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});



//Set routes
var pages = require('./routes/pages');
var adminPages = require('./routes/adminpages');
var adminCategories = require('./routes/admincategories');
var adminProducts = require('./routes/adminproducts');

app.use('/admin/pages',adminPages);
app.use('/admin/categories',adminCategories);
app.use('/admin/products',adminProducts);


app.use('/',pages);
//Start the Server

var port = 3000;
app.listen(port, function(){
    console.log('running ' + port);
});