const mongoose =require("mongoose");
const { Schema } = mongoose;
const Noteschema= new mongoose.Schema({
    User:{
        // this is foreign key to link note to a user
        // we will store user id here
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'

    },
    Title:{
        type:String,
        required:true
    },
    Description:{
        type:String,
        required:true,

    },
    Posted:{
        type:String,
    }
})

const Notes = mongoose.model('Notes', Noteschema);
module.exports = Notes;
