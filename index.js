//package declarations
const express = require('express');
const app = express();
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { removeAllListeners } = require('nodemon');
const cookieParser = require('cookie-parser');
//port declaration
const PORT = 1500;

//authorization var
var authorized;

//todays date
var todaysDate = new Date();
var dd = String(todaysDate.getDate()).padStart(2, '0');
var mm = String(todaysDate.getMonth() + 1).padStart(2, '0'); //January is 0!
var yyyy = todaysDate.getFullYear();


//handlebars
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

//body parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
//cookie parser
app.use(cookieParser());

//to add cookie:
//res.cookie("strCookieName", cookieVar);

//to retrieve cookie:
//req.cookies.strCookieName;

//to clear cookie:
//res.clearCookie("strCookieName");

var show = 0;

//mongodb database setup
//cloud db url
const dbUrl = "mongodb+srv://admin:Password1@cluster.qtabs.mongodb.net/test?retryWrites=true&w=majority";

mongoose.connect(dbUrl,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
//for showing page if conn error
var show;

const db = mongoose.connection;

//console.log(db.error);
db.on('error', () => {
  console.error.bind(console, 'connection error: ');
}).then(show = 1);
db.once('open', () => {
  console.log('MongoDB Connected');
}).then(show = 2);

console.log("DB Status: " + show);

if (show == 2) {
  //load clients model
  require('./models/Clients');
  const Client = mongoose.model('Clients');

  //load transact model
  require('./models/Transaction');
  const Transaction = mongoose.model('Transactions');

  //load user model
  require('./models/User');
  const User = mongoose.model('Users');
  //must load transact and document models
  //afterwards

  //ROUTES
  //async not needed as no data is being pulled
  app.get('/clients/login', (req, res) => {
    res.render('./clients/login');
  });

  app.post('/clients/login', async (req, res) => {
    User.findOne({
      username: req.body.username,
      password: req.body.password
    }).lean()
      .then(user => {
        if (user) {
          console.log("user found");
          res.cookie("authorized", true);
          res.redirect('/');

        }
        else {
          console.log("no user found");
          res.redirect('login');
        }


      }
      )
  });
  //index page
  app.get('/', (req, res) => {

    if (req.cookies.authorized) {
      //res.clearCookie("authorized");
      console.log(req.cookies);
      todaysDate = mm + '/' + dd + '/' + yyyy;
      res.render('index',
        {
          title: todaysDate
        });
    }
    else {
      res.redirect('./clients/login');
    }
  });

  app.post('/clients/revenue', async (req, res) => {
    //currently inactive route. Will redirect to 
    //index page.
    res.redirect('/');
  });
  app.get('/clients/revenue', async (req, res) => {
    if (req.cookies.authorized) {
      //aggregate f(x) to view total revenue
      //based on a certain year inputted
      await Transaction.find({}).lean()
        .sort({ date: 'desc' })
        .then(transactions => {
          res.render('./clients/revenue',
            {
              transacts: transactions,
            });
          console.log(transactions);
        });//end await
    }
    else {
      res.redirect('/');
    }

    //res.render('./clients/revenue');
  });
  //about page GET
  app.get('/about', (req, res) => {
    res.render('about');
  });

  /*
    ASYNC FUNCTIONS NEEDED FOR ACCESSING 
    CLOUD BASED MONGO DB
  */

  //search by fname route
  app.post('/clients/viewClient', async (req, res) => {
    if (req.cookies.authorized) {
      var search = req.body.search;
      search = capFL(search);
      console.log("query = " + search);

      await Client.find({ fname: search }).lean()
        .then(client => {
          res.render('./clients/viewClient',
            {
              clients: client
            });
          console.log(client);
        });
    }
    else {
      res.redirect('/');
    }
  });

  //viewClient pages
  //get route
  app.get('/clients/viewClient', async (req, res) => {
    if (req.cookies.authorized) {
      await Client.find({}).lean()
        .sort({ date: 'desc' })
        .then(clients => {
          res.render('./clients/viewClient',
            {
              clients: clients
            });
        });
    }
    else {
      res.redirect('/');
    }
  });

  app.post('/clients/editClient', async (req, res) => {
    if (req.cookies.authorized) {
      console.log("In edit client...")
      console.log(req.body);
      //res.render('./clients/editClient');

      //currently, error is that req.body.fname is null, although req.body shows that its filled.
      //typeof operator returns primitive type of object being sent in.

      await Client.find({ _id: req.body.id }).lean()
        .then(client => {
          res.render('./clients/editClient',
            {
              clients: client
            });

        });
    }
    else {
      res.redirect('/');
    }


    //res.redirect('viewClient');
  });

  //complete edit page
  app.post('/clients/completeCEdit', async (req, res) => {
    if (req.cookies.authorized) {
      console.log("Completing edit...");
      console.log(req.body);
      await Client.updateOne({ _id: req.body.id }
        , {

          fname: req.body.fname,
          lname: req.body.lname,
          state: req.body.state,
          address: req.body.address,
          phoneNumber: req.body.phoneNumber,
          city: req.body.city,
          descript: req.body.descript
        }, { upsert: true }
      );
      res.redirect('viewClient');
    }
    else {
      res.redirect('/');
    }

  });
  //post route, phone number to search client
  app.post('/clients/addTransact', (req, res) => {
    if (req.cookies.authorized) {
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

    }
    else {
      res.redirect('/');
    }
    //console.log(req.params.id);
  });

  app.post('/clients/deleteClient', async (req, res) => {
    if (req.cookies.authorized) {
      console.log("Deleting client...");
      console.log(req.body);
      await Client.deleteOne({ _id: req.body.id })
        .then(() => {
          res.redirect("viewClient");
        });
    }
    else {
      res.redirect('/');
    }
  });


  //addTransact page
  app.get('/clients/addTransact', (req, res) => {
    res.render('./clients/addTransact');
  });

  //viewTransact page
  app.get('/clients/viewTransact', async (req, res) => {
    if (req.cookies.authorized) {
      await Transaction.find({}).lean()
        .sort({ date: 'desc' })
        .then(transactions => {
          res.render('./clients/viewTransact',
            {
              transactions: transactions,
            });
          console.log(transactions);
        });
    }
    else {
      res.redirect('/');
    }
  });

  // delete transaction
  app.post('/clients/viewTransact', async (req, res) => {
    if (req.cookies.authorized) {
      //res.send('Delete');
      console.log(req.body);
      await Transaction.deleteOne({
        _id: req.body.id
      })
        .then(() => {
          //req.flash('successMsg', 'Transaction Deleted');
          res.redirect('viewTransact');
        });
    }
    else {
      res.redirect('/');
    }
  });

  //addClient page
  app.get('/clients/addClient', (req, res) => {
    if (req.cookies.authorized) {
      res.render('./clients/addClient');
    }
    else {
      res.redirect('/');
    }
  });
  //working with posted information from 
  //add clients page
  app.post('/clients', async (req, res) => {
    if (req.cookies.authorized) {
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
    }
    else {
      res.redirect('/');
    }
  });

  //completeTransact page
  app.post('/clients/completeTransact', async (req, res) => {
    if (req.cookies.authorized) {
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
    }
    else {
      res.redirect('/');
    }
  });
}
//end if show
else {
  app.get('/', (req, res) => {
    res.render('DBerror.handlebars');
  });
}


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
