import './App.css';
import React from "react";


const App = () => {
    const initialStories = [
        {
            title: 'React',
            url: 'https://reactjs.org',
            author: 'Jordan Walke',
            num_comments: 3,
            points: 4,
            objectId: 0
        },
        {
            title: 'Redux',
            url: 'https://redux.js.org',
            author: 'Dan Abramov',
            num_comments: 2,
            points: 5,
            objectId: 1
        }
    ]
    const getAsyncStories = () => new Promise(resolve =>
        setTimeout(() => resolve({
                data: {
                    stories: initialStories
                }
            }), 2000
        ));
    //Error condition:
    //const getAsyncStories = () => new Promise((resolve, reject) => setTimeout(reject, 2000));
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
                    data: state.data.filter(story => story.objectId !== action.payload.objectId)
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

    React.useEffect(() => {
        //setIsLoading(true);
        dispatchStories({type: 'STORIES_FETCH_INIT'})
        getAsyncStories()
            .then(result => {
                dispatchStories({
                    type: 'STORIES_FETCH_SUCCESS',
                    payload: result.data.stories
                });
            })
            .catch(error => dispatchStories({type: 'STORIES_FETCH_FAILURE'}));
    }, []);

    const handleRemoveStory = item => {
        dispatchStories({
            type: 'REMOVE_STORY',
            payload: item
        });
        const newStories = stories.data.filter(story => story.objectId !== item.objectId)
        // setStories(newStories);
    }
    const handleSearch = event => {
        setSearchTerm(event.target.value);
    };

    const searchedStories = stories.data.filter(story => story.title.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div>
            <h1>My Hacker Stories!</h1>
            <InputWithLabel id="search" value={searchTerm} onInputChange={handleSearch}>
                <SimpleText text="Search: "/>
            </InputWithLabel>
            <hr/>
            {stories.isError && <p>Something went wrong...</p>}
            {stories.isLoading ? (
                <p>Loading...</p>
            ) : (
                <List list={searchedStories} onRemoveItem={handleRemoveStory}/>
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
