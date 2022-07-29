const UserAccessTokenSessionStorageID = "bravenators-inventory-system.sessionStorage.accessToken";

export class ApplicationState {

    #shouldNullify = false;

    constructor(accessToken, user) {
        this.accessToken = accessToken;
        this.user = user;
    }

    static SaveSessionAccessToken(accessToken) { sessionStorage.setItem(UserAccessTokenSessionStorageID, accessToken); }
    static GetSessionSavedAccessToken() { return sessionStorage.getItem(UserAccessTokenSessionStorageID); }

    static IsUserRecoverable() { return sessionStorage.getItem(UserAccessTokenSessionStorageID) != null; }

    logout() {
        sessionStorage.removeItem(UserAccessTokenSessionStorageID);
        this.#shouldNullify = true;
        
        window.location = "/";
    }

    shouldNullify() { return this.#shouldNullify; }

}