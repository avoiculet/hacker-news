import './App.css';
import React from "react";
import axios from 'axios';

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
        <div>
            <h1>My Hacker Stories!</h1>
            <form onSubmit={handleSearchSubmit}>
                <InputWithLabel id="search" value={searchTerm} onInputChange={handleSearchInput}>
                    <SimpleText text="Search: "/>
                </InputWithLabel>
                <button type="submit" disabled={!searchTerm}>
                    Submit
                </button>
            </form>

            <hr/>
            {stories.isError && <p>Something went wrong...</p>}
            {stories.isLoading ? (
                <p>Loading...</p>
            ) : (
                <List list={stories.data} onRemoveItem={handleRemoveStory}/>
            )}
        </div>
    );
}
const SimpleText = ({text}) => (
    <>
        <strong>{text}</strong>
    </>
)
//<> replaces <div> - react fragment
const InputWithLabel = ({id, label, value, type = 'text', onInputChange, children}) => {
    return (
        <>
            <label htmlFor={id}>{children}</label>
            <input id={id} type={type} onChange={onInputChange} value={value}/>
        </>
    )
}

const List = ({list, onRemoveItem}) =>
    list.map(item => <Item key={item.objectId} item={item} onRemoveItem={onRemoveItem}/>);

const Item = ({item, onRemoveItem}) => {
    const handleRemoveItem = () => onRemoveItem(item);

    return (
        <div>
        <span>
            <a href={item.url}>{item.title} </a>
        </span>
            <span>{item.author} </span>
            <span>{item.num_comments} </span>
            <span>{item.points} </span>
            <span>
                <button type="button" onClick={() => onRemoveItem(item)}>
                    Dismiss
                </button>
            </span>
        </div>
    )
}

export default App;
