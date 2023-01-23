//import the modules
const express = require('express');
const path = require('path');


//set up express validator
const {check, validationResult} = require('express-validator'); // ES6 destructuring object
const e = require('express');
const fileupload = require('express-fileupload');

//setup express-session
const session = require('express-session');

// set up mongoose
const mongoose = require('mongoose');

//connection to mongoose compass
mongoose.connect('mongodb://127.0.0.1:27017/project');

//model created to store homepage and edited page form data
const CustomerData = mongoose.model('CustomerData', {
    flName: String,
    emailPhone: String,
    description: String,
    photoname: String

});

// create a model for admin users
const AdminUserLogin = mongoose.model('AdminUserLogin',{
    username: String,
    password: String
});


//create express app
var myApp = express();

//use fileupload method
myApp.use(fileupload());

//using session with secret key 
myApp.use(session({
    secret: 'jewioqkdj1934842p2i3u3uu', // should be unique for each application
    resave: false,
    saveUninitialized: true
})); 


//creating static public directory path
myApp.use(express.static(__dirname + '/public'));

//define view engine and views
//below set the view engine as a ejs.
myApp.set('view engine', 'ejs');
//myApp.set('views', './views');
//below define the path for views filess
myApp.set('views', path.join(__dirname, 'views'));

//set up body parser
myApp.use(express.urlencoded({extended:false}));


//routes
//form page, when side load initial page that will be loaded
myApp.get('/',function(req, res){

    res.render('home'); //render home.ejs file from the views folder
    
});


//login page
myApp.get('/login',function(req, res){

    res.render('login'); //render login.ejs file from the views folder
    
});

//when logout 
myApp.get('/logout',function(req, res){
    req.session.username = ''; // reset the username
    req.session.loggedIn = false; // make logged in false from true
    //redirect to login page when logout
    res.redirect('/login');
});

//dashboard page
myApp.get('/dashboard',function(req, res){

    //condition when user logged in
    if(req.session.loggedIn){

        //find all data in mongoDB model
        CustomerData.find({}).exec(function(err, customerInformations){
            var pageData = {
                customerInformations: customerInformations
            }
            res.render('dashboard', pageData);  //render dashboard with pagedata
        });
    }
    else {
        //redirect to login page when user not logged in
        res.redirect('/login'); 
    }
   
    
});

//view page
myApp.get('/view/:id',function(req, res){

    //condition when user logged in
    if(req.session.loggedIn){ 
        
        var id = req.params.id;

        //findone id data in mongoDB model
        CustomerData.findOne({_id:id}).exec(function(err, custData){

        var pageData = {
            flName: custData.flName,
            emailPhone: custData.emailPhone,
            photoname:  custData.photoname,
            description: custData.description
            

        }

        res.render('view', pageData); //render view page with pagedata

        });

    }
    else {
        //redirect to login page when user not logged in
        res.redirect('/login');
    }

    

});

//edit page
myApp.get('/edit/:id',function(req, res){

    //condition when user logged in
    if(req.session.loggedIn){ 
        //fetch id
        var id = req.params.id;
        //res.send('the id is ' + id);
        //findone id data in mongoDB model
        CustomerData.findOne({_id:id}).exec(function(err, custData){
            var pageData = {
                flName: custData.flName,
                emailPhone: custData.emailPhone,
                photoname:  custData.photoname,
                description: custData.description,
                id: id
            }   
            res.render('edit', pageData); //render edit page with pagedata
        });
    }
    else {
        //redirect to login page when user not logged in
        res.redirect('/login');
    }
    

});

//delete page
myApp.get('/delete/:id',function(req, res){

    //condition when user logged in
    if(req.session.loggedIn){
        var id = req.params.id;
        //res.send('the id is ' + id);
        //findbyIDanddelete function of ejs with id parameter from mongoDB model
        CustomerData.findByIdAndDelete({_id:id}).exec(function(err, custData){

            var message = 'Sorry, request not found'; // be default assume card not found
            if(custData){ // if data exists, then change the message
                message = 'The request has been successfully deleted';
            }

            var pageData = {
                message: message
            }
            res.render('success', pageData); //render success message page with pagedata
        });
    }
    else {
        //redirect to login page when user not logged in
        res.redirect('/login');
    }

});

