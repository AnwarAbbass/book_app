'use strict';

require('dotenv').config();
const express = require('express');
const superagent = require('superagent');
const pg = require('pg');
const client = new pg.Client({ connectionString: process.env.DATABASE_URL/*,ssl: process.env.LOCALLY ? false :{rejectUnauthorized: false}*/ });
const methodOverride = require('method-override');

// setupes
const PORT = process.env.PORT || 3030;
const server = express();

server.use(express.urlencoded({ extended: true }));
server.set('view engine', 'ejs');
server.use(express.static('./public'));
server.use(errorHandler);
server.use(methodOverride('_method'));

// routes
server.get('/', homeHandler);
// server.get('/hello', helloHandler);
server.get('/searches/new', newHandler);
server.post('/searches', booksHandler);
server.post('/books', addBook);
server.get('/books/:id', getOneBook);
server.put('/books/:id', updateData);
server.delete('/books/:id',deleteBook);

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
    console.log('in home')
    let SQL = 'SELECT * FROM books;';
    client.query(SQL)
        .then(result => {
            res.render('pages/index', { results: result.rows, count: result.rowCount });
        })
}

function helloHandler(req, res) {
    res.render('pages/index');
}

function newHandler(req, res) {
    console.log('in new')

    res.render('pages/searches/new')
}


function booksHandler(req, res) {

    console.log('in books')

    let url = `https://www.googleapis.com/books/v1/volumes?q=+${req.body.book[1]}:${req.body.book[0]}`
    console.log(url);
    superagent.get(url)
        .then(data => {
            let result = data.body.items.map(ele => new Book(ele.volumeInfo));
            res.render('pages/searches/show', { results: result })
        }).catch(error => res.send(error));
}

function addBook(req, res) {
    console.log('in addbok')

    let { author, title, isbn, image_url, descriptions } = req.body;
    // console.log('req.body',req.body)
    let SQL = `INSERT INTO books (author,title,isbn,image_url,descriptions) VALUES ($1,$2,$3,$4,$5) RETURNING *;`;
    let safeValues = [author, title, isbn, image_url, descriptions];
    client.query(SQL, safeValues)
        .then(result => {
            // console.log('result',result.rows);
            res.redirect(`/books/${result.rows[0].id}`);
        }).catch(err => console.log(err));
}

function getOneBook(req, res) {
    console.log('in getOneBook')

    let SQL = 'SELECT * FROM books WHERE id=$1;';
    let safeValue = [req.params.id]
    // console.log('gggg', req.params)
    client.query(SQL, safeValue)
        .then(result => {
            // console.log('aaaaaa', result.rows[0])
            res.render('pages/books/show', { results: result.rows[0]})
        }).catch(err => res.send(err));

}

function updateData(req,res){
    let { author, title, isbn, image_url, descriptions } = req.body;
    console.log(descriptions)
    let SQL = `UPDATE books SET author=$1,title=$2,isbn=$3,image_url=$4,descriptions=$5 WHERE id=$6;`;
    let safeValues = [author, title, isbn,image_url,descriptions,req.params.id];
    client.query(SQL,safeValues)
    .then(()=>{
      res.redirect(`/books/${req.params.id}`);
    })
}

function deleteBook(req,res) {
    let SQL = `DELETE FROM books WHERE id=$1;`;
    let value = [req.params.id];
    client.query(SQL,value)
    .then(res.redirect('/'))
  }


//constructor
function Book(data) {
    this.author = (data.authors) ? data.authors.join(',') : 'No author';
    this.title = data.title || 'No title';
    this.isbn = (data.industryIdentifiers && data.industryIdentifiers[0].identifier) ? data.industryIdentifiers[0].identifier : 'No ISBN';
    this.image_url = (data.imageLinks) ? data.imageLinks.smallThumbnail : 'https://i.imgur.com/J5LVHEL.jpg';
    this.description = (data.description) ? data.description : 'No description';

}

client.connect()
    .then(() => {
        server.listen(PORT, () => console.log(`Listening on PORT ${PORT}`));
    })