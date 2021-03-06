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
const remoteDbUrl = "mongodb://nnse:nnse@ds019654.mlab.com:19654/heroku_grcd8z76";
const urlToUse = debugMode ? localDbUrl : remoteDbUrl;
mongoose.init(urlToUse);

const entityManager = require('./routes/entityManager');
// TODO get these from FormEntities -> single source of truth!
['Mailbox', 'Tenant', 'Lease', 'Room', 'Invoice'].forEach(entity => entityManager.setupEntity(app, 'api', entity));

const port = process.env.PORT || 3000;
const url = "http://" + (debugMode ? "localhost:" + port : "nnse.herokuapp.com");

const makeCsv = require('./routes/makeCsv');
const leasesEndpoint = "/api/leases";
app.use("/api/makecsv", (req, res) => makeCsv.serveCsv(res, url + leasesEndpoint));

const makePdf = require('./routes/makePdf');
app.use("/api/makepdf", (req, res) => makePdf.generatePdf(req, res));
app.use("/api/downloadpdf", (req, res) => makePdf.downloadPdf(req, res));

const indexHtmlPath = path.join(__dirname, 'public', 'index.html');
app.use((req, res) => res.sendFile(indexHtmlPath));

app.listen(port, err => {
    if (err) {
        throw new Error(err);
    }

    console.log('Listening on ' + url);
});
