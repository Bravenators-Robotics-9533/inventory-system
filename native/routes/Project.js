import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Text, View, SafeAreaView, FlatList, StyleSheet } from "react-native"
import { server } from "../ServerAPI";

import FullPageLoader from "../FullPageLoader";
import BarcodeScanner from "./BarcodeScanner"

export default function Project(props) {

    const navigation = props.navigation;
    const applicationState = props.screenProps.applicationState;
    const projectID = navigation.state.params.projectID;

    const [project, setProject] = useState(null);
    const [inventoryItems, setInventoryItems] = useState(null);

    const prevProjectStringified = useRef(null);
    const refreshInterval = useRef(null);

    const resync = useCallback(() => {
        server.get(`projects/get/${projectID}`, {
            headers: { authorization: applicationState.accessToken }
        }).then(res => {
            const stringifiedData = JSON.stringify(res.data);

            if(stringifiedData !== prevProjectStringified.current) {
                prevProjectStringified.current = stringifiedData;

                let tempInventoryItems = [];

                for(let barcode in res.data.inventoryItems) {
                    tempInventoryItems.push({barcode, ...res.data.inventoryItems[barcode]})
                }

                setInventoryItems(tempInventoryItems);
                setProject(res.data);
            }
        })
    }, [projectID, applicationState, prevProjectStringified, setProject, setInventoryItems]); 

    // On Start
    useEffect(() => {

        clearInterval(refreshInterval.current);
        refreshInterval.current = setInterval(resync, 2500); // 2.5s

    }, [refreshInterval]);

    const renderItem = ({ item }) => (
        <View style={styles.inventoryItem}>
            <Text>Heading</Text>
            <Text>Subheading</Text>
        </View>
    )

    useLayoutEffect(() => {
        clearInterval(refreshInterval.current);
    }, [refreshInterval]);

    if(project == null)
        return <FullPageLoader text="Loading Project" />

    return (
        <SafeAreaView>
            <BarcodeScanner />
        </SafeAreaView>
    )

}


const styles = StyleSheet.create({
    inventoryItem: {
    }
});