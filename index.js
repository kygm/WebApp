//package declarations
const express = require('express');
const app = express();
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { removeAllListeners } = require('nodemon');

//mongodb database setup

//cloud db url
const dbUrl = "mongodb+srv://admin:Password1@cluster.qtabs.mongodb.net/test?retryWrites=true&w=majority";

mongoose.connect(dbUrl,
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

//load transact model
require('./models/Transaction');
const Transaction = mongoose.model('Transactions');

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

//about page GET
app.get('/about', (req, res) => {
  res.render('about');
});

/*
  ASYNC FUNCTIONS NEEDED FOR ACCESSING 
  CLOUD BASED MONGO DB
*/

app.post('/clients/viewClient', async (req, res) => {
  var search = req.body.search;
  search = capFL(search);
  console.log("query = "+search);

  await Client.find({fname: search}).lean()
    .then(client => {
      res.render('./clients/viewClient',
        {
          clients: client
        });
        console.log(client);
    });
});
//viewClient pages
//get route
app.get('/clients/viewClient', async (req, res) => {

  
  await Client.find({}).lean()
    .sort({ date: 'desc' })
    .then(clients => {
      res.render('./clients/viewClient',
        {
          clients: clients
        });
    });

});
//post route, phone number to search client
app.post('/clients/addTransact', (req, res) => {
  res.render('./clients/addTransact',
    {
      fname: req.body.fname,
      lname: req.body.lname,
      phoneNumber: req.body.phoneNumber
    });
  console.log("body");
  console.log(req.body);
  console.log("params");
  console.log(req.params);

  //console.log(req.params.id);
});

//addTransact page
app.get('/clients/addTransact', (req, res) => {
  res.render('./clients/addTransact');
});

//viewTransact page
app.get('/clients/viewTransact', async (req, res) => {

  await Transaction.find({}).lean()
    .sort({ date: 'desc' })
    .then(transactions => {
      res.render('./clients/viewTransact',
        {
          transactions: transactions,
        });
      console.log(transactions);
    });
});
// delete transaction
app.delete('/:dateEntered',ensureAuthenticated,async(req,res)=>{
  //res.send('Delete');
  await Transaction.deleteOne({
    dateEntered:req.params.dateEntered
  })
  .then(()=>{
    req.flash('successMsg','Transaction Deleted');
    res.redirect('./clients/viewTransact');
  });
});
//addClient page
app.get('/clients/addClient', (req, res) => {
  res.render('./clients/addClient');
});
//working with posted information from 
//add clients page
app.post('/clients', async (req, res) => {
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
  await new Client(newClient)
    .save()
    .then(client => {
      res.redirect('./clients/viewClient');
    });

  console.log(req.body);
});

//completeTransact page
app.post('/clients/completeTransact', async (req, res) => {

  const newTransact =
  {
    fname: req.body.fname,
    lname: req.body.lname,
    phoneNumber: req.body.phoneNumber,
    transactDate: req.body.transactDate,
    transactCost: req.body.cost,
    transactPrice: req.body.price,
    transactTime: req.body.time,
    descript: req.body.message,
    transactName: req.body.transactName
  }

  await new Transaction(newTransact)
    .save()
    .then(transaction => {
      res.redirect('/clients/viewTransact')
    })
  console.log(req.body);
});



//capitalize first letter f(x)
function capFL(string) {
  string = string.toLowerCase();
  return string.charAt(0).toUpperCase() + string.slice(1);
}


//********************CONFIG*SECTION***********************//


//port selection
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);

});
