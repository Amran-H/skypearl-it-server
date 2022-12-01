const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.j4q9n9w.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const productCategories = client.db('skypearl-it').collection('categories');
        const product = client.db('skypearl-it').collection('products');
        const userCollection = client.db('skypearl-it').collection('users');
        const ordersCollection = client.db('skypearl-it').collection('orders');

        app.get('/product-categories', async (req, res) => {
            const query = {}
            const cursor = productCategories.find(query);
            const categories = await cursor.toArray();
            res.send(categories);
        });

        app.get('/category/:id', async (req, res) => {
            const id = req.params.id;
            const query = { category_id: (id) }
            const cursor = product.find
                (query);
            const products = await cursor.toArray();
            res.send(products)
        });

        app.post('/orders', async (req, res) => {
            const order = req.body;
            console.log(order);
            const result = await ordersCollection.insertOne(order);
            res.send(result);
        })

    }
    finally {

    }
}

run().catch(e => console.error(e));


app.get('/', async (req, res) => {
    res.send('It product API running');
});

app.listen(port, () => {
    console.log('IT server is running on', port);
})