const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

     // Check if both username and password are provided
     if (username && password) {
        // Check if the user does not already exist
        if (!isValid(username)) {
            // Add the new user to the users array
            users.push({"username": username, "password": password});
            return res.status(200).json({message: "User successfully registered. Now you can login"});
        } else {
            return res.status(404).json({message: "User already exists!"});
        }
    }
    // Return error if username or password is missing
    return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
    return res.status(300).json({ books: books });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {

    const isbn = req.params.isbn;

    let filtered_book = books[isbn]


    return res.status(300).json({ book: filtered_book });
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {

    const author = req.params.author;
    const results = [];

    for (const id in books) {
        if (books[id].author == author) {
            results.push(books[id]);
        }
    }

    return res.status(300).json(results);
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title;

    const results = [];

    for (const id in books) {
        if (books[id].title == title) {
            results.push(books[id]);
        }
    }

    return res.status(300).json(results);
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {

    const isbn = req.params.isbn
    const review = [];

    for (const id in books) {
        if (books[id].isbn === isbn) {
            review.push(books[id].reviews);
        }
    }

    return res.status(300).json(review);
});

module.exports.general = public_users;
