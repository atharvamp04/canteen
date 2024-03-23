const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.set('view engine', 'ejs');

const products = [
    { id: 1, name: "Sandwich", price: 5.0 },
    { id: 2, name: "Coffee", price: 2.5 },
    // Add more products as needed
];

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/tokenDB', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

// Define schema and model for token
const tokenSchema = new mongoose.Schema({
    number: {
        type: Number,
        required: true // Ensure that the number is required
    }
});

const Token = mongoose.model('Token', tokenSchema);

// Socket.IO connection
io.on('connection', (socket) => {
    console.log('A client connected');

    // Send token numbers to client
    Token.find().sort({ _id: -1 }).limit(10).then(tokens => {
        socket.emit('initialTokens', tokens.map(token => token.number));
    });

    // Listen for changes in MongoDB and broadcast updates to clients
    db.once('open', () => {
        const tokenChangeStream = Token.watch();
        tokenChangeStream.on('change', (change) => {
            Token.find().sort({ _id: -1 }).limit(10).then(tokens => {
                io.emit('tokenUpdate', tokens.map(token => token.number));
            });
        });
    });
});

// Route for generating a new token
app.post('/generateToken', (req, res) => {
    // Generate a new token number
    const newTokenNumber = generateTokenNumber();

    // Create a new Token document with the generated token number
    const newToken = new Token({ number: newTokenNumber });

    // Save the new Token document to the database
    newToken.save()
        .then(savedToken => {
            console.log('Token saved:', savedToken);
            // Emit the token number to all clients
            io.emit('newToken', savedToken.number);
            res.status(201).json(savedToken);
        })
        .catch(error => {
            console.error('Error saving token:', error);
            res.status(500).json({ error: 'Internal server error' });
        });
});
// Function to generate a new token number (customize as needed)
function generateTokenNumber() {
    // Generate token number logic here
    return Math.floor(Math.random() * 1000);
}

// Route for serving the index page
app.get('/index', (req, res) => {
    // Render the index.ejs file with products data
    res.render('index.ejs', { products: products });
});

// Route for displaying order details
// Route for displaying order details
app.get('/orderDetails/:tokenNumber', (req, res) => {
    const tokenNumber = req.params.tokenNumber;

    // Fetch the token details from the database based on the token number
    Token.findOne({ number: tokenNumber })
        .then(token => {
            if (!token) {
                // If the token is not found, handle the error
                return res.status(404).send('Token not found');
            }

            // Render the orderdetails.ejs file with the token details
            res.render('orderDetails', { token: token });
        })
        .catch(error => {
            // If an error occurs while fetching the token, handle the error
            console.error('Error fetching token:', error);
            res.status(500).send('Internal server error');
        });
});


// Route for displaying order details
// Route for displaying order details
app.get('/orderDetails', (req, res) => {
    const tokenNumber = req.query.tokenNumber;

    // Render the orderdetails.ejs file with the token number
    res.render('orderdetails', { tokenNumber: tokenNumber });
});



// Start the server
server.listen(3000, () => {
    console.log(`Server is running on port 3000`);
});
