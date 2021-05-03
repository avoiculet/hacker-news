import styles from "./App.module.css";
import styled from 'styled-components';
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
const InputWithLabel = ({id, label, value, type = 'text', onInputChange, children}) => {
    return (
        <>
            <StyledLabel htmlFor={id} className={styles.label}>{children}</StyledLabel>
            <StyledInput id={id} type={type} onChange={onInputChange} value={value} className={styles.input}/>
        </>
    )
}
export default InputWithLabel;