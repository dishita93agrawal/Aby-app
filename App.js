import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { createAppContainer, createSwitchNavigator } from "react-navigation";
import { AppTabNavigator } from "./components/AppTabNavigator";

import SignInScreen from "./Screens/SignInScreen";
import SignUpScreen from "./Screens/SignUpScreen";

SignUpScreen;
export default class App extends React.Component {
  render() {
    return <AppContainer />;
  }
}
const SwitchNav = createSwitchNavigator({
  SignInScreen: { screen: SignInScreen },
  SignUpScreen: { screen: SignUpScreen },
  BottomTab: { screen: AppTabNavigator },
});

const AppContainer = createAppContainer(SwitchNav);
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
