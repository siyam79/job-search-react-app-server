const express = require('express')
require("dotenv").config();
const app = express()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000
const cors = require('cors')

// middleware 
app.use(express.json());
app.use(cors())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.29n9zox.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);

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
        const bidJobsCollection = client.db('job-search').collection('bidJobs')


        //  Bid job add DATA MongoDB 
        app.post('/addBidJob', async (req, res) => {
            const job = req.body;
            console.log(job)
            const result = await bidJobsCollection.insertOne(job);
            res.send(result)
        })

        //  Query kore specefic user get data 

        app.get('/bidJobs',async(req, res )=>{
            console.log(req.query.email);
            let query ={}
        if(req.query?.email){
            query = {email: req.query.email}

        }


            const result = await bidJobsCollection.find(query).toArray();
            res.send(result)
        })


        //  data base job data add 

        app.post('/addJob', async (req, res) => {
            const job = req.body;
            console.log(job)
            const result = await jobCollection.insertOne(job);
            res.send(result)
        })

        // all job add data get 
        app.get("/getJob", async (req, res) => {
            const cursor = jobCollection.find();
            const result = await cursor.toArray()
            res.send(result)
        })
    

        //  single data gate 

        app.get("/job/:id", async (req, res) => {
            const id = req.params.id;
            // console.log(id);
            const quaery = {
                _id: new ObjectId(id),
            };
            const result = await jobCollection.findOne(quaery)
            res.send(result)
        })



        // app.get("/job/:id", async (req, res) => {
        //     const id = req.params.id;
        //     console.log(id);
        //     const quaery = {
        //         _id: new ObjectId(id),
        //     };
        //     const result = await jobCollection.findOne(quaery)
        //     res.send(result)
        // })









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
    res.send('Hello World! job owner Your well Come ')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})