import { useEffect, useState, useCallback, useRef } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle, faPencil, faTrash } from "@fortawesome/free-solid-svg-icons";

export default function InventoryItem({ updateInventoryItem, deleteInventoryItem, barcode, name, manufacturer, quantity, imageURL, searchQuery }) {

    const [shouldDisplay, setShouldDisplay] = useState(true);
    const [nameElement, setNameElement] = useState(null);

    const itemNameRef = useRef();
    const itemManufacturerRef = useRef();
    const imageURLRef = useRef(imageURL);

    const update = useCallback(() => {
        updateInventoryItem(barcode, {
            name: itemNameRef.current.value,
            manufacturer: itemManufacturerRef.current.value,
            quantity: quantity,
            imageURL: imageURLRef.current
        });
    }, [quantity, itemNameRef, itemManufacturerRef, barcode, updateInventoryItem, imageURLRef]);

    useEffect(() => {

        if(searchQuery && !name.toLowerCase().includes(searchQuery)) {
            setShouldDisplay(false);
        } else {
            if(!searchQuery || searchQuery === null) {
                setNameElement(<td>{name}</td>);
            } else {
                let replacedString = name.replace(new RegExp(`${searchQuery}`, 'gi'), function replace(match) {
                    return `<span class="highlighted">${match}</span>`;
                });

                setNameElement(<td dangerouslySetInnerHTML={{__html: replacedString}}></td>);
            }

            setShouldDisplay(true);
        }

    }, [searchQuery, name, setShouldDisplay]);

    if(!shouldDisplay)
        return null;

    return (
        <tr className="inventory-item">
            <td className="info">
                <span>
                    <FontAwesomeIcon icon={faInfoCircle} style={{marginRight: "10px", cursor: "pointer"}} className="fa-icon" />
                    <div className="img">
                        {
                            imageURL && 
                            <img src={imageURL} alt="" />
                        }
                        <div className="img-controls">
                            <FontAwesomeIcon className="fa-icon" icon={faPencil} onClick={() => {
                                const value = window.prompt("Enter URL");
                                imageURLRef.current = value;
                                update();
                            }} />
                            {
                                imageURL &&
                                <FontAwesomeIcon className="fa-icon" icon={faTrash} onClick={() => {
                                    const result = window.confirm("Are you sure you want to remove this image?");

                                    if(!result)
                                        return;

                                    imageURLRef.current = null;
                                    update();
                                }} />
                            }
                        </div>
                    </div>
                    <div className="controls">
                        <input ref={itemNameRef} type="text" style={{margin: "15px 0"}} placeholder="Item Name" defaultValue={name} onChange={update} />
                        <input ref={itemManufacturerRef} type="text" style={{margin: "15px 0"}} placeholder="Manufacturer" defaultValue={manufacturer} onChange={update} />
                        <br />
                        <button onClick={() => {
                            const result = window.confirm("Are you sure you want to delete this item?");

                            if(!result)
                                return;

                            deleteInventoryItem(barcode);
                        }}>Delete</button>
                    </div>
                </span>
                {barcode}
            </td>
            {nameElement}
            <td>{manufacturer}</td>
            <td>{quantity}</td>
        </tr>
    );
}