const mongoose = require('mongoose');
const Schema = mongoose.Schema;
//creating schema for transactions
const Users = new Schema(
  {
    username:{
      type: String,
      required: true
    },
    password:{
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
mongoose.model('Users', Users)