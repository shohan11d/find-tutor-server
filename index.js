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
app.use(express.json());

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // await client.connect();

    const db = client.db("findTutorDB");
    const tutorsCollection = db.collection("tutors");
    const bookingsCollection = db.collection("bookings");
    const apiRouter = express.Router();

    apiRouter.get("/tutors", async (req, res) => {
      const tutors = await tutorsCollection.find().toArray();
      res.send({ data: tutors });
    });

    apiRouter.post("/tutors", async (req, res) => {
      const tutor = req.body;
      const result = await tutorsCollection.insertOne(tutor);
      res.send({ message: "Tutor created", result });
    });

    apiRouter.delete("/tutors/:id", async (req, res) => {
      const { id } = req.params;
      const result = await tutorsCollection.deleteOne({
        _id: new ObjectId(id),
      });
      if (result.deletedCount === 0)
        return res.status(404).send({ error: "Tutor not found" });
      res.send({ message: "Tutor deleted" });
    });

    apiRouter.post("/bookings", async (req, res) => {
      const booking = req.body;
      const result = await bookingsCollection.insertOne(booking);
      res.send({ message: "Booking created", result });
    });

    apiRouter.get("/tutors/:id", async (req, res) => {
      const { id } = req.params;
      const tutor = await tutorsCollection.findOne({ _id: new ObjectId(id) });
      if (!tutor) return res.status(404).send({ error: "Tutor not found" });
      res.send({ data: tutor });
    });

    apiRouter.get("/bookings", async (req, res) => {
      const bookings = await bookingsCollection.find().toArray();
      res.send({ data: bookings });
    });

    apiRouter.put("/tutors/:id", async (req, res) => {
      const { id } = req.params;
      const updatedTutor = req.body;
      const result = await tutorsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updatedTutor },
      );
      if (result.matchedCount === 0)
        return res.status(404).send({ error: "Tutor not found" });
      res.send({ message: "Tutor updated", result });
    });

    apiRouter.patch("/bookings/:id", async (req, res) => {
      const { id } = req.params;
      const updatedFields = req.body;
      const result = await bookingsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updatedFields },
      );
      if (result.matchedCount === 0)
        return res.status(404).send({ error: "Booking not found" });
      res.send({ message: "Booking updated", result });
    });

    app.use("/api", apiRouter);
  } finally {
    // Ensures that the client will close when you finish/error
  }
}

run().catch(console.dir);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

module.exports = app;
