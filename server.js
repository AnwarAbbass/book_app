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
    let url = `https://www.googleapis.com/books/v1/volumes?q=${req.body.book[0]}`
    // console.log(req.body.book);
    if (req.body.book[1] === 'title') url += `+intitle:${req.body.book[0]};`
    if (req.body.book[1] === 'author') url += `+inauthor:${req.body.book[0]};`
    console.log(url);
    let data = await superagent.get(url)
    console.log(data.body.items, 'data')
    data.body.items.forEach(element => {
        new Book(element.volumeInfo)
    })
    console.log('aaaaaa', c);
    res.render('pages/searches/show', { searchResults: c })

    // .then(data => {

    //     let x = data.body.items.forEach(element => {
    //         new Book(element.volumeInfo)
    //         console.log('aaaaaa', c);
    //     })
    //     console.log('cccccccccccc', c);
    //     // res.render('pages/searches/show', { searchResults: x })
    // })
    // .catch(error => res.send(error));
}

//constructor
function Book(data) {
    console.log('kkkk');
    this.title = data.title || 'No title';
    this.author = (data.authors) ?data.authors.join(',') : 'No author';
    this.description = data.description || 'No description';
    this.image = (data.imageLinks) ? data.imageLinks.smallThumbnail : 'https://i.imgur.com/J5LVHEL.jpg';
    c.push(this);
}

server.listen(PORT, () => {
    console.log(`Listening on PORT ${PORT}`)
})