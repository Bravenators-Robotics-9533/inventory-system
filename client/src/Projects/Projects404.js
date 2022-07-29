import { useNavigate } from "react-router-dom"

export default function Projects404() {

    const navigation = useNavigate();

    const goHome = () => {
        navigation("/projects");
    }

    return (
        <div style={{width: "100vw", height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column"}}>
            <h1>Uh Oh... This project doesn't seem to exist... Sorry!</h1>
            <button style={{marginTop: "2em"}} onClick={goHome}>Go to Projects List</button>
        </div>
    )

}