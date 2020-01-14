import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ControlsHelpComponent } from 'components/ControlsHelp/ControlsHelpComponent';
import { NotesContentEditorContainer } from 'components/NotesContentEditor/NotesContentEditorContainer';
import { NotesMindMapContainer } from 'components/NotesMindMap/NotesMindMapContainer';
import { SearchPanelContainer } from 'components/SearchPanel/SearchPanelContainer';

export class NotesPageComponent extends Component {

  constructor(props){
    super(props);
    this.state = {
      rootData: {}
    }
  }
  // Set root node for re-render
  setRoot(rootData){
    this.setState({ rootData:rootData })
      
  }

  render() {
    const { isHelpViewed, closeHelp } = this.props;

    return (
      <>
        <NotesMindMapContainer rootData={this.state.rootData}/>
        <NotesContentEditorContainer/>
        {!isHelpViewed && <ControlsHelpComponent onClose={closeHelp}/>}
        <SearchPanelContainer setRoot={(e)=>this.setRoot(e)}/>
      </>
    );
  }
}

NotesPageComponent.propTypes = {
  isHelpViewed: PropTypes.bool.isRequired,
  closeHelp: PropTypes.func.isRequired,
};
