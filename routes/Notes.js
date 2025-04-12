const express = require("express");
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Notes = require("../models/Notes");
const fetchuser = require("../middleware/fetchuser");

// route 1 to add a new note of a user
router.post("/addnote", fetchuser,
    [
        body('Title', 'title cannot be blank').notEmpty(),
        body('Description').isLength({ min: 5 }),
    ], async (req, res) => {

        
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const note = new Notes({
            User: await req.user.id,
            Title: req.body.Title,
            Description: req.body.Description,
            Posted : req.body.Posted,
        });
        try {
            const Notes = await note.save();
            res.json({ Notes });
        }
        catch (err) {
            res.status(400).send("please enter valid email");
        }
    });

// route 2 get all notes of a user
router.get("/fetchnotes", fetchuser, async (req, res) => {

    const notes = await Notes.find({ User: req.user.id });
    res.json(notes);

});

// route 3 update an existing note using put request 
// id of note which need to be updated needs to passed in the url
router.put("/updatenotes/:id", fetchuser, [
    body('Title', 'title cannot be blank').notEmpty(),
    body('Description').isLength({ min: 5 }),
], async (req, res) => {



    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    // to verify note needs to be updated exist or not
    var note = await Notes.findById(req.params.id);
    if (!note) { return res.status(404).send("NOT FOUND") };

    // if note exist check if user is author of note (authentication for updation)

    const b=  await req.user.id;
    if (note.User.toString() !== b) { return res.status(401).send("NOT ALLOWED") };

    const { Title, Description } = req.body;
    var newNote = {};
    if (Title) { newNote.Title = Title };
    if (Description) { newNote.Description = Description };

    note = await Notes.findByIdAndUpdate(req.params.id,{$set : newNote},{new:true});
    res.json(note);

});

// route 4 delete an existing note using delete request 
// id of note which need to be deleted needs to passed in the url
router.delete("/deletenote/:id", fetchuser, async (req, res) => {



    // to verify note needs to be deleted exist or not
    var note = await Notes.findById(req.params.id);
    if (!note) { return res.status(404).send("NOT FOUND") };

    // if note exist check if user is author of note (authentication for deletion)
    const b=  await req.user.id;
    if (note.User.toString() !== b) { return res.status(401).send("NOT ALLOWED") };

    note = await Notes.findByIdAndDelete(req.params.id);
    res.json("note is deleted successfully");

});

module.exports = router;