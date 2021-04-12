'use strict';

require('dotenv').config();
const express = require('express');
const superagent = require('superagent');

// setupes
const PORT = process.env.PORT || 3030;
const server=express();

server.use(express.urlencoded({ extended: true }));
server.set('view engine','ejs');
server.use(express.static('public/styles'));

// routes
server.get('/', homeHandler);
server.get('/hello', helloHandler);
server.get('/searches/new', newHandler);
server.post('/searches', booksHandler);

// unfound route
server.get('*', (req, res) => res.status(404).send('This route does not exist'));

// routes function
function homeHandler(req,res){
    res.render('pages/index');
}

function helloHandler(req,res){
    res.render('pages/index');
}

function newHandler(req,res){
    res.render('pages/searches/new')
}

function booksHandler(req,res){
    let url=`https://www.googleapis.com/books/v1/volumes?q=${req.body.book[0]}`
    // console.log(req.body.book);
    if(req.body.book[1] === 'title') url+=`+intitle:${req.body.book[1]};`
    if(req.body.book[1] === 'author') url+=`+inauthor:${req.body.book[1]};`
    // console.log(url);

    superagent.get(url)
    .then(data => {
        // console.log(data.body.items);
        let books = data.body.items.map(element => new Book(element.volumeInfo))
        // res.render('pages/searches/show', { searchResults: books });
        res.send(books);
    })
    .catch(error => res.send(error));
}


server.listen(PORT,()=>{
    console.log(`Listening on PORT ${PORT}`)
})

//constructor
function Book(data) {
    this.title = data.title || 'No title';
    this.author = data.authors.join(', ') || 'No author';
    this.description = data.description || 'No description';
    this.image = data.imageLinks.smallThumbnail || 'https://i.imgur.com/J5LVHEL.jpg';
  }