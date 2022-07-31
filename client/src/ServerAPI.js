import axios from 'axios';
// import { ApplicationState } from './ApplicationState';

const serverURL = process.env.REACT_APP_MONGODB_DATABASE_URL;

export const server = axios.create({
    baseURL: serverURL
});

export const UserType = {
    Basic: "Basic",
    Admin: "Admin"
};

// server.interceptors.response.use((response) => response, (error) => {
//     console.error(error);

//     if(!error.response)
//         return;

//     if(error.response.status === 401) {
//         console.error("Unauthorized Access Token! Refreshing the Page!");
//         window.location.reload();
//         ApplicationState.SaveSessionAccessToken(null);
//     }
// })