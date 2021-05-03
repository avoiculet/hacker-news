import styles from "./App.module.css";
import React from "react";
import InputWithLabel from "./InputWithLabel";
import styled from 'styled-components';

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
const StyledButtonLarge = styled(StyledButton)`
    padding: 10px;
`;
const StyledSearchForm = styled.form`
    padding: 10px;
    display: flex;
    align-items: baseline;
    `;

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
export default SearchForm;