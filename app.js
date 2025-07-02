const express = require('express');
const dotenv = require('dotenv');
const userRoutes = require('./backend/routes/userRoutes');
const cors=require('cors')
dotenv.config();



const app = express();

app.use(cors())
app.use(express.json()); 

app.use('/api/users', userRoutes);


app.get('/', (req, res) => {
  res.send(' API is running...');
});

module.exports = app;
