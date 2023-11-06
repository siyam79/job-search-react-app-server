const express = require('express')
const app = express()
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 5000
const cors = require('cors')


// middleware 
app.use(express.json());
app.use(cors())


const uri = "mongodb+srv://job-search:cXUGofrfq6RXCKWy@cluster0.29n9zox.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const jobCollection = client.db('job-search').collection('jobs')



        //  data base data add 

        app.post('/addJob', async (req, res) => {
            const job = req.body;
            console.log(job)
            const result = await jobCollection.insertOne(job);
            res.send(result)
        })

        //  add data get 
        app.get("/getJob", async (req, res) => {
            const cursor = jobCollection.find();
            const result = await cursor.toArray()
            res.send(result)
        })
    




        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);








app.get('/', (req, res) => {
    res.send('Hello World! job owner')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})