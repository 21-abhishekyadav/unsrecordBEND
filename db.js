const mongoose= require('mongoose');
const mongoURI= "mongodb+srv://21abhishek-ay:WoqX1Ol4GEF67ame@clusterl-one.uefu8nl.mongodb.net/?retryWrites=true&w=majority&appName=ClusterL-one"

const connectToMongo=async()=>{
    await mongoose.connect(mongoURI)  
    console.log("connection successful");
}

module.exports=connectToMongo;