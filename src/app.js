const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/sparing', require('./routes/sparing.route'));

module.exports = app;
