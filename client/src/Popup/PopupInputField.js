import { useCallback, useState, useEffect, forwardRef } from "react";

import "./Popup.css"

const PopupInputField = ({ name, placeholder="", startingValue="", style, reportValidation, customValidationCallback, type="text", oneline=false }, ref) => {

    const [isValid, setIsValid] = useState(true);

    const validate = useCallback(() => {
        let validationState = true;
        
        if(ref.current.value.length <= 0)
            validationState = false;

        return validationState;
    }, [ref]);
    
    const customValidate = useCallback(() => {
        if(customValidationCallback)
            return customValidationCallback();
        else
            return validate();

    }, [customValidationCallback, validate]);

    const onChange = useCallback(() => {
        let validation = customValidate();

        if(reportValidation)
            reportValidation(name, validation);
        setIsValid(validation);
    }, [setIsValid, reportValidation, name, customValidate]);

    useEffect(() => {

        if(ref.current) {
            onChange();
        }

    }, [ref, startingValue, onChange]);

    return (
        <div className={`row input-field ${oneline ? 'oneline' : undefined}`} key={name}>
            <h1 style={!isValid ? {color: "red"} : null}>{name}</h1>
            <input type={type} name={name} id={name} style={style} placeholder={placeholder} defaultValue={startingValue} ref={ref} onChange={onChange} />
        </div>
    )

}

export default forwardRef(PopupInputField);