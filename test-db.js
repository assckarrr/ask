const { MongoClient } = require("mongodb");

const uri = "mongodb+srv://<username>:<password>@cluster0.mongodb.net/sample_mflix";

async function run() {
    try {
        const client = new MongoClient(uri);
        await client.connect();
        console.log("✅ Successfully connected to MongoDB Atlas!");
        await client.close();
    } catch (error) {
        console.error("❌ Connection failed:", error.message);
    }
}

run();

