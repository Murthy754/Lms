
let express = require('express');
let cookieParser = require('cookie-parser');
let cookipeApp = express();

cookipeApp.use(cookieParser());
cookipeApp.get('/', (req, res) => {
    res.send('welcome to express app');
});

cookipeApp.get('/setuser', (req, res) => {
    var authObj={
        _authenticated:true,
        _enabledCoockie:true
    }    
    res.cookie("_a", authObj);
    res.send("Okay");
});
cookipeApp.get('/authenticate', (req, res) => {
    if(req.cookies._a!=undefined)
    {
        res.json({
            auth:req.cookies._a._authenticated
        });
    }
    else{
        res.json({
            auth:true
        });
    }
});

cookipeApp.get('/disableauth', (req, res) => {
    var authObj={
        _authenticated:false,
        _enabledCoockie:true
    }    
    res.cookie("_a", authObj);
    res.send("Okay");
});

module.exports=cookipeApp;