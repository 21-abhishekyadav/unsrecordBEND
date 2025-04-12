const mongoose =require("mongoose");
const { Schema } = mongoose;
const Postschema= new mongoose.Schema({
    User:{
        // this is foreign key to link note to a user
        // we will store user id here
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'

    },  
    Title:{
        type:String,    
    },
    Subheading:{
        type:String,    
    },
    Description:{
        type:String,    
    },
    Category:{
        type:String,    
    },
    Likes:{
        type: Number, default: 0
    },
    
})

const Post = mongoose.model('Post', Postschema);
module.exports = Post;
