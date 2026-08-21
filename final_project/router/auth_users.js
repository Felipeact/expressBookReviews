const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => { //returns boolean
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    // Return true if any user with the same username is found, otherwise false
    if (userswithsamename.length > 0) {
        return true;
    } else {
        return false;
    }
}

const authenticatedUser = (username, password) => { 
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    // Return true if any valid user is found, otherwise false
    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    }
}
    

//only registered users can login
regd_users.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if ( !username || !password)
    {
        return res.status(404).json({message: "Error logged in"})
    }

    if( authenticatedUser(username, password))
    {
        // GeNERATE TOKEN 
        let accessToken = jwt.sign({
            data: password,  
        }, "access", {expiresIn: 60 * 60})

        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {

    const token = req.session.authorization['accessToken'];
    const isbn = req.params.isbn;
    const review = req.query.review;

    // Verify JWT token
    jwt.verify(token, "access", (err, user) => {

        if (err) {
            return res.status(403).json({
                message: "User not authenticated"
            });
        }

        // Check if book exists
        if (!books[isbn]) {
            return res.status(404).json({
                message: "Book not found"
            });
        }

        // Check if review was provided
        if (!review) {
            return res.status(400).json({
                message: "Review is required"
            });
        }

        const username = user.username;

        // Add or modify review
        books[isbn].reviews[username] = review;

        return res.status(200).json({
            message: "Review added/modified successfully",
            review: books[isbn].reviews
        });
    });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {

    const token = req.session.authorization['accessToken'];
    const isbn = req.params.isbn;

    jwt.verify(token, "access", (err, user) => {

        if (err) {
            return res.status(403).json({
                message: "User not authenticated"
            });
        }

        if (!books[isbn]) {
            return res.status(404).json({
                message: "Book not found"
            });
        }

        const username = user.username;

        if (!books[isbn].reviews[username]) {
            return res.status(404).json({
                message: "Review not found"
            });
        }

        delete books[isbn].reviews[username];

        return res.status(200).json({
            message: "Review deleted successfully"
        });
    });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
