const mongoose = require('mongoose');

const connectToMongo = async () => {
    await mongoose.connect(process.env.MONGO_URI)
    console.log("connection successful");
}

module.exports = connectToMongo;