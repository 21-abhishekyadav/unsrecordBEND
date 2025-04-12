const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const Notes = require("../models/Notes");
const User = require("../models/User");


const { body, validationResult } = require('express-validator');
const fetchuser = require("../middleware/fetchuser");

// Fetch posts based on category and limit
async function fetchPosts(page = 1, limit = 4, category = null) {
    try {
        const skip = (page - 1) * limit;
        let query = category ? { Category: category } : {}; // Filter by category if provided

        return await Post.find(query).skip(skip).limit(limit);
    } catch (error) {
        console.error("Error fetching posts:", error);
        throw error;
    }
}

// Route to get posts with optional category filtering
router.get("/", async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 2;
    const category = req.query.category || null; // Category passed in the query

    try {
        const posts = await fetchPosts(page, limit, category);
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});



//get user details 
router.post('/getuser/:id',async (req, res) => {
    try {

        // var post = await Post.findById(req.params.id);
        // if (!post) { return res.status(404).send("NOT FOUND") };
        const userId = req.params.id
         var user = await User.findById(userId).select("-password");
        res.send(user);
    }
    catch (err) {
        console.error(err.message);
        res.status(500).json({error: "Internal server error occured"});
    }

});


// route to add a post 
router.post("/newpost", fetchuser,
    [
        body('Title', 'title cannot be blank').notEmpty(),
        body('Description').isLength({ min: 5 }),
        body('Subheading').notEmpty(),
        body('Category').notEmpty(),


    ], async (req, res) => {

        
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const post = new Post({
            User: await req.user.id,
            Title: req.body.Title,
            Subheading: req.body.Subheading,
            Description: req.body.Description,
            Category: req.body.Category,

        });
        try {
            const Posts = await post.save();
            res.json({ Posts });
        }
        catch (err) {
            res.status(400).send(err);
        }
    });




// route to post a note 
router.post("/postnote/:id", fetchuser, async (req, res) => {


    // to verify note needs to be updated exist or not
    var note = await Notes.findById(req.params.id);
    if (!note) { return res.status(404).send("NOT FOUND") };

    // if note exist check if user is author of note (authentication for updation)

    const b=  await req.user.id;
    if (note.User.toString() !== b) { return res.status(401).send("NOT ALLOWED") };

    
    const post = new Post({
        User: await req.user.id,
        Title: note.Title,
        Subheading: req.body.Subheading,
        Description: note.Description,
    });
    try {
        const Posts = await post.save();
        res.json({ Posts });
    }
    catch (err) {
        res.status(400).send(err);
    }

});

// route to delete a post 
router.delete("/deletepost/:id", fetchuser, async (req, res) => {

    // to verify note needs to be deleted exist or not
    var post = await Post.findById(req.params.id);
    if (!post) { return res.status(404).send("NOT FOUND") };

    // if note exist check if user is author of note (authentication for deletion)
    const b=  await req.user.id;
    if (post.User.toString() !== b) { return res.status(401).send("NOT ALLOWED") };

    post = await Post.findByIdAndDelete(req.params.id);
    res.json("post is deleted successfully");

});

// route to like a post
router.put("/addlike/:id", async (req, res) => {

    // to verify post needs to be updated exist or not
    var post = await Post.findById(req.params.id);
    if (!post) { return res.status(404).send("NOT FOUND") };

    post.Likes += 1;
    try {
        const Posts = await post.save();
        res.json({ Posts });
    }
    catch (err) {
        res.status(400).send(err);
    }

});

// route to dislike a post
router.put("/removelike/:id", async (req, res) => {

    // to verify post needs to be updated exist or not
    var post = await Post.findById(req.params.id);
    if (!post) { return res.status(404).send("NOT FOUND") };

    post.Likes -= 1;
    try {
        const Posts = await post.save();
        res.json({ Posts });
    }
    catch (err) {
        res.status(400).send(err);
    }

});

// temp route
router.get("/ping", (req, res) => {
  res.send("pong");
});


module.exports = router;
