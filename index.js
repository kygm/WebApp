//package declarations
const express = require('express');
const app = express();
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');

//handlebars
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

//body parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//routes
app.get('/', (req, res) =>{
  const theTitle = 'Title';
  res.render('index', 
  {
    title: theTitle
  });
});

//port declaration
const PORT = 1500;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
