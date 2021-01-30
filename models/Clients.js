const mongoose = require('mongoose');
const Schema = mongoose.Schema;
//creating schema for clients
const Clients = new Schema(
  {
    fname:
    {
      type: String,
      required: true
    },
    lname:
    {
      type: String,
      required: true
    },
    city:
    {
      type: String,
      required: true
    },
    state: 
    {
      type: String,
      required: true
    },
    address: 
    {
      type: String,
      required: true
    },
    phoneNumber:
    {
      type: String,
      required: true
    },
    descript:
    {
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
  mongoose.model('Clients', Clients)