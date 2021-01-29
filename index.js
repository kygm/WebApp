//package declarations
const express = require('express');
const app = express();
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
//port declaration
const PORT = 1500;

//handlebars
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

//body parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//ROUTES
//index page
app.get('/', (req, res) => {
  const theTitle = 'Welcome Back!';
  res.render('index',
    {
      title: theTitle
    });
});

//about page
app.get('/about', (req, res) => {
  res.render('about');
});

//addClient page
app.get('/clients/addClient', (req, res) => {
  res.render('./clients/addClient');
});

//viewClient page
app.get('/clients/viewClient', (req, res) => {
  res.render('./clients/viewClient');
});

//addTransact page
app.get('/clients/addTransact', (req, res) => {
  res.render('./clients/addTransact');
});

//viewTransact page
app.get('/clients/viewTransact', (req, res) => {
  res.render('./clients/viewTransact');
});

//working with posted information from 
//add clients page
app.post('/clients/addClient', (req, res) => {
  const newClient = 
  {
    //in here goes the information
    //recieved from the addclients page.
  }
  //once client is added, redirect to 
  //view newly created client
  res.redirect('./clients/viewClient');
});




//port selection
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
