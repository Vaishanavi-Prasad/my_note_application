const express = require('express');
const router = express.Router();
const Note = require('../models/Notes');
const { body, validationResult } = require('express-validator');
const fetchuser = require('../middleware/fetchuser');


// ROUTE1: Get all the notes using GET: "/api/notes/fetchallnotes". login required
router.get('/fetchallnotes', fetchuser, async (req, res) => {
    try {
        const notes = await Note.find({ user: req.user.id });
        res.json(notes);
    } catch (error) {
        console.log(error.message);
        res.status(500).send("some error occured");
    }
})

// ROUTE2: Add a new note using POST: "/api/notes/addnote". login required
router.post('/addnote', fetchuser, [
    body('title', 'Enter a valid title').isLength({ min: 3 }),
    body('description', 'description must be atleast 5 characters').isLength({ min: 5 })
], async (req, res) => {

    const { title, description, tag } = req.body;
    // If there are errors, Return Bad request and the errors.
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const note = new Note({
            title, description, tag, user: req.user.id
        })
        const savednote = await note.save();

        res.json(savednote);
    } catch (error) {
        console.log(error.message);
        res.status(500).send("some error occured");
    }

})

// ROUTE3: Update an existing note using PUT: "/api/notes/updatenote". Login required
router.put('/updatenote/:id', fetchuser, async (req, res) => {
    const { title, description, tag } = req.body;
    try {
        //  Create a new note object
        const newNote = {};
        if (title) { newNote.title = title };
        if (description) { newNote.description = description };
        if (tag) { newNote.tag = tag };

        // Find the note to be updated and update it.
        let note = await Note.findById(req.params.id);
        if (!note) { return res.status(404).send("Not found") };

        if (note.user.toString() !== req.user.id) {
            return res.status(404).send("Not Allowed")
        };

        note = await Note.findByIdAndUpdate(req.params.id, { $set: newNote }, { note: true });
        res.json({ note });
    } catch (error) {
        console.log(error.message);
        res.status(500).send("some error occured");
    }

})

// ROUTE4: Delete an existing note using DELETE: "/api/notes/deletenote". Login required
router.delete('/deletenote/:id', fetchuser, async (req, res) => {
    try {
        // Find the note to be deleted and delete it.
        let note = await Note.findById(req.params.id);
        if (!note) { return res.status(404).send("Not found") };

        // Allow deletion only if the user owns the note
        if (note.user.toString() !== req.user.id) {
            return res.status(404).send("Not Allowed")
        };

        note = await Note.findByIdAndDelete(req.params.id);
        res.json({ "Success": "Note has been deleted", note: note });
    } catch (error) {
        console.log(error.message);
        res.status(500).send("some error occured");
    }
})


module.exports = router