//post method for new request /process action from home.ejs page
myApp.post('/process', function(req, res){

    //fetch all the form field
    var flName = req.body.flName;
    var emailPhone = req.body.emailPhone;
    //fetch the image
    var photo = req.files.photo;
    //fetch the name of the image
    var photoname = req.files.photo.name;
    var description = req.body.description;

    // path to store the image permanently
    // ideally this should have some logic to create unique
    // image names to avoid overwriting existing images
    var imagePath = 'public/uploads/'+ photoname;
    // store the image permamently at the defined path
    photo.mv(imagePath);

    //create an object with the fetched data to send to the view
    var pageData = {
        flName: flName,
        emailPhone: emailPhone,
        photoname: photoname,
        description: description
    }

    //creating object for model
    var customerInfo = new CustomerData(pageData);
    //saving data to the database with save method
    customerInfo.save();

    res.render('submitSuccess', pageData); //render  submitsucess page with pagedata
});

//post method to edit request /editprocess action from edit.ejs page
myApp.post('/editprocess', function(req, res){

    //redierect to login page when user is not logged in
    if(!req.session.loggedIn) {
        res.redirect('/login');
    }
    else {
        //else part when user is logged in and submit the edited form for edit.ejs
        
        //fetch id
        var id = req.body.id;
        //fetch all the form field
        var flName = req.body.flName;
        var emailPhone = req.body.emailPhone;
        //fetch the image
        var photo = req.files.photo;
        //fetch the name of the image
        var photoname = req.files.photo.name;
        var description = req.body.description;

        // path to store the image permanently
        // ideally this should have some logic to create unique
        // image names to avoid overwriting existing images
        var imagePath = 'public/uploads/'+ photoname;
        // store the image permamently at the defined path
        photo.mv(imagePath);


        //findone function with id parameter from mongodb model and save in local variable custData 
        CustomerData.findOne({_id:id}).exec(function(err, custData){
            //updating all the form data from the edit page to database
            custData.flName = flName;
            custData.emailPhone = emailPhone;
            custData.photoname = photoname;
            custData.description = description;
            //saving all the data to database for updation in mongoDB model
            custData.save();
        });
        
        //message to show successfully edited the request
        var pageData = {

            message: 'Your request has been successfully edited'
        }

        res.render('success', pageData); //render success message page with message pageData
    }

    
});

// login process page
//post method to login /loginprocess action from login.ejs page
myApp.post('/loginprocess', function(req, res){
    // fetch input
    var username = req.body.username;
    var password = req.body.password;

    // find username and password in database from mongoDB model
    AdminUserLogin.findOne({username: username, password: password}).exec(function(err, adminuser){
        
        //if the condition is true and username and password matched to store username and password
        if(adminuser){ // would be true if there is data returned in adminuser
            // save in session
            req.session.username = adminuser.username;
            req.session.loggedIn = true;
            
            res.redirect('/dashboard'); // condition true then redirect to dashboard page
        }
        else{
            //res.send('Username and pass not correct'); // change this later
            var pageData = {
                error : 'Login details not correct'
            }
            res.render('login', pageData); //render to login page with pagedata showing error message
        }
    });
});


// ------- application setup stuff -------
// do not push to production
//setup for login that we have run once for saving username and password information to the adminuserlogin model
myApp.get('/setup',function(req, res){
    var adminData = {
        username: 'admin',
        password: 'admin'
    }

    //creating object for AdminUserLogin model
    var newAdmin = new AdminUserLogin(adminData);
    //saving admin data to database using save method
    newAdmin.save();
    // when setup will be run the done message will be showing up
    res.send('Done');
});


//listen at a port 
// myApp.listen(8080, () => {console.log('Open http://localhost/8080')});
myApp.listen(8080);

console.log('Open http://localhost:8080 in your browser');