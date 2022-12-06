const express = require("express");
const mongoose = require("mongoose");
const app = express();

const morgan = require("morgan");
const cors = require("cors");
const bodyParser = require("body-parser");
const { application } = require("express");

mongoose.connect(
  "mongodb+srv://armanfaruqui:mediumalgorithm@atlascluster.kbarcly.mongodb.net/?retryWrites=true",
  { useUnifiedTopology: true, useNewUrlParser: true }
);
mongoose.Promise = global.Promise;

app.use(morgan("dev")); // HTTP Request middleware
app.use(cors()); // Prevents cross origin resource sharing errors. ie when client receives response from an incorrect port
app.use(bodyParser.urlencoded({ extended: false })); // Makes JSON data more readable
app.use(bodyParser.json());

// app.post("/api/signIn", function(req, res){
//   console.log(req.body)
// })

//Routes
app.use("/api/signUp", require("./router/signUp"));
app.use('/api/signIn', require('./router/signIn'));


module.exports = app;
