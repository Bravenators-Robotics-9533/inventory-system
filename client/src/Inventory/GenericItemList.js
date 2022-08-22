import { useState, useEffect, forwardRef, useRef, useImperativeHandle, useCallback } from "react";

import { server } from "../ServerAPI";

import useSound from "use-sound";
import { addItemSound, needsAttentionSound, removeItemSound } from "../Sound/Sound";

import Popup from "../Popup/Popup";

import InventoryItem from "./InventoryItem";
import PopupInputField from "../Popup/PopupInputField";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil, faTrash } from "@fortawesome/free-solid-svg-icons";

const GenericItemList = forwardRef(({ applicationState, errorPopupRef, project, setProject, currentSearchText, actionUndoPopupRef }, ref) => {

    const [currentMode, setCurrentMode] = useState("add");

    const [inventoryItemElements, setInventoryItemElements] = useState([]);

    const [isNewItemPopupActive, setIsNewItemPopupActive] = useState(false);
    
    const [defaultCreateNewItemBarcodeValueRef, setDefaultCreateNewItemBarcodeValueRef] = useState(null);
    const [defaultCreateNewItemStartingValueRef, setDefaultCreateNewItemStartingValueRef] = useState(0);

    const createNewItemBarcodeFieldRef = useRef();
    const createNewItemManufacturerFieldRef = useRef();
    const createNewItemItemNameFieldRef = useRef();
    const createNewItemStartingQuantityFieldRef = useRef();
    const [createNewItemImageURL, setCreateNewItemImageURL] = useState(null);

    const [playAddItemSound] = useSound(addItemSound, { volume: 0.5 });
    const [playRemoveItemSound] = useSound(removeItemSound, { volume: 0.5 });
    const [playNeedsAttentionSound] = useSound(needsAttentionSound, { volume: 0.75 });

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

    const deleteInventoryItem = useCallback((barcode) => {
        server.delete(`/projects/delete-item/${project._id}/${barcode}`, {
            headers: { authorization: applicationState.accessToken }
        }).then((res) => {
            setProject(res.data.project);
        })
    }, [project, applicationState, setProject]);

    const createNewItem = useCallback(() => {
        const barcode = createNewItemBarcodeFieldRef.current.value;
        const manufacturer = createNewItemManufacturerFieldRef.current.value;
        const itemName = createNewItemItemNameFieldRef.current.value;
        const startingQuantity = createNewItemStartingQuantityFieldRef.current.value;
        const imageURL = createNewItemImageURL;

        if(project.inventoryItems[barcode]) {
            return;
        }

        updateInventoryItem(barcode, { name: itemName, manufacturer: manufacturer, quantity: startingQuantity, imageURL: imageURL });
    }, [project, updateInventoryItem, createNewItemImageURL]);

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

            if(clientErrorCode === 1) { // Unknown Item
                playNeedsAttentionSound();
                setDefaultCreateNewItemBarcodeValueRef(barcode);
                setDefaultCreateNewItemStartingValueRef(100);
                setIsNewItemPopupActive(true);
            } else if(clientErrorCode === 2) { // Attempting to change quantity to less than 0
                errorPopupRef.current.runError("Invalid Item Quantity", "Item quantity is already 0. Maybe you meant to add it?");
            }
        });
    }, [project, applicationState, setProject, playAddItemSound, playRemoveItemSound, playNeedsAttentionSound, actionUndoPopupRef, errorPopupRef, setDefaultCreateNewItemBarcodeValueRef, setDefaultCreateNewItemStartingValueRef]);

    const toggleCurrentMode = useCallback(() => {
        setCurrentMode((curr) => { return curr === "add" ? "remove" : "add"});
    }, [setCurrentMode]);

    useImperativeHandle(ref, () => ({
        processData(data) {
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
        },

        isNewItemPopupActive() { return isNewItemPopupActive; },
        setIsNewItemPopupActive(value) { setIsNewItemPopupActive(value); },
    }));

    useEffect(() => {
        
        let elements = [];

        for(let element in project.inventoryItems) {
            const itemData = project.inventoryItems[element];
            elements.push({element: element, itemData: itemData});
        }

        setInventoryItemElements(elements);

    }, [project.inventoryItems, setInventoryItemElements]);

    return (
        <>
            <Popup id="generic-item-creation" isActive={isNewItemPopupActive} popupName="Create Item" submitButtonName="Create" onClose={() => { 
                setIsNewItemPopupActive(false); 
                setCreateNewItemImageURL(null); 

                setDefaultCreateNewItemBarcodeValueRef(null); 
                setDefaultCreateNewItemStartingValueRef(0);
            }} 
            onSubmit={createNewItem}>
                <div key="1" style={{display: "flex", justifyContent: "space-between"}} className="split">
                    <div key="2" style={{width: "40%"}}>
                        <PopupInputField key="Barcode" name="Barcode" ref={createNewItemBarcodeFieldRef} startingValue={defaultCreateNewItemBarcodeValueRef ? 
                        defaultCreateNewItemBarcodeValueRef : undefined} oneline />
                        <PopupInputField key="Manufacturer" name="Manufacturer" ref={createNewItemManufacturerFieldRef} oneline />
                        <PopupInputField key="Item Name" name="Item Name" ref={createNewItemItemNameFieldRef} oneline />
                        <PopupInputField key="Starting Quantity" name="Starting Quantity" oneline startingValue={defaultCreateNewItemStartingValueRef} style={{width: "4em", textAlign: "center"}} 
                        ref={createNewItemStartingQuantityFieldRef} type="number" customValidationCallback={() => {
                            const value = createNewItemStartingQuantityFieldRef.current.value;
                            return Number.isInteger(Number.parseInt(value)) && Number.parseInt(value) >= 0
                        }} />
                    </div>
                    <div key="3" style={{width: "50%"}} className="right" >
                        <div className="img" key="img">
                            {
                                createNewItemImageURL && 
                                <img src={createNewItemImageURL} alt="" />
                            }
                            <div className="img-controls" key='img-controls'>
                                <FontAwesomeIcon className="fa-icon" icon={faPencil} onClick={() => {
                                    const value = window.prompt("Enter URL");
                                    setCreateNewItemImageURL(value);
                                }} />
                                {
                                    createNewItemImageURL &&
                                    <FontAwesomeIcon className="fa-icon" icon={faTrash} onClick={() => {
                                        const result = window.confirm("Are you sure you want to remove this image?");

                                        if(!result)
                                            return;

                                        setCreateNewItemImageURL(null);
                                    }} />
                                }
                            </div>
                        </div>
                    </div>
                </div>
                <div key="4" />
            </Popup>

            <div className="table-wrapper" id="generic-item-list">
                <table className={currentMode}>
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
                                return <InventoryItem key={element.element} updateInventoryItem={updateInventoryItem} barcode={element.element} searchQuery={currentSearchText} 
                                {...element.itemData} deleteInventoryItem={deleteInventoryItem} />
                            })
                        }
                    </tbody>
                </table>     
            </div>
        </>
    )

});

export default GenericItemList;