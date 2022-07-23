import { forwardRef, useImperativeHandle, useRef, useState } from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRotateLeft, faAngleDown, faAngleUp } from '@fortawesome/free-solid-svg-icons'

import './ActionUndoPopup.css';

const ActionUndoPopup = forwardRef((props, ref) => {

    const [isVisible, setIsVisible] = useState(false);
    const [isDocked, setIsDocked] = useState(false);

    const itemName = useRef("");
    const value = useRef(0);
    const isPositive = useRef(true);
    const undoCallback = useRef(null);

    useImperativeHandle(ref, () => ({
        handleChange(barcode, inheritedValue, inheritedCallback) {
            value.current = inheritedValue;
            itemName.current = "Ultraplanetary Gearbox Kit & HD Hex Motor";
            undoCallback.current = inheritedCallback;

            isPositive.current = inheritedValue > 0;

            setIsVisible(true);
        }
    }));

    const onAction = () => {
        let result = window.confirm("Are you sure you want to undo this action?");

        if(!result)
            return;

        undoCallback.current();

        itemName.current = "";
        value.current = 0;
        undoCallback.current = null;
        setIsVisible(false);
    }

    return (
        <section id="action-undo-popup" className={`${isPositive.current ? "positive" : "negative"} ${isVisible && !isDocked ? "show" : null} ${isDocked ? "docked" : null}`}>
            <div className="content">
                <div className="content-shadow"></div>

                <div className="text-wrapper">
                    <h3>{itemName.current}</h3>
                </div>
                <div className="controls" onClick={onAction}>
                    <FontAwesomeIcon icon={faRotateLeft} className="undo-button" />
                </div>

                <div className="collapse-window" onClick={() => { setIsDocked(true); }}>
                    <FontAwesomeIcon icon={faAngleDown} className="fa-icon" />
                </div>

                <div className="quantity">
                    <p>{Math.abs(value.current)}</p>
                </div>
            </div>

            <div className="uncollapse-window" onClick={() => { setIsDocked(false); }}>
                <FontAwesomeIcon icon={faAngleUp} className="fa-icon" />
            </div>   
        </section>
    );

});

export default ActionUndoPopup;