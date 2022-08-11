import "./Popup.css"

import { useEffect, useCallback, useState, useRef, cloneElement } from "react"

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faX } from '@fortawesome/free-solid-svg-icons'

export default function Popup({ id = undefined, isActive = false, popupName = "", submitButtonName="Submit", onSubmit, onClose, children, closeOnSubmit=true }) {

    const validations = useRef({});

    const [isReady, setIsReady] = useState(false);
    const [isValid, setIsValid] = useState(true);

    const [modifiedChildren, setModifiedChildren] = useState([]);

    const reportValidation = useCallback((ref, isValid) => {
        validations.current[ref] = isValid;
        
        let result = true;

        for(let i in validations.current) {
            const res = validations.current[i];

            if(res === false)
                result = false;
        }

        setIsValid(result);

    }, [setIsValid, validations]);

    useEffect(() => {
        let modifiedChildrenArray = [];

        if(children) {
            for(let i = 0; i < children.length; i++) {
                const element = cloneElement(children[i], {reportValidation: reportValidation, ref: children[i].ref});
                modifiedChildrenArray.push(element);
            }
        }

        setModifiedChildren(modifiedChildrenArray);
        setIsReady(true);
    }, [children, setModifiedChildren, setIsReady, reportValidation]);

    const submit = () => {
        if(closeOnSubmit)
            onClose();
        onSubmit();
    }

    if(!isActive || !isReady)
        return null;

    return (
        <section className="popup" key={popupName}>
            <div className="box">
                <div className="header">
                    <h1>{popupName}</h1>
                    <FontAwesomeIcon icon={faX} className="fa-icon" onClick={onClose} />
                </div>
                <div className="content" id={id}>
                    {modifiedChildren}
                </div>
                {
                    submitButtonName == null ? null :
                    <div className="footer">
                        <div></div>
                        <button className="submit-btn" disabled={!isValid} onClick={submit}>{submitButtonName}</button>
                    </div>
                }
            </div>
        </section>
    )

}