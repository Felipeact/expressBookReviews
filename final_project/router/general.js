const express = require('express');
const axios = require("axios");

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

    try {
        const response = await axios.get("http://localhost:8800/");

        return res.status(200).json(response.data);

    } catch (error) {
        return res.status(500).json({
            message: "Error retrieving books"
        });
    }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
    
    const isbn = req.params.isbn;

    try {
        
        const response = await axios.get(`http://localhost:8800/isbn/${isbn}`)

        return res.status(300).json({ book: response });
    } catch (error) {
        return res.status(404).json({message: "Book not found"});
    }




});

// Get book details based on author
public_users.get('/author/:author', async function (req, res) {

    const author = req.params.author;
    
    try {
        
        const response = await axios.get(`http://localhost:8800/books`)
        const results = [];

        for (const id in response.data) {
            if (response.data[id].author == author) {
                results.push(response.data[id]);
            }
        }
    
        return res.status(300).json(results);
    } catch (error) {
        return res.status(404).json({message: "Author not found"});
    }

    
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {

    const title = req.params.title;

    try {
        const response = await axios.get("http://localhost:8800/books");

        const results = [];

        for (const id in response.data) {
            if (response.data[id].title === title) {
                results.push(response.data[id]);
            }
        }

        return res.status(200).json(results);

    } catch (error) {
        return res.status(404).json({
            message: "Books not found"
        });
    }
});


// Get book review
public_users.get('/review/:isbn', async function (req, res) {

    const isbn = req.params.isbn;

    try {
        const response = await axios.get("http://localhost:8800/books");

        if (!response.data[isbn]) {
            return res.status(404).json({
                message: "Book not found"
            });
        }

        return res.status(200).json(
            response.data[isbn].reviews
        );

    } catch (error) {
        return res.status(500).json({
            message: "Error retrieving books"
        });
    }
});

module.exports.general = public_users;
