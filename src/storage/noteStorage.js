import noteStorageApi from 'storage/noteStorageAPI';
import { addChildrenToTree, findNoteById, setRoot, deleteNode, getNotes, logTree, getRoot } from 'storage/noteTree';

'use strict';

const notesTree = {};

// TODO: Better to avoid using export default
export default {
  scanDrive,

  // notes tree
  findNoteById,
  getNotes,
  logTree,
  getRoot,
  addChildrenToTree,

  // api:
  APP_FOLDER_NAME: noteStorageApi.APP_FOLDER_NAME,
  fetchParentNote,
  fetchChildNotes,
  getNoteContent: noteStorageApi.getNoteContent,
  create,
  update: noteStorageApi.update,
  remove,
  move, 
  updateNoteName,
  getLinkToNote,
  fetchNoteById
};

function fetchChildNotes(note) {
  return noteStorageApi.fetchChildNotes(note)
    .then(function (children) {
      addChildrenToTree({
        parentId: note.id,
        children: children
      });

      return children;
    });
}

function fetchNoteById(noteId) {
  return noteStorageApi.fetchNoteById(noteId)
    .then(function (data) {
      return data;
    });
}

function fetchParentNote(noteId) {
  return noteStorageApi.fetchParentNote(noteId)
    .then(function (parentNote) {
      const note = findNoteById(noteId);
      if (note) { // root folder has no parent
        note.parent = parentNote;
      }
      return note;
    });
}

function scanDrive() {
  console.debug('noteStorage.scanDrive()');
  return noteStorageApi.scanDrive()
    .then(function (appRootFolder) {
      setRoot(appRootFolder);
      console.info('Note tree root set to the App root folder on Google Drive');
      console.debug('noteStorage.scanDrive(), stored notesTree: ', notesTree);
      return appRootFolder;
    });
}

function create(note, parentNote) {
  console.info('Creating a new note: ', note.name);
  return noteStorageApi.create(note, parentNote).then(function (createdNote) {
    console.info('Created new note: ', note.name);
    return createdNote;
  });

}

function updateNoteName({ note, newName }) {
  return Promise.all([
    noteStorageApi.updateFileName({ id: note.id, name: newName }),
    noteStorageApi.updateNoteContentFileName({ note, newName }),
  ])
    .then(function (responses) {
      console.log('resonses for note name update: ', responses);
      const newNote = { ...note };
      newNote.name = newName;
      return newNote;
    });
}

function remove(note) {
  return noteStorageApi
    .remove(note)
    .then(result => {
      deleteNode(note);
      return result;
    });
}

function move({ noteId, newParentId }) {
  return new Promise((resolve, reject) => {
    noteStorageApi
    .move(noteId, newParentId)
    .then(() => {
      resolve();
    })
    .catch((error) => {
      reject(error);
    });
  })
}

function getLinkToNote({ id }) {
  return 'https://drive.google.com/open?id=' + id;
}
