const mongoose = require('mongoose');
const Schema = mongoose.Schema;
//creating schema for transactions
const Transactions = new Schema(
  {
    //fname, lname, phoneNumber
    //come from the client page
    fname:{
      type: String,
      required: true
    },
    lname:{
      type: String,
      required: true
    },
    phoneNumber:{
      type: String,
      required: true
    },
    transactName:{
      type: String,
      required: true
    },
    descript:{
      type: String,
      required: true
    },
    //what I spent
    transactCost:{
      type: Number,
      required: false
    },
    transactDate:
    {
      type: String,
      required: true
    },
    //what I charged
    transactPrice:
    {
      type: Number,
      required: true
    },
    transactTime:{
      type: String,
      required: true
    },
    dateEntered:
    {
      type: Date,
      default: Date.now
    }
  });
//setting model
mongoose.model('Transactions', Transactions)