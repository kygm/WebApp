//package declarations
const express = require('express');
const app = express();
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');


//mongodb database setup
mongoose.connect('mongodb://localhost/KYGM_Services',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error: '));
db.once('open', () => {
  console.log('MongoDB Connected');
});

//load clients model
require('./models/Clients');
const Client = mongoose.model('Clients');

//must load transact and document models
//afterwards

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
//viewClient table
app.get('/clients/addClient', (req, res) => {
  Client.find({})
  .sort({date: 'desc'})
  .then(clients =>{
    res.render('clients/viewClients',
    {
      clients: clients
    })
  })
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
app.post('/clients', (req, res) => {
  const newClient =
  {
    //in here goes the information
    //recieved from the addclients page.

    fname: req.body.fname,
    lname: req.body.lname,
    city: req.body.city,
    state: req.body.state,
    address: req.body.state,
    phoneNumber: req.body.phoneNumber,
    descript: req.body.descript

  }
  new Client(newClient)
    .save()
    .then(client => {
      res.redirect('./clients/viewClient');
    })
  console.log(req.body);
});




//port selection
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
