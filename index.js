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


//viewClient pages
//get route
app.get('/clients/viewClient', (req, res) => {
  Client.find({}).lean()
    .sort({ date: 'desc' })
    .then(clients => {
      res.render('./clients/viewClient',
        {
          clients: clients
        });
    });
});
//post route, phone number to search client
app.post('/clients/addTransact/:id', (req, res) => {

  Client.find({
    phoneNumber: req.params.id
  })
    .then(
      res.redirect('/clients/addTransact')
    );
  console.log(req.params.id);
});


//addTransact page
app.get('/clients/addTransact', (req, res) => {
  res.render('./clients/addTransact');
});

//viewTransact page
app.get('/clients/viewTransact', (req, res) => {
  res.render('./clients/viewTransact');
});

//addClient page
app.get('/clients/addClient', (req, res) => {
  res.render('./clients/addClient');
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

//completeTransact page
app.post('/clients/completeTransact', (req, res) => {
  res.render('./completeTransact');
});
app.get('/clients/completeTransact', (req, res) => {
  res.render('./completeTransact');
});




//********************CONFIG*SECTION***********************//


//port selection
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
  // console.log(Client.find({})
  // .sort({date: 'desc'}));
});
