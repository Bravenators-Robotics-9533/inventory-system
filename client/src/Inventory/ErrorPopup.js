import { useImperativeHandle, useState, useRef, forwardRef } from "react";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleExclamation } from '@fortawesome/free-solid-svg-icons';

import useSound from "use-sound";
import { errorSound } from "../Sound/Sound";

import './ErrorPopup.css';

const ErrorPopup = forwardRef((props, ref) => {

    const [isVisible, setIsVisible] = useState(false);

    const errorTitleRef = useRef("");
    const errorMessageRef = useRef("");

    const [playErrorSound] = useSound(errorSound, { volume: 0.25 });

    useImperativeHandle(ref, () => ({
        runError(errorTitle, errorMessage) {
            errorTitleRef.current = errorTitle;
            errorMessageRef.current = errorMessage;

            playErrorSound();
            setIsVisible(true);
        }
    }));

    return (
        <section id="error-popup" className={isVisible ? "show" : undefined} onClick={() => setIsVisible(false)}>
            <FontAwesomeIcon icon={faCircleExclamation} className="fa-icon" />
            <div>
                <h3>{errorTitleRef.current}</h3>
                <p>{errorMessageRef.current}</p>
            </div>
        </section>
    );

});

export default ErrorPopup;