import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const ValidInputRegex = /[0-9a-zA-Z]|Enter|Tab/g;

var keyLog = "";

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

const processData = (data) => {
    console.log("Processing Data: \"" + data + "\"");
}

export default function Inventory({ applicationState }) {

    const navigation = useNavigate();

    const [isReady, setIsReady] = useState(false);

    // Verify User Login
    useEffect(() => {

        if(applicationState) {
            // Validate against server
            setIsReady(true);
            return;
        }

        navigation("/");
    }, [applicationState, navigation]);

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

    if(isReady)
        return (
            <>
                <h1>{applicationState.userName}</h1>
                <button onClick={() => { applicationState.logout() }}>Logout</button>
            </>
        );
    else
        return null;
}