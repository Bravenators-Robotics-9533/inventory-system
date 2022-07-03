const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')

// Require Dotenv if not in production
if(process.env.NODE_ENV !== 'production') 
    require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

// Heartbeat
if(process.env.NODE_ENV !== 'production') {
    app.get('/heartbeat', (req, res) => {
        res.send("Bump, Bump");
    });
}

// Get Routes
const UserRoutes = require('./routes/User.Routes');

// Bind Routes
app.use('/api/users', UserRoutes);

const uri = process.env.ATLAS_URI;
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const connection = mongoose.connection;
connection.once('open', () => {
    console.log("MongoDB database connection established successfully!");
});

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});