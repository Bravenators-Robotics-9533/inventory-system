import { useEffect, useRef, useCallback } from "react"

import { useNavigate } from "react-router-dom";

import './Login.css'

const ValidInputRegex = /[0-9a-zA-Z]|Enter|Tab/g;

let keyLog = "";

// Allows us to bind and automatically unbind event listeners to DOM elements
const useEventListener = (eventName, handler, element = window) => {
    const savedHandler = useRef();

    useEffect(() => {
        savedHandler.current = handler;
    }, [handler]);

    useEffect(() => {
        const eventListener = (event) => savedHandler.current(event);
        element.addEventListener(eventName, eventListener);

        return () => {
            element.removeEventListener(eventName, eventListener);
        };
    }, [eventName, element]);
}

export default function Login({ applicationState, processUserData, attemptUserRecovery }) {

    const navigation = useNavigate();

    const processData = useCallback((data) => {
        processUserData(data);
    }, [processUserData]);

    // Read from session data
    useEffect(() => {
        if(applicationState) {
            navigation('/projects');
            return;
        }

        attemptUserRecovery();
    }, [applicationState, attemptUserRecovery, navigation]);

    const keyDownHandler = ({ key }) => {
        if(key.match(ValidInputRegex)) {
            if(key === "Enter" || key === "Tab") { // Finish of Barcode
                if(keyLog.trim()) {
                    processData(keyLog);
                    keyLog = "";
                }
            } else {
                keyLog += key;
            }
        }

        // If not valid input key (do nothing)
    };

    useEventListener("keydown", keyDownHandler);

    return (
        <section id="login">
            <div className="content">
                <h1>Please Scan Your ID</h1>
            </div>
        </section>
    );

}