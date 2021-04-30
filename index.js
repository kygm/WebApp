//package declarations
const express = require('express');
const app = express();
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { removeAllListeners } = require('nodemon');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
//port declaration
const PORT = process.env.PORT || 1500;

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


  app.get('/clients/logout', (req, res) => {
    res.clearCookie("authorized");
    res.render('./clients/logout');

  });

  /*
  This function takes in a username and password
  to create user, and an admin password. The paramaters are:

  {
    username: "createdUsername",
    password: "createdUserPwd",
    adminPasswrod: "adminPassword"
  }
  */
  app.post('/createUser', async (req, res) => {
    //create user operations go here

    var saltRounds = 10;
    //generate salt (10 char in this instance)

    var user = await User.findOne({
      username: "admin",
    });
    if (user) {
      flag = await bcrypt.compare(req.body.adminPassword, user.password);

      flag ? result = "Yes" : result = "No";
      if (flag) {
        bcrypt.genSalt(saltRounds, function (err, salt) {
          bcrypt.hash(req.body.password, salt, async function (err, hash) {

            const newUser = {
              username: req.body.username,
              email: req.body.email,
              password: hash
            }
            var usr = await User.findOne({ username: newUser.username });
            //if user with specified username does not exist, create user and return
            //user obj
            if (!usr) {
              await new User(newUser)
                .save().then(userObj => {
                  console.log(userObj);
                  return (res.status(200).json("user created"));

                });
            }
            else {
              return (res.status(200).json("user exists"));
            }
          });

        });

      }
      else {
        console.log("Incorrect Password!");
        res.status(500).json("Incorrect Admin Password!")
        res.redirect('/');
      }
    }




  });

  //async not needed as no data is being pulled
  //login page get route
  app.get('/clients/login', (req, res) => {
    res.render('./clients/login');
  });

  //login page post route (auth user)
  app.post('/clients/login', async (req, res) => {

    var result;
    var user = await User.findOne({
      username: req.body.username,
    });
    if (user) {
      flag = await bcrypt.compare(req.body.password, user.password);

      flag ? result = "Yes" : result = "No";
      if (flag) {
        //setting cookies
        res.cookie("authorized", true, {
          maxAge: 3600000, //setting cookie timeout at 1hr
          httpOnly: true
        });
        res.redirect('/');
      }
      else {
        console.log("no user found");

        res.redirect('login');
      }
    }

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
      res.redirect('./website/index');
    }
  });

  //WEBSITE ROUTES
  app.get('/website/index', (req, res) => {
    res.render("./website/index");
  });
  app.get('/website/kygm_services', (req, res) => {
    res.render("./website/kygm_services");
  });
  app.get('/website/small_engines', (req, res) => {
    res.render("./website/small_engines");
  });
  app.get('/website/firefighting', (req, res) => {
    res.render("./website/firefighting");
  });
  app.get('/website/investing', (req, res) => {
    res.render("./website/investing");
  });
  app.get('/website/developing', (req, res) => {
    res.render("./website/developing");
  });
  app.get('/website/translating', (req, res) => {
    res.render("./website/translating");
  });

  //END WEBSITE ROUTES
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
      console.log(req.body);


      await Transaction.find({}).lean()
        .sort({ date: 'desc' })
        .then(transactions => {
          res.render('./clients/viewTransact',
            {
              transactions: transactions,
            });
          //console.log(transactions);
        });
    }
    else {
      res.redirect('/');
    }
  });

  // delete transaction
  app.post('/clients/viewTransact', async (req, res) => {
    if (req.cookies.authorized) {

      if (req.body.fname) {
        console.log(req.body.fname);
        console.log('in the if');
        var capFname = capFL(req.body.fname);
        await Transaction.find({ fname: capFname }).lean()
          .sort({ date: 'desc' })
          .then(transactions => {
            res.render('./clients/viewTransact',
              {
                transactions: transactions,
              });

            //console.log(transactions);
          });
      }
      else if (req.body.id) {
        console.log('deleting transact!');
        await Transaction.deleteOne({
          _id: req.body.id
        })
          .then(() => {
            //req.flash('successMsg', 'Transaction Deleted');
            res.redirect('viewTransact');
          });
      }
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
        address: req.body.address,
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
  //create 404 route
  //must be at end of routes

  app.get('*', (req, res) => {
    res.status(404).send(
      "404 Page Not Found! <a href='/'>Click to return to main</a><footer><p>Also, Epstien didn't kill himself!</p></footer>"
    );
  });


}
//end if show
else {
  app.get('/', (req, res) => {
    res.render('noDb.handlebars');
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
