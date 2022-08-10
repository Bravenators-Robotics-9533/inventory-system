import { createStackNavigator } from "react-navigation-stack";
import { createAppContainer } from 'react-navigation';

import Home from "./Home";
import BarcodeScanner from "./BarcodeScanner";
import Project from "./Project";

const screens = {
    Home: {
        screen: Home,
        navigationOptions: {
            title: "Projects",
        }
    },
    Project: {
        screen: Project,
    },
    ItemScanner: {
        screen: BarcodeScanner,
        navigationOptions: {
            title: "Item Scanner"
        }
    }
}

const EntryStack = createStackNavigator(screens);

export default createAppContainer(EntryStack);