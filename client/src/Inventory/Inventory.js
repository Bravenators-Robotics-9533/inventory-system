import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGear, faRepeat, faPlus, faAngleLeft, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'

import { server } from "../ServerAPI";

import { Outlet } from "react-router-dom";

import './Inventory.css'

import InventoryItem from "./InventoryItem";

import Popup from "../Popup/Popup";
import PopupInputField from "../Popup/PopupInputField"
import ErrorPopup from "./ErrorPopup";
import SettingsPopup from "../Popup/SettingsPopup"

import ActionUndoPopup from "./ActionUndoPopup";

import useSound from "use-sound";
import { addItemSound, removeItemSound } from "../Sound/Sound";

const ValidInputRegex = /[0-9a-zA-Z]|Enter|Tab|#|_/g;

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

export default function Inventory({ applicationState, projectID, dbUser, theme, setTheme }) {

    const navigation = useNavigate();

    const [isReady, setIsReady] = useState(false);
    const [project, setProject] = useState({inventoryItems: null});
    
    const [inventoryItemElements, setInventoryItemElements] = useState([]);

    const [currentMode, setCurrentMode] = useState("add");
    const [isNewItemPopupActive, setIsNewItemPopupActive] = useState(false);
    const [isSearchDisplayed, setIsSearchDisplayed] = useState(false);
    const [currentSearchText, setCurrentSearchText] = useState(null);
    const [isSettingsVisible, setIsSettingsVisible] = useState(false);

    const [playAddItemSound] = useSound(addItemSound, { volume: 0.5 });
    const [playRemoveItemSound] = useSound(removeItemSound, { volume: 0.5 });

    const actionUndoPopupRef = useRef();
    const errorPopupRef = useRef();
    
    const searchInputRef = useRef();
    
    const previousProjectData = useRef();

    const clearKeyLogInterval = useRef();
    const refreshInterval = useRef();

    const resyncProject = useCallback(() => {
        server.get(`/projects/get/${projectID}`, {
            headers: { authorization: applicationState.accessToken }
        }).then((res) => {
            const projectData = JSON.stringify(res.data);

            if(projectData !== previousProjectData.current) {
                let rawProject = res.data;

                setProject(rawProject);
                setIsReady(true);

                previousProjectData.current = projectData;
            }
        })
    }, [setIsReady, setProject, applicationState, projectID]);

    const updateInventoryItem = useCallback((barcode, data) => {
        server.post(`/projects/update-item`, {
            projectID: project._id,
            itemBarcode: barcode,
            itemData: data
        }, {
            headers: { authorization: applicationState.accessToken }
        }).then((res) => {
            setProject(res.data.project);
        })
    }, [project, applicationState, setProject]);

    const modifyItemQuantity = useCallback((barcode, value) => {
        server.post(`/projects/modify-item-quantity`, {
            projectID: project._id,
            itemBarcode: barcode,
            value: value
        }, {
            headers: { authorization: applicationState.accessToken } 
        }).then((res) => {
            if(value > 0) {
                playAddItemSound();
            } else {
                playRemoveItemSound();
            }

            setProject(res.data.project);

            // Reversal of this action
            actionUndoPopupRef.current.handleChange(barcode, value, () => {
                server.post(`/projects/modify-item-quantity`, {
                    projectID: project._id,
                    itemBarcode: barcode,
                    value: -(value)
                }, {
                    headers: { authorization: applicationState.accessToken } 
                }).then((res) => {
                    setProject(res.data.project);
                });
            });
        }).catch(err => {
            const clientErrorCode = err?.response?.data?.clientErrorCode;

            if(!clientErrorCode)
                return;

            if(clientErrorCode === 1) {
                console.log("Unknown Item!");
            } else if(clientErrorCode === 2) { // Attempting to change quantity to less than 0
                errorPopupRef.current.runError("Invalid Item Quantity", "Item quantity is already 0. Maybe you meant to add it?");
            }
        });
    }, [project, applicationState, setProject, playAddItemSound, playRemoveItemSound]);

    const processData = useCallback((data) => {
        if((data.startsWith("Shift#") || data.startsWith("#")) && data.endsWith("#")) {

            let specialData = data.split('#')[1];

            if(specialData === "MODE_ADD") {
                setCurrentMode("add")
            } else if(specialData === "MODE_REMOVE") {
                setCurrentMode("remove");
            }

            return;
        }

        if(currentMode === "add") {
            modifyItemQuantity(data, 1);            
        } else if(currentMode === "remove") {
            modifyItemQuantity(data, -1);
        }
    }, [currentMode, modifyItemQuantity, setCurrentMode]);

    // Verify User Login
    useEffect(() => {
        
        clearInterval(refreshInterval.current);
        refreshInterval.current = setInterval(resyncProject, 5000); // 5 seconds

        resyncProject();

    }, [resyncProject]);

    const keyDownHandler = ({ key }) => {
        if(isNewItemPopupActive) // Ignore if in popup
            return;

        if(key.match(ValidInputRegex)) {
            if(key === "Enter" || key === "Tab") { // Finish of Barcode
                if(keyLog.trim()) {
                    processData(keyLog);
                    clearInterval(clearKeyLogInterval.current);
                    keyLog = "";
                }
            } else {
                keyLog += key;

                // Clear key log after 500ms of nothing
                clearInterval(clearKeyLogInterval.current);
                clearKeyLogInterval.current = setInterval(() => {
                    keyLog = "";
                    clearInterval(clearKeyLogInterval.current);
                }, 10);
            }
        }

        // If not valid input key (do nothing)
    };

    useEffect(() => {
        
        let elements = [];

        for(let element in project.inventoryItems) {
            const itemData = project.inventoryItems[element];
            elements.push({element: element, itemData: itemData});
            // elements.push(<InventoryItem key={element} barcode={element} {...itemData} />)
        }

        setInventoryItemElements(elements)

    }, [project.inventoryItems, setInventoryItemElements]);

    const toggleCurrentMode = useCallback(() => {
        setCurrentMode((curr) => { return curr === "add" ? "remove" : "add"});
    }, [setCurrentMode]);

    const createNewItemBarcodeFieldRef = useRef();
    const createNewItemManufacturerFieldRef = useRef();
    const createNewItemItemNameFieldRef = useRef();
    const createNewItemStartingQuantityFieldRef = useRef();

    const createNewItem = useCallback(() => {
        const barcode = createNewItemBarcodeFieldRef.current.value;
        const manufacturer = createNewItemManufacturerFieldRef.current.value;
        const itemName = createNewItemItemNameFieldRef.current.value;
        const startingQuantity = createNewItemStartingQuantityFieldRef.current.value;

        if(project.inventoryItems[barcode]) {
            console.log("Hello");
            return;
        }

        updateInventoryItem(barcode, { name: itemName, manufacturer: manufacturer, quantity: startingQuantity });
    }, [project, updateInventoryItem]);

    useLayoutEffect(() => {
        clearInterval(clearKeyLogInterval.current);
        clearInterval(refreshInterval.current);
    }, [clearKeyLogInterval]);

    useEventListener("keydown", keyDownHandler);

    if(!isReady)
        return null;

    return (
        <>
        <Popup isActive={isNewItemPopupActive} popupName="Create Item" submitButtonName="Create" onClose={() => { setIsNewItemPopupActive(false); }} 
        onSubmit={createNewItem}>
            <PopupInputField key="Barcode" name="Barcode" ref={createNewItemBarcodeFieldRef} />
            <PopupInputField key="Manufacturer" name="Manufacturer" ref={createNewItemManufacturerFieldRef} />
            <PopupInputField key="Item Name" name="Item Name" ref={createNewItemItemNameFieldRef} />
            <PopupInputField key="Starting Quantity" name="Starting Quantity" startingValue={0} style={{width: "4em", textAlign: "center"}} 
            ref={createNewItemStartingQuantityFieldRef} type="number" customValidationCallback={() => {
                const value = createNewItemStartingQuantityFieldRef.current.value;
                return Number.isInteger(Number.parseInt(value)) && Number.parseInt(value) >= 0
            }} />
        </Popup>

        <ActionUndoPopup ref={actionUndoPopupRef} />
        <ErrorPopup ref={errorPopupRef} />
        <SettingsPopup applicationState={applicationState} dbUser={dbUser} isActive={isSettingsVisible} setIsActive={setIsSettingsVisible} theme={theme} setTheme={setTheme} project={project} setProject={setProject} />

        <section id="inventory" className={`${currentMode}-mode`}>
            <nav>
                <div className="controls"> 
                    <FontAwesomeIcon icon={faAngleLeft} className="fa-icon" onClick={() => { navigation('/projects'); }} />
                    <h1>{applicationState.user.userName}</h1>
                </div>
                <h1>{project.projectName}</h1>
                <div className="controls">
                    <FontAwesomeIcon icon={faPlus} className="fa-icon" onClick={() => { setIsNewItemPopupActive(true); }} />
                    <FontAwesomeIcon icon={faRepeat} className="fa-icon" onClick={toggleCurrentMode} />
                    <input type="text" name="part-search" className={isSearchDisplayed ? "displayed" : null} id="part-search" placeholder="Search..." ref={searchInputRef}
                    onChange={(e) => { setCurrentSearchText(e.target.value.toLowerCase()); }} />
                    <FontAwesomeIcon icon={faMagnifyingGlass} className="fa-icon" onClick={() => { setIsSearchDisplayed((curr) => { 
                        if(curr) setCurrentSearchText(null);
                        else setCurrentSearchText(searchInputRef.current.value);

                        return !curr; 
                    })}} />
                    <FontAwesomeIcon icon={faGear} className="fa-icon" onClick={() => setIsSettingsVisible(true)} />
                </div>
            </nav>
            <div className="table-wrapper">
                <table>
                    <thead onClick={toggleCurrentMode}>
                        <tr>
                            <th>Barcode</th>
                            <th>Name</th>
                            <th>Manufacturer</th>
                            <th>Quantity</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            inventoryItemElements.map((element) => {
                                return <InventoryItem key={element.element} barcode={element.element} searchQuery={currentSearchText} 
                                {...element.itemData} />
                            })
                        }
                    </tbody>
                </table>     
            </div>
        </section>
        <Outlet />
        </>
    );
}