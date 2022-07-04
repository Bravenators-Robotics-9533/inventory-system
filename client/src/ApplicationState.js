import { useNavigate } from "react-router-dom";

const UserAccessTokenSessionStorageID = "bravenators-inventory-system.sessionStorage.accessToken";

export class ApplicationState {

    #shouldNullify = false;

    constructor(accessToken, userName, userType) {
        this.accessToken = accessToken;
        this.userName = userName;
        this.userType = userType;
    }

    static SaveSessionAccessToken(accessToken) { sessionStorage.setItem(UserAccessTokenSessionStorageID, accessToken); }
    static GetSessionSavedAccessToken() { return sessionStorage.getItem(UserAccessTokenSessionStorageID); }

    logout() {
        sessionStorage.removeItem(UserAccessTokenSessionStorageID);
        this.#shouldNullify = true;
        
        window.location = "/";
    }

    shouldNullify() { return this.#shouldNullify; }

}