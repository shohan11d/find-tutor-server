const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
dotenv.config({ path: path.resolve(__dirname, ".env") });

const uri = process.env.MONGODB_URI;
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    const db = client.db("findTutorDB");
    const tutorsCollection = db.collection("tutors");

    app.get("/tutors", async (req, res) => {
      const tutors = await tutorsCollection.find().toArray();
      res.send(tutors);
    });

    app.post("/tutors", async (req, res) => {
      const tutor = req.body;
      const result = await tutorsCollection.insertOne(tutor);
      res.send(result);
    });

    app.get("/tutors/:id", async (req, res) => {
      const { id } = req.params;
      const tutor = await tutorsCollection.findOne({ _id: new ObjectId(id) });
      if (!tutor) return res.status(404).send({ error: "Tutor not found" });
      res.send(tutor);
    });
  } finally {
    // Ensures that the client will close when you finish/error
  }
}

run().catch(console.dir);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.get("/", (req, res) => {
  res.send("Hello, World!");
});
