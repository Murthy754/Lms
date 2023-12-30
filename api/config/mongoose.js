const mongoose = require('mongoose');
const chalk = require('chalk');
const env = require('./values');

mongoose.Promise = global.Promise;

// Creating connection URI string
const connectionUri = env.values.MONGODB_URL;

// Connection options
const connectionParams={
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true 
};

/** Bootstrap DB connection */
mongoose.connect(connectionUri, connectionParams);

/** On Mongo connection successful */
mongoose.connection.on('open', () => {
    console.log(`${chalk.green('✓')} Mongo Connected`)
});

/** On Mongo connection error */
mongoose.connection.on('error', (error) => {
    console.log(`${chalk.red('x')} Error in connecting MongoDB. ${error}`);
    setTimeout(function () {
        if (mongoose.connection.readyState === 0) {
            db = mongoose.connect(connectionUri, connectionParams);
        }
    }, 1000);
});

/** On Mongo disconnect */
mongoose.connection.on('disconnected', (error) => {
    console.log(`${chalk.red('x')} MongoDB disconnected. ${error}`);
    setTimeout(function () {
        if (mongoose.connection.readyState === 0) {
            db = mongoose.connect(connectionUri, connectionParams);
        }
    }, 1000);
});

/* If the Node process ends, close the Mongoose connection **/
process.on('SIGINT', () => {
    mongoose.connection.close(() => {
        console.log('Mongoose default connection disconnected through app termination');
        process.exit(0);
    });
});
