'use strict';

require('dotenv').config();
const express = require('express');
const superagent = require('superagent');

// setupes
const PORT = process.env.PORT || 3030;
const server = express();

server.use(express.urlencoded({ extended: true }));
server.set('view engine', 'ejs');
server.use(express.static('./public'));
server.use(errorHandler);

// routes
server.get('/', homeHandler);
// server.get('/hello', helloHandler);
server.get('/searches/new', newHandler);
server.post('/searches', booksHandler);

// unfound route
server.get('*', (req, res) => res.status(404).send('This route does not exist'));

function errorHandler(err, req, res, next) {
    if (res.headersSent) {
        return next(err);
    }
    res.status(500);
    res.render('pages/error', { error: err });
}

// routes function
function homeHandler(req, res) {
    res.render('pages/index');
}

function helloHandler(req, res) {
    res.render('pages/index');
}

function newHandler(req, res) {
    res.render('pages/searches/new')
}

let c = [];

async function booksHandler(req, res) {
    //let 
    let url = `https://www.googleapis.com/books/v1/volumes?q=+${req.body.book[1]}:${req.body.book[0]}`
    console.log(url);
    superagent.get(url)
    .then(data =>{
      let result =data.body.items.map(ele=> new Book(ele.volumeInfo));
      res.render('pages/searches/show', { results: result })
    }).catch(error => res.send(error));
}

//constructor
function Book(data) {
    this.title = data.title || 'No title';
    this.author = (data.authors) ?data.authors.join(',') : 'No author';
    this.description = (data.description)?data.description: 'No description';
    this.image = (data.imageLinks) ? data.imageLinks.smallThumbnail : 'https://i.imgur.com/J5LVHEL.jpg';
}

server.listen(PORT, () => {
    console.log(`Listening on PORT ${PORT}`)
})