import { useCallback, useEffect, useState } from "react";
import { Text, View, SafeAreaView, FlatList, StyleSheet, Button } from "react-native"
import FullPageLoader from "../FullPageLoader";
import { server } from "../ServerAPI";

export default function Home(props) {

    const navigation = props.navigation;
    const applicationState = props.screenProps.applicationState;

    const [isReady, setIsReady] = useState(false);
    const [projects, setProjects] = useState(null);

    // Get Projects
    useEffect(() => {
        server.get(`projects/get-all`, {
            headers: { authorization: applicationState.accessToken }
        }).then(res => {
            setProjects(res.data);
            setIsReady(true);
        })
    }, [applicationState, setIsReady, setProjects]);

    const navigateToProject = (projectID) => {
        navigation.navigate("Project", { projectID: projectID });
    }

    const ProjectItem = ({ title, projectID }) => (
        <View style={styles.projectItem}>
            <View style={styles.projectItemTextWrapper} onTouchEnd={() => navigateToProject(projectID)} >
                <Text style={styles.projectItemText}>{title}</Text>
            </View>
        </View>
    );

    const renderProject = ({ item }) => (
        <ProjectItem title={item.projectName} projectID={item._id} />
    );

    if(!isReady)
        return <FullPageLoader />;

    return (
        <SafeAreaView>
            <View style={styles.container}>
                <FlatList 
                    style={styles.flatList}
                    data={projects}
                    renderItem={renderProject}
                    keyExtractor={project => project._id}
                />
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        height: "100%",
        width: "100%",
    },
    projectItem: {
        marginTop: 20,
        marginBottom: 20,
        width: "100%",
        alignItems: "center"
    },
    projectItemText: {
        fontSize: 20,
        textAlign: "center"
    },
    flatList: {
        width: "100%"
    },
    projectItemTextWrapper: {
        width: "80%",
        height: "100%",
        borderRadius: 10,
        paddingTop: 20,
        paddingBottom: 20,
        backgroundColor: "#dddddd"
    }
})