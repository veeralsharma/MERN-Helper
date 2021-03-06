require('dotenv').config()

var express = require("express");
var bodyParser = require("body-parser");
const mongoose = require("mongoose")
var app = express();
var port = process.env.PORT || 5000;
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
var cors = require("cors");
app.use(cors());
app.use((req,res,next) => {
    res.setHeader("Access-Control-Allow-Origin","*")
    res.setHeader("Access-Control-Allow-Headers","*")
    next();
})

var Pusher = require('pusher');

var pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: 'ap2',
  encrypted: true
});

pusher.trigger('my-channel', 'my-event', {
  'message': 'hello world'
});

require("./config/database");

const db = mongoose.connection
db.once("open" , () => {
    console.log("DB opened");

    const msgCollection = db.collection("messages")
    const changeStream= msgCollection.watch()

    changeStream.on("change" , (change) => {
        console.log("change occured" , change);
        if(change.operationType === "insert"){
            const messageDetails = change.fullDocument
            pusher.trigger("messages" , "inserted" , {
                name:messageDetails.name,
                message:messageDetails.message,
                timestamp:messageDetails.timestamp,
                group:messageDetails.group
            })
        }else{
            console.log("error triggering pusher");
        }
    })

})

var Api = express.Router();
app.use("/", Api);
const params = {
  api: Api
};
require("./api/api")(params);

app.listen(port, function() {
  console.log('Server is running on port: ' + port)
})

