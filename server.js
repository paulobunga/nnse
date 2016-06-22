const express = require('express');
const path = require('path');
const app = express();

const debugMode = process.argv.indexOf("--dev") > -1;
if (debugMode) {
    const webpack = require('webpack');
    const webpackDevMiddleware = require('webpack-dev-middleware');
    const webpackHotMiddleware = require('webpack-hot-middleware');

    const config = require('./webpack.config.js');
    const compiler = webpack(config);
    app.use(webpackDevMiddleware(compiler, {noInfo: true, publicPath: config.output.publicPath}));
    app.use(webpackHotMiddleware(compiler));
} else {
    const outputPath = path.join(__dirname, 'public', 'build');
    app.use('/build/', express.static(outputPath));
}

const bodyParser = require('body-parser');
app.use(bodyParser.json());

const mongoose = require('./db/db');
const localDbUrl = "mongodb://127.0.0.1:27017/nnse";
const remoteDbUrl = "mongodb://nnse:nnse0heroku@ds019654.mlab.com:19654/heroku_grcd8z76";
const urlToUse = debugMode ? localDbUrl : remoteDbUrl;
mongoose.init(urlToUse);

const entityManager = require('./routes/entityManager');
entityManager.init(app, 'api');
['Mailbox', 'Tenant', 'Lease', 'Room', 'Invoice'].forEach(entity => entityManager.setupEntities(entity));

const indexHtmlPath = path.join(__dirname, 'public', 'index.html');
app.use((req, res) => res.sendFile(indexHtmlPath));

const port = process.env.PORT || 3000;
app.listen(port, err => {
    if (err) {
        throw new Error(err);
    }

    console.log('Listening on http://localhost:' + port);
});