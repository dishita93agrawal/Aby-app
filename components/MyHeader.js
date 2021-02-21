import React, { Component } from "react";
import { Header, Icon, Badge } from "react-native-elements";
import { View, Text, StyeSheet, Alert } from "react-native";
import db from "../config";
import firebase from "firebase";

export default class MyHeader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userId: firebase.auth().currentUser.email,
      value: "",
    };
  }

  signout = () => {
    firebase.auth().signOut();
    this.props.navigation.navigate("SignInScreen");
  };
  render() {
    return (
      <Header
        centerComponent={{
          text: this.props.title,
          style: { color: "#ffffff", fontSize: 20, fontWeight: "bold" },
        }}
        rightComponent={
          <Icon
            name="log-out"
            type="feather"
            color="#ffffff"
            onPress={() => this.signout()}
          />
        }
        backgroundColor="#32867d"
      />
    );
  }
}
