import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-awesome-modal';
import { StyledIcon, StyledInput, StyledSearchPanelWrapper } from 'components/SearchPanel/SearchPanelStyles';
import siteGlobalLoadingBar from 'ui/spinner/site-global-loading-bar'
import noteStorage from 'storage/noteStorage';
import googleDriveApi from 'api/google-drive-api';

let spinner = siteGlobalLoadingBar.create('google-drive-api');

export const SearchPanelComponent = props => {

  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  //-- we change functionality onchange to onclick
  // const debouncedCallback = debounce(props.onChange, props.onChangeDelay);
  const onChange = useCallback(({ target: { value } }) => {
    setQuery(value);
    //-- we change functionality onchange to onclick
    // debouncedCallback(value);
  }, [setQuery]);


  const [isModalVisible, setIsModalVisible] = useState( false );
  
  const openModal = () => {
    spinner.show();
    setIsModalVisible(true);
    googleDriveApi.findNotesByName(query).then(data => {
      const results = data.map((item, key) =>{
        if(item.parent.id != 'root'){
          return <li onClick={() => renderResult(item.parent)} key={item.id} > {item.parent.name} > {item.name}</li>;
        }
      });
      setSearchResults(results);
      spinner.hide();
    });
      
  };

  const closeModal = () => {
    setIsModalVisible(false);
  }


  const renderResult = (parent) => {
    localStorage.setItem('APP_FOLDER_NAME',parent.name);
    localStorage.setItem('folderId',parent.parents[0]); 
    setIsModalVisible(false);
    noteStorage.scanDrive().then(
      (data)=> {
        noteStorage.fetchChildNotes(data).then((withChildData)=>
          props.setRoot(data)  
        )        
      }
    );

    
  }
  return (
    <StyledSearchPanelWrapper>
      <StyledIcon />
      <StyledInput value={query} onChange={onChange}/>
      <input type="button" value="Open" onClick={() => openModal()} />
      <Modal  visible={isModalVisible} effect="fadeInUp" onClickAways={() => closeModal()}>
        <div>
          <h1>Search Results
          </h1>
          <a onClick={() => closeModal()}>Close</a>
          <ul>
            {searchResults}
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
