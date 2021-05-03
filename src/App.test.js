//Note: Can use Cypress.io for end to end tests . check out rwieruch blog for tutorial
import React from 'react'
import {
    render,
    screen,
    fireEvent,
    act
} from '@testing-library/react'
import axios from 'axios';

import App, {
    storiesReducer,
} from "./App";
import SearchForm from './SearchForm';
import InputWithLabel from './InputWithLabel';
import List from './List';
import {Item} from './Item';

const JOHN = 'John';
const REACT = 'React';
const REACT_URL = 'https://reactjs.org';
const storyOne = {
    title: REACT,
    url: REACT_URL,
    author: JOHN,
    num_comments: 3,
    points: 4,
    objectID: 0,
}

const REDUX = 'Redux';
const REDUX_URL = 'https://redux.js.org';
const JACK = 'Jack';
const storyTwo = {
    title: REDUX,
    url: REDUX_URL,
    author: JACK,
    num_comments: 5,
    points: 3,
    objectID: 1
}

const stories = [storyOne, storyTwo];

jest.mock('axios');

describe('storiesReducer', () => {
    test('removes a story from all stories', () => {
        const action = {
            type: 'REMOVE_STORY',
            payload: storyOne
        };
        const state = {
            data: stories,
            isLoading: false,
            isError: false
        }
        expect(storiesReducer(state, action)).toStrictEqual({
            isLoading: false,
            isError: false,
            data: [storyTwo]
        })
    })
})

describe('Item', () => {
    test('renders all properties', () => {
        render(<Item item={storyOne}/>);
        //screen.debug();
        expect(screen.getByText(JOHN)).toBeInTheDocument();
        expect(screen.getByText(REACT)).toHaveAttribute('href', REACT_URL)
    })
    test('renders a clickable dismiss button', () => {
        render(<Item item={storyOne}/>);
        expect(screen.getByRole('button')).toBeInTheDocument();
    })
    test('clicking the dismiss button calls the callback handler', () => {
        const handleRemoveItem = jest.fn();
        render(<Item item={storyOne} onRemoveItem={handleRemoveItem}/>)
        fireEvent.click(screen.getByRole('button'))
        expect(handleRemoveItem).toHaveBeenCalledTimes(1);
    })
})

describe('SearchForm', () => {
    const searchFormProps = {
        searchTerm: REACT,
        onSearchInput: jest.fn(),
        onSearchSubmit: jest.fn()
    }

    test('renders the input field with its value', () => {
        render(<SearchForm {...searchFormProps}/>);
        expect(screen.getByDisplayValue(REACT)).toBeInTheDocument();
        //screen.debug()
    });
    test('renders the correct label', () => {
        render(<SearchForm {...searchFormProps}/>);
        expect(screen.getByLabelText(/Search/)).toBeInTheDocument() // by regex
    })
    test('calls onSearchInput onInputChange', () => {
        render(<SearchForm {...searchFormProps}/>);
        fireEvent.change(screen.getByDisplayValue(REACT), {
            target: {
                value: 'REDUX'
            }
        });
        expect(searchFormProps.onSearchInput).toHaveBeenCalledTimes(1);
    })
    test('calls onSearchSubmit on button submit click', () => {
        render(<SearchForm {...searchFormProps}/>);
        fireEvent.submit(screen.getByRole('button'));
        expect(searchFormProps.onSearchSubmit).toHaveBeenCalledTimes(1);
        screen.debug()
    })
});

describe('App', () => {
    const promiseWithData = Promise.resolve({
        data: {
            hits: stories
        }
    })

    test('succeeds fetching the data', async () => {
        axios.get.mockImplementationOnce(() => promiseWithData);
        render(<App/>);
        expect(screen.queryByText(/Loading/)).toBeInTheDocument();
        await act(() => promiseWithData);
        expect(screen.queryByText(/Loading/)).toBeNull();
        expect(screen.getByText(REACT)).toBeInTheDocument();
        expect(screen.getByText(REDUX)).toBeInTheDocument();
        expect(screen.getAllByText('Dismiss').length).toBe(2);

    })
    test('fails fetching data', async () => {
        const promise = Promise.reject();
        axios.get.mockImplementationOnce(() => promise);
        render(<App/>);
        expect(screen.getByText(/Loading/)).toBeInTheDocument();
        try {
            await act(() => promise);
        } catch (error) {
        }
        expect(screen.queryByText(/Loading/)).toBeNull();
        expect(screen.queryByText(/went wrong/)).toBeInTheDocument();
    })
    test('removes a story', async () => {
        axios.get.mockImplementationOnce(() => promiseWithData);
        render(<App/>);
        await act(() => promiseWithData);
        expect(screen.getAllByText('Dismiss').length).toBe(2);
        expect(screen.getByText(JOHN)).toBeInTheDocument();
        fireEvent.click(screen.getAllByText('Dismiss')[0]);
        expect(screen.getAllByText('Dismiss').length).toBe(1);
        expect(screen.queryByText(JOHN)).toBeNull();
    })
    test('searches for specific stories',  async () => {
        const JS_STORY_URL = 'https://js.org';
        const JS_AUTHOR = 'me';
        const anotherStory = {
            title: 'JS',
            url: JS_STORY_URL,
            author: JS_AUTHOR,
            num_comments: 5,
            points: 3,
            objectID: 1
        };
        const javaScriptStories = [anotherStory];
        const javascriptPromise = Promise.resolve({
            data: {
                hits: javaScriptStories
            }
        });
        axios.get.mockImplementation(url => {
            if (url.includes(REACT)) {
                return promiseWithData;
            }
            if (url.includes('JS')) {
                return javascriptPromise;
            }
            throw Error();
        })
        render(<App/>);
        await act(() => promiseWithData);
        expect(screen.queryByDisplayValue(REACT)).toBeInTheDocument();
        expect(screen.queryByText(JOHN)).toBeInTheDocument();
        expect(screen.queryByDisplayValue('JS')).toBeNull();
        expect(screen.queryByText(JS_AUTHOR)).toBeNull();
        expect(screen.getAllByText('Dismiss').length).toBe(2);
        fireEvent.change(screen.queryByDisplayValue(REACT), {
            target: {
                value: 'JS'
            }
        })
        expect(screen.queryByDisplayValue(REACT)).toBeNull();
        expect(screen.queryByDisplayValue('JS')).toBeInTheDocument();
        fireEvent.submit(screen.queryByText('Submit'));
        await act(() => javascriptPromise);
        expect(screen.queryByText(JS_AUTHOR)).toBeInTheDocument();
        expect(screen.queryByText(JOHN)).toBeNull();

    })
})