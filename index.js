const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.j4q9n9w.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next) {
    console.log('token i vjwt', req.headers.authorization);
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send('unauthorized access');
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'forbidden access' })
        }
        req.decoded = decoded;
        next();
    })
}

async function run() {
    try {
        const productCategories = client.db('skypearl-it').collection('categories');
        const productsCollection = client.db('skypearl-it').collection('products');
        const usersCollection = client.db('skypearl-it').collection('users');
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
            const cursor = productsCollection.find
                (query);
            const products = await cursor.toArray();
            res.send(products)
        });

        app.post('/orders', async (req, res) => {
            const order = req.body;
            console.log(order);
            const result = await ordersCollection.insertOne(order);
            res.send(result);
        });

        app.get('/orders', verifyJWT, async (req, res) => {
            const email = req.query.email;
            const decodedEMail = req.decoded.email;

            if (email !== decodedEMail) {
                return res.status(403).send({ message: 'forbidden access' });
            }

            const query = { email: email };
            const orders = await ordersCollection.find(query).toArray();
            res.send(orders);
        });

        app.get('/jwt', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            if (user) {
                const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '36h' })
                return res.send({ accessToken: token });
            }
            res.status(403).send({ accessToken: '' })
        });

        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.send(result);
        });

        app.get('/users', async (req, res) => {
            const query = {};
            const users = await usersCollection.find(query).toArray();
            res.send(users);
        });

        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const user = await usersCollection.findOne(query);
            res.send({ isAdmin: user?.role === 'admin' });

        });


        app.get('/users/buyer/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email };
            const user = await usersCollection.findOne(query);
            res.send({ isBuyer: user?.role === 'buyer' });
        });


        app.get('/users/seller/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email };
            const user = await usersCollection.findOne(query);
            res.send({ isSeller: user?.role === 'seller' });
        });

        app.put('/users/admin/:id', verifyJWT, async (req, res) => {
            const decodedEMail = req.decoded.email;
            const filter = { email: decodedEMail };
            const user = await usersCollection.findOne(filter);

            if (user.role !== 'admin') {
                return res.status(403).send({ message: 'access forbidden' })
            }

            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    role: 'admin'
                }
            }
            const result = await usersCollection.updateOne(query, updatedDoc, options);
            res.send(result);
        });

        app.get('/categoriesId', async (req, res) => {
            const query = {}
            const result = await productCategories.find(query).project({ id: 1 }).toArray();
            res.send(result);
        });

        app.post('/products', async (req, res) => {
            const product = req.body;
            const result = await productsCollection.insertOne(product);
            res.send(result);
        });

        app.get('/myproducts', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const myProduct = await productsCollection.find(query).toArray();
            res.send(myProduct);
        });

        app.delete('/users/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const result = await usersCollection.deleteOne(filter);
            res.send(result);
        });


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