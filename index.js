var config = require('./config');
var express = require('express');
var routes = require('./routes');


//intitalizing express 
var app = express();
var port = config.envConfig.port;
var userRoute = routes.userRoute;
//setting express json parser as a middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/", userRoute);


const host = '0.0.0.0';
app.listen(port, host, () => {
    console.log("listening on port " + port)
});