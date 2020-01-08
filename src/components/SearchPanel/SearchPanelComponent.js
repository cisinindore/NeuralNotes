import React, { useCallback, useState } from 'react';
import { put, call, takeEvery } from 'redux-saga/dist/redux-saga-effects-npm-proxy.cjs';
import PropTypes from 'prop-types';
import { debounce } from 'underscore';
import VisGraph from 'react-graph-vis';

import Modal from 'react-awesome-modal';
import { StyledIcon, StyledInput, StyledSearchPanelWrapper } from 'components/SearchPanel/SearchPanelStyles';
import siteGlobalLoadingBar from 'ui/spinner/site-global-loading-bar'
import noteStorage from 'storage/noteStorage';
import googleDriveApi from 'api/google-drive-api';

import { loadApp } from '../App/AppSagas';
import { NotesMindMapComponent } from '../NotesMindMap/NotesMindMapComponent';

let spinner = siteGlobalLoadingBar.create('google-drive-api');

export const SearchPanelComponent = props => {

  const [query, setQuery] = useState('');
  const [seachFiles, setSeachFiles] = useState([]);
  // const debouncedCallback = debounce(props.onChange, props.onChangeDelay);
  const onChange = useCallback(({ target: { value } }) => {
    setQuery(value);
    // debouncedCallback(value);
  }, [setQuery]);


  const [visible, handleModal] = useState( false );

  
  const openModal = () => {
    spinner.show();
    handleModal(true);
    googleDriveApi.findNotesByName(query).then(data => {
      const Files = data.map((item, key) =>
        <li onClick={() => renderResult(item.parent)} key={item.id} > {item.parent.name} > {item.name}</li>
      );
      setSeachFiles(Files);
      spinner.hide();
    });
      
  };

  const closeModal = () => {
    handleModal(false);
  }


  const renderResult = (parent) => {
    localStorage.setItem('APP_FOLDER_NAME',parent.name);
    localStorage.setItem('folderId',parent.parents[0]); 
    handleModal(false);
    noteStorage.scanDrive().then(
      (data)=> {
        noteStorage.fetchChildNotes(data).then((withChildData)=>
          props.newRoot(data)  
        )        
      }
    );

    
  }
  return (
    <StyledSearchPanelWrapper>
      <StyledIcon />
      <StyledInput value={query} onChange={onChange}/>
      <input type="button" value="Open" onClick={() => openModal()} />
      <Modal  visible={visible} effect="fadeInUp" onClickAways={() => closeModal()}>
        <div>
          <h1>Search Files
          </h1>
          <a onClick={() => closeModal()}>Close</a>
          <ul>
            {seachFiles}
          </ul>
        </div>
      </Modal>
    </StyledSearchPanelWrapper>
  )
};

SearchPanelComponent.propTypes = {
  onChange: PropTypes.func.isRequired,
  onChangeDelay: PropTypes.number,
};

SearchPanelComponent.defaultProps = {
  onChangeDelay: 1000,
};
