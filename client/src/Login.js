import { useEffect, useRef, useCallback } from "react"

import { useNavigate } from "react-router-dom";

import { server } from './ServerAPI'
import { ApplicationState } from './ApplicationState'

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

export default function Login({ applicationState, setApplicationState }) {

    const navigation = useNavigate();

    const processData = useCallback((data) => {
        const tokenID = data;
    
        server.post("/users/login", {
            userID: tokenID
        }).then((res) => { // Success
            setApplicationState(new ApplicationState(
                tokenID,
                res.data.user.userName,
                res.data.user.userType
            ));

            ApplicationState.SaveSessionAccessToken(tokenID);

            navigation("/inventory");
        }).catch((error) => { // Failure
            if(error.response.status === 401) {
                console.log("Invalid User");
            }
        });
    }, [setApplicationState, navigation]);

    // Read from session data
    useEffect(() => {
        const tokenID = ApplicationState.GetSessionSavedAccessToken();

        if(tokenID)
            processData(tokenID);
    }, [processData]);

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
    
        <div>
            <h1>Please Scan Your ID</h1>
        </div>

    );

}