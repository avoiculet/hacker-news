import styles from "./App.module.css";
import React from "react";
import styled from 'styled-components';

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

const List = ({list, onRemoveItem}) =>
    list.map(item => <Item key={item.objectId} item={item} onRemoveItem={onRemoveItem}/>);


export const Item = ({item, onRemoveItem}) => {
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
export default List;