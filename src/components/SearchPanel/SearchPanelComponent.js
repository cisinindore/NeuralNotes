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

    
    googleDriveApi.findNotesByName(query).then(searchFolders => {

      const searchResult = searchFolders.map((item, key) =>{
        return <li onClick={() => renderResult(item.parents[0])} key={item.id} > { key+1 }. {item.name}</li>;
      });
      setSearchResults(searchResult);
      spinner.hide();
    });
      
  };

  const closeModal = () => {
    setIsModalVisible(false);
  }


  const renderResult = (parentId) => {
    
    noteStorage.getFolderById(parentId).then(parent => {
      localStorage.setItem('parentFolderName',parent.name);
      localStorage.setItem('parentParentId',parent.parents[0]); 
      setIsModalVisible(false);
      noteStorage.scanDrive().then(  
        (data)=> {
            noteStorage.fetchChildNotes(data).then(()=>
              props.setRoot(data)  
            )
          }
        );
      });
  }
  return (
    <StyledSearchPanelWrapper>
      <StyledIcon />
      <StyledInput value={query} onChange={onChange}/>
      <input type="button" value="search" onClick={() => openModal()} />
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
