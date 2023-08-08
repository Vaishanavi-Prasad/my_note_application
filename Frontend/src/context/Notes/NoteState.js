import { useState } from "react";
import NoteContext from "./NoteContext";

const NoteState = (props) => {
    const host = "http://localhost:5000"
    const notesInitial = []
    const [notes, setNotes] = useState(notesInitial);

    // Fetching all the notes
    const fetchNote = async () => {
        // API CALL
        const response = await fetch(`${host}/api/notes/fetchallnotes`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "auth-token": localStorage.getItem('token'),
            },
        });
        const json = await response.json();
        setNotes(json);
    }

    // Adding a note
    const addNote = async (title, description, tag) => {
        //API CALL
        const response = await fetch(`${host}/api/notes/addnote`, {
            method: "POST",
            headers: {
                "Accept":"application/json",
                "Content-Type": "application/json",
                "auth-token": localStorage.getItem('token'),
            },
            body: JSON.stringify({ title, description, tag }),
        });
        const json = await response.json();
        setNotes(notes.concat(json))
    }

    // Editing a note
    const editNote = async (id, title, description, tag) => {
        //API CALL
        const response = await fetch(`${host}/api/notes/updatenote/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "auth-token": localStorage.getItem('token'),
            },
            body: JSON.stringify({title, description, tag}),
        });
        const json = await response.json();
        console.log(json);

        // Logic to edit in client
        // for (let i = 0; i < notes.length; i++) {
        //     const element = notes[i];
        //     if (element._id === id) {
        //         notes[i].title = title;
        //         notes[i].description = description;
        //         notes[i].tag = tag;
        //     }
        //     break;
        // }
        // setNotes(notes);
        fetchNote();
    }

    // Deleting a note
    const deleteNote = async (id) => {
        //API CALL
        const response = await fetch(`${host}/api/notes/deletenote/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "auth-token": localStorage.getItem('token'),
            },
        });
        const json = await response.json();
        console.log(json);

        const newNote = notes.filter((note) => { return note._id !== id })
        setNotes(newNote)
    }

    return (
        <NoteContext.Provider value={{ notes, addNote, editNote, deleteNote, fetchNote }}>
            {props.children}
        </NoteContext.Provider>
    )
}

export default NoteState