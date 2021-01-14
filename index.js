//package declarations
const express = require('express');
const app = express();

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
