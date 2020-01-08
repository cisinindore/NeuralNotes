import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { put, call, takeEvery } from 'redux-saga/dist/redux-saga-effects-npm-proxy.cjs';

import { ControlsHelpComponent } from 'components/ControlsHelp/ControlsHelpComponent';
import { NotesContentEditorContainer } from 'components/NotesContentEditor/NotesContentEditorContainer';
import { NotesMindMapContainer } from 'components/NotesMindMap/NotesMindMapContainer';
import { SearchPanelContainer } from 'components/SearchPanel/SearchPanelContainer';
import noteStorage from 'storage/noteStorage';

import {
  rootNoteFoundAction,
  CHANGE_PAGE_ACTION
} from 'components/App/AppActions';
export function setPageAction(data) {
  return put({ type: CHANGE_PAGE_ACTION, data });
}


export class NotesPageComponent extends Component {

  constructor(props){
    super(props);
    this.state = {
      rootData: 0
    }
  }

  newRoot(rootData){
    this.setState({rootData:rootData})
      
  }

  render() {
    const { isHelpViewed, closeHelp } = this.props;

    return (
      <>
        <NotesMindMapContainer rootData={this.state.rootData}/>
        <NotesContentEditorContainer/>
        {!isHelpViewed && <ControlsHelpComponent onClose={closeHelp}/>}
        <SearchPanelContainer newRoot={(e)=>this.newRoot(e)}/>
      </>
    );
  }
}

NotesPageComponent.propTypes = {
  isHelpViewed: PropTypes.bool.isRequired,
  closeHelp: PropTypes.func.isRequired,
};
