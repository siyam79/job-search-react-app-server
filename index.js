const express = require('express')
require("dotenv").config();
const app = express()
const cookieParser = require('cookie-parser')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000
const cors = require('cors')
const jwt = require("jsonwebtoken");



// middleware 
app.use(express.json());
app.use(cookieParser())
app.use(
    cors({
        origin: ["http://localhost:5173"],
        credentials: true,
    })
);




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



//  verify middleware
const logger = (req, res, next) => {
    console.log('log information', req.method, req.url);
    next()
}
const verify = (req, res, next) => {
    const token = req?.cookies?.token;
    console.log(token);
    if (!token) {
        return res.status(401).send({ message: 'Unauthorized Access' })

    }
    jwt.verify(token, process.env.VARIFY_TOKEN, (err, decoded) => {
        if (err) {
            return res.status(401).send({ message: 'Unauthorized Access' })
        }
        req.user = decoded;
        next()
    })

}




async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const jobCollection = client.db('job-search').collection('jobs')
        const bidJobsCollection = client.db('job-search').collection('bidJobs')

        //  Bid job add DATA MongoDB 
        app.post('/addBidJob', async (req, res) => {
            const job = req.body;
            // console.log(job)
            const result = await bidJobsCollection.insertOne(job);
            res.send(result)
        })


        //  jwt token varify
        app.post("/jwt", async (req, res) => {
            const user = req.body;
            console.log("user for token successfull", user);
            const token = jwt.sign(user, process.env.VARIFY_TOKEN, {
                expiresIn: "2h",
            });
            res
                .cookie("token", token, {
                    httpOnly: true,
                    secure: true,
                    sameSite: "none",
                })
                .send({ success: true });
        });

        app.post("/logout", async (req, res) => {
            const user = req.body;
            console.log("logged out", user);
            res.clearCookie("token", { maxAge: 0 }).send({ success: true });
        });




        //  Query kore specefic user get data 

        app.get('/bidJobs', logger, verify, async (req, res) => {
            console.log(req.query.email);
            console.log("cokies parcher", req.user);
            if ( req.user.email !== req.query.email) {
                return res.status(403).send({message:"forbidden access"})
                
            }
            let query = {}
            if (req.query?.email) {
                query = { email: req.query.email }
            }
            const result = await bidJobsCollection.find(query).toArray();
            res.send(result)
        })


        //  data base job data add 

        app.post('/addJob', async (req, res) => {
            const job = req.body;
            // console.log(job)
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


        //  email diya all job data query  and user data gate 

        app.get('/job', async (req, res) => {
            console.log(req.query.email);
           
            let query = {}
            if (req.query?.email) {
                query = { email: req.query.email }
            }
            const result = await jobCollection.find(query).toArray();
            res.send(result)
        })


        //  data update and put operation 

        app.get("/updateJob/:id", async (req, res) => {
            const id = req.params.id;
            const query = {
                _id: new ObjectId(id)
            };
            const result = await jobCollection.findOne(query)
            res.send(result)
        })

        app.put("/updateJob/:id", async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const option = { upsert: true };
            const updateJob = req.body;
            const update = {
                $set: {
                    title: updateJob.title,
                    deadline: updateJob.deadline,
                    minimumPrice: updateJob.minimumPrice,
                    maximumPrice: updateJob.maximumPrice,
                    description: updateJob.description,
                    category: updateJob.category,
                }
            }
            const result = await jobCollection.updateOne(filter, update, option)
            res.send(result)
        })


        //  delete option 
        app.delete('/deleteJob/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await jobCollection.deleteOne(query);
            res.send(result)
        })


        //  jwt token varify 







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