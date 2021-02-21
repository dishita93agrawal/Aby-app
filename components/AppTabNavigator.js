import EditProfileScreen from "../Screens/EditProfileScreen";
import ShowProfile from "../Screens/ShowProfile";

import { createBottomTabNavigator } from "react-navigation-tabs";
import React from "react";
import { Image } from "react-native";

export const AppTabNavigator = createBottomTabNavigator({
  EditProfile: {
    screen: EditProfileScreen,
    navigationOptions: {
      tabBarLabel: "Edit Screen",
      activeTintColor: "#32867d",
    },
  },
  ShowProfile: {
    screen: ShowProfile,
    navigationOptions: {
      tabBarLabel: "Show Profile",
      activeTintColor: "#32867d",
    },
  },
});
