const express = require('express');
const app = express();
const port = process.env.PORT || 5000;




app.get('/', async (req, res) => {
    res.send('It product API running');
});

app.listen(port, () => {
    console.log('IT server is running on', port);
})