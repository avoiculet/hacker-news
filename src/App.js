import React from "react";
import axios from 'axios';
import styles from './App.module.css'
import styled from 'styled-components';

const StyledContainer = styled.div`
    height: 100vw;
    padding: 20px;
    background: #83a4d4;
    background: linear-gradient(to left, #b6fbff, #83a4d4);
    color: #171212;
    `;
const StyledHeadlinePrimary = styled.h1`
    font-size: 48px;
    font-weight: 300;
    letter-spacing: 2px;
    `;
const StyledItem = styled.div`
    display: flex;
    align-items: center;
    padding-bottom: 5px;
`;
const StyledColumn = styled.span`
    padding: 0 5px;
    white-space: nowrap;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    
    a {
        color: inherit;
    }
    width: ${props => props.width};
`;
const StyledButton = styled.button`
    background: transparent;
    border: 1px solid #171212;
    padding: 5px;
    cursor: pointer;
    
    transition: all 0.1s ease-in;
    
    &:hover {
        background: #171212;
        color: #ffffff;
    }
`;
const StyledButtonSmall = styled(StyledButton)`
    padding: 5px;
`;
const StyledButtonLarge = styled(StyledButton)`
    padding: 10px;
`;
const StyledSearchForm = styled.form`
    padding: 10px;
    display: flex;
    align-items: baseline;
    `;
const StyledLabel = styled.label`
    border-top: 1px solid #171212;
    border-left: 1px solid #171212;
    padding-left: 5px;
    font-size: 24px;
`;
const StyledInput = styled.input`
    border: none;
    border-bottom: 1px solid #171212;
    font-size: 24px;
    background-color: transparent;
`;

const storiesReducer = (state, action) => {
    switch (action.type) {
        case 'STORIES_FETCH_INIT':
            return {
                ...state,
                isLoading: true,
                isError: false
            }
        case 'STORIES_FETCH_SUCCESS':
            return {
                ...state,
                isLoading: false,
                isError: false,
                data: action.payload
            };
        case 'STORIES_FETCH_FAILURE':
            return {
                ...state,
                isLoading: false,
                isError: true
            }
        case 'REMOVE_STORY':
            return {
                ...state,
                data: state.data.filter(story => story.objectID !== action.payload.objectID)
            }
        default:
            throw new Error()
    }
};

const App = () => {

    const API_ENDPOINT = 'https://hn.algolia.com/api/v1/search?query=';

    //Custom hook
    const useSemiPersistentState = (key, initialState) => {
        //UseState hook
        const [value, setValue] = React.useState(localStorage.getItem(key) || initialState);
        //UseEffect hook
        React.useEffect(() => {
            localStorage.setItem(key, value);
        }, [value, key])
        return [value, setValue]
    }

    const [stories, dispatchStories] = React.useReducer(storiesReducer, {
            data: [], isLoading: false, isError: false
        })
    ;
    const [searchTerm, setSearchTerm] = useSemiPersistentState('search', 'React');

    const handleRemoveStory = item => {
        dispatchStories({
            type: 'REMOVE_STORY',
            payload: item
        });
        const newStories = stories.data.filter(story => story.objectId !== item.objectId)
        // setStories(newStories);
    }

    const [url, setUrl] = React.useState(`${API_ENDPOINT}${searchTerm}`)

    const handleFetchStories = React.useCallback(async () => {
        if (!searchTerm) {
            return;
        }
        dispatchStories({type: 'STORIES_FETCH_INIT'})
        try {
            const result = await axios.get(url)
            dispatchStories({
                type: 'STORIES_FETCH_SUCCESS',
                payload: result.data.hits
            });
        } catch (error) {
            dispatchStories({type: 'STORIES_FETCH_FAILURE'})
        }
    }, [url]);

    React.useEffect(() => {
        handleFetchStories();
    }, [handleFetchStories]);
    const handleSearchInput = event => {
        setSearchTerm(event.target.value);
    };

    const handleSearchSubmit = (event) => {
        setUrl(`${API_ENDPOINT}${searchTerm}`);
        event.preventDefault();
    };
    return (
        <StyledContainer>
            <StyledHeadlinePrimary>My Hacker Stories!</StyledHeadlinePrimary>
            <SearchForm searchTerm={searchTerm} onSearchInput={handleSearchInput} onSearchSubmit={handleSearchSubmit}/>

            {stories.isError && <p>Something went wrong...</p>}
            {stories.isLoading ? (
                <p>Loading...</p>
            ) : (
                <List list={stories.data} onRemoveItem={handleRemoveStory}/>
            )}
        </StyledContainer>
    );
}
const SearchForm = ({searchTerm, onSearchInput, onSearchSubmit}) => (
    <StyledSearchForm onSubmit={onSearchSubmit} className={styles.searchForm}>
        <InputWithLabel id="search" value={searchTerm} onInputChange={onSearchInput}>
            <SimpleText text="Search: "/>
        </InputWithLabel>
        <StyledButtonLarge disabled={!searchTerm}>
            Submit
        </StyledButtonLarge>
    </StyledSearchForm>

)
const SimpleText = ({text}) => (
    <>
        <strong>{text}</strong>
    </>
)
//<> replaces <div> - react fragment
const InputWithLabel = ({id, label, value, type = 'text', onInputChange, children}) => {
    return (
        <>
            <StyledLabel htmlFor={id} className={styles.label}>{children}</StyledLabel>
            <StyledInput id={id} type={type} onChange={onInputChange} value={value} className={styles.input}/>
        </>
    )
}

const List = ({list, onRemoveItem}) =>
    list.map(item => <Item key={item.objectId} item={item} onRemoveItem={onRemoveItem}/>);


const Item = ({item, onRemoveItem}) => {
    const handleRemoveItem = () => onRemoveItem(item);

    return (
        <StyledItem>
            <StyledColumn width="40%">
                <a href={item.url}>{item.title} </a>
            </StyledColumn>
            <StyledColumn width="30%">{item.author} </StyledColumn>
            <StyledColumn width="10%">{item.num_comments} </StyledColumn>
            <StyledColumn width="10%">{item.points} </StyledColumn>
            <StyledColumn width="10%">
                <StyledButtonSmall className={`${styles.button} ${styles.buttonSmall}`} type="button"
                                   onClick={() => onRemoveItem(item)}>
                    Dismiss
                </StyledButtonSmall>
            </StyledColumn>
        </StyledItem>
    )
}

export default App;
export {storiesReducer, SearchForm, InputWithLabel, List, Item};