import React, { useContext, useEffect, useRef, useState } from 'react'
import NoteContext from '../context/Notes/NoteContext';
import NotesItem from './NotesItem';
import AddNote from './AddNote';
import {useNavigate} from 'react-router-dom';

const Notes = (props) => {
  const {showAlert} = props;
  const context = useContext(NoteContext);

  const { notes, fetchNote, editNote} = context;
  const [note, setNote] = useState({ etitle: "", edescription: "", etag: "" })
  
  let navigate = useNavigate();
  useEffect(() => {
    if(localStorage.getItem('token')){
      fetchNote();
    }
    else{
      navigate("/login");
    }
       // eslint-disable-next-line
  }, [])

  const ref = useRef(null);
  const refClose = useRef(null);

  const updateNote = (currentnote) => {
    ref.current.click();
    setNote({ id:currentnote._id,etitle: currentnote.title, edescription: currentnote.description, etag: currentnote.tag });
  }

  const handleOnChange = (e) => {
    setNote({ ...note, [e.target.name]: e.target.value })
  }

  const handleclick = (e) => {
    e.preventDefault();
    console.log("updating note.." + note)
    editNote(note.id, note.etitle, note.edescription, note.etag)
    refClose.current.click();
    showAlert("Updated successfully", "success")
  }

  return (
    <>
      <AddNote showAlert={showAlert} />

      <button ref={ref} type="button" className="btn btn-primary d-none" data-bs-toggle="modal" data-bs-target="#exampleModal">
        Launch demo modal
      </button>

      <div className="modal fade" id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="exampleModalLabel">Edit Note</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <form className='my-3'>
                <div className="mb-3">
                  <label htmlFor="etitle" className="form-label">Title</label>
                  <input type="text" className="form-control" id="etitle" name="etitle" value={note.etitle} onChange={handleOnChange} minLength={5} required />
                </div>
                <div className="mb-3">
                  <label htmlFor="edescription" className="form-label">Description</label>
                  <input type="text" className="form-control" id="edescription" name="edescription" value={note.edescription} onChange={handleOnChange} minLength={5} required />
                </div>
                <div className="mb-3">
                  <label htmlFor="etag" className="form-label">Tag</label>
                  <input type="text" className="form-control" id="etag" name="etag" value={note.etag} onChange={handleOnChange} />
                </div>

              </form>
            </div>
            <div className="modal-footer">
              <button ref={refClose} type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              <button disabled={note.etitle.length<5 || note.edescription.length<5} onClick={handleclick} type="button" className="btn btn-primary">Update Note</button>
            </div>
          </div>
        </div>
      </div>
      <div className='row my-3'>
        <h2>Your Notes</h2>
        <div className="container mx-2">
          {notes.length===0 && "No notes available"}
        </div>
        {notes.map((note) => {
          return <NotesItem key={note._id} updateNote={updateNote} note={note} showAlert={showAlert}/>
        })}
      </div>
    </>
  )
}

export default Notes
