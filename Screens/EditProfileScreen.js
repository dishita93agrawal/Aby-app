import React, { Component } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  Platform,
  TextInput,
  ScrollView,
  StatusBar,
} from "react-native";

import { Avatar } from "react-native-elements";
import * as ImagePicker from "expo-image-picker";
import * as Permissions from "expo-permissions";
import firebase from "firebase";
import db from "../config";

import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Feather from "react-native-vector-icons/Feather";

import BottomSheet from "reanimated-bottom-sheet";
import Animated from "react-native-reanimated";
import { Alert } from "react-native";
import { Geocoder } from "react-native-geocoding";
import { MultiselectDropdown } from "sharingan-rn-modal-dropdown";
import * as Location from "expo-location";
import MyHeader from "../components/MyHeader";

export default class EditProfileScreen extends Component {
  constructor() {
    super();
    this.state = {
      userId: firebase.auth().currentUser.email,
      image: "#",
      name: "",
      age: "",
      phone: "",
      intro: "",
      address: "",
      docId: "",
      hobbies: [],
      fall: new Animated.Value(1),
      bs: React.createRef(),
      hasCameraPermissions: null,

      hasLocationPermissions: null,
      latitude: "",
      longitude: "",
      hobbiesLabels: [],
    };
  }

  takePhotoFromCamera = async () => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);

    this.setState({
      /*status === "granted" is true when user has granted permission
        status === "granted" is false when user has not granted the permission
      */
      hasCameraPermissions: status === "granted",
    });
    if (this.state.hasCameraPermissions) {
      await ImagePicker.launchCameraAsync({
        compressImageMaxWidth: 300,
        compressImageMaxHeight: 300,
        cropping: true,
        compressImageQuality: 0.7,
      }).then((image) => {
        this.uploadImage(image.uri, this.state.userId);
        this.state.bs.current.snapTo(1);
      });
    } else {
      return Alert.alert("give camera permissions");
    }
  };

  choosePhotoFromLibrary = async () => {
    const { cancelled, uri } = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!cancelled) {
      this.state.bs.current.snapTo(1);
      this.uploadImage(uri, this.state.userId);
    }
  };

  renderInner = () => (
    <View style={styles.panel}>
      <View style={{ alignItems: "center" }}>
        <Text style={styles.panelTitle}>Upload Photo</Text>
        <Text style={styles.panelSubtitle}>Choose Your Profile Picture</Text>
      </View>
      <TouchableOpacity
        style={styles.panelButton}
        onPress={this.takePhotoFromCamera}
      >
        <Text style={styles.panelButtonTitle}>Take Photo</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.panelButton}
        onPress={this.choosePhotoFromLibrary}
      >
        <Text style={styles.panelButtonTitle}>Choose From Library</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.panelButton}
        onPress={() => this.state.bs.current.snapTo(1)}
      >
        <Text style={styles.panelButtonTitle}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );

  renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.panelHeader}>
        <View style={styles.panelHandle} />
      </View>
    </View>
  );

  uploadImage = async (uri, imageName) => {
    var response = await fetch(uri);
    var blob = await response.blob();

    var ref = firebase
      .storage()
      .ref()
      .child("user_profiles/" + imageName);

    return ref.put(blob).then((response) => {
      this.fetchImage(imageName);
    });
  };

  fetchImage = (imageName) => {
    var storageRef = firebase
      .storage()
      .ref()
      .child("user_profiles/" + imageName);

    // Get the download URL
    storageRef
      .getDownloadURL()
      .then((url) => {
        this.setState({ image: url });
      })
      .catch((error) => {
        this.setState({ image: "#" });
      });
  };

  getUserProfile() {
    db.collection("users")
      .where("email", "==", this.state.userId)
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          this.setState({
            docId: doc.id,
            name: doc.data().name,
            age: doc.data().age,
            phone: doc.data().phone,
            intro: doc.data().intro,
            address: doc.data().address,
            hobbies: doc.data().hobbies,
          });
        });
      });
  }

  componentDidMount() {
    this.fetchImage(this.state.userId);
    this.getLocationAsync();
    this.getUserProfile();
  }

  getLocationAsync = async () => {
    const { status } = await Permissions.askAsync(Permissions.LOCATION);

    if (status !== "granted") {
      this.setState({
        address: "Permission to access location was denied",
      });
    } else {
      this.setState({ hasLocationPermissions: true });
    }
    const location = await Location.getCurrentPositionAsync();
    this.setState({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });

    const place = await Location.reverseGeocodeAsync({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });

    this.setState({ address: place[0].city });
    // Geocoder.init("AIzaSyAwNswqOY_afdc8vNbxuQJlcEvKVYy0JjQ");
    // Geocoder.from(location.coords.latitude, location.coords.longitude)
    //   .then((json) => {
    //     var addressComponent = json.results[0].address_components[0];
    //     console.log(addressComponent);
    //     this.setState({ address: addressComponent });
    //   })
    //   .catch((error) => console.warn(error));
  };
  submitDetailsToDb = () => {
    db.collection("users").doc(this.state.docId).update({
      name: this.state.name,
      phone: this.state.phone,
      age: this.state.age,
      intro: this.state.intro,
      address: this.state.address,
      hobbies: this.state.hobbies,
      hobbiesLabels: this.state.hobbiesLabels,
    });
    Alert.alert("Profile Updated successfully");
  };
  render() {
    return (
      <View>
        <BottomSheet
          ref={this.state.bs}
          snapPoints={[330, 0]}
          renderContent={this.renderInner}
          renderHeader={this.renderHeader}
          initialSnap={1}
          callbackNode={this.state.fall}
          enabledGestureInteraction={true}
        />
        <Animated.View
          style={{
            margin: 5,
            opacity: Animated.add(0.1, Animated.multiply(this.state.fall, 1.0)),
          }}
        >
          <ScrollView>
            <MyHeader title="Edit Profile" navigation={this.props.navigation} />
            <StatusBar barStyle="dark-content" />
            <View
              style={{
                alignItems: "center",
                marginTop: 10,
                backgroundColor: "#00938702",
              }}
            >
              <Avatar
                rounded
                source={{
                  uri: this.state.image,
                }}
                size={"xlarge"}
                title="pic"
                onPress={() => this.state.bs.current.snapTo(0)}
                showEditButton
              />
            </View>

            <View style={styles.action}>
              <FontAwesome name="user-o" color={"black"} size={20} />
              <TextInput
                placeholder="Name"
                placeholderTextColor="#666666"
                autoCorrect={false}
                style={[
                  styles.textInput,
                  {
                    color: "black",
                  },
                ]}
                onChangeText={(val) => {
                  this.setState({
                    name: val,
                  });
                }}
                value={this.state.name}
              />
            </View>

            <View style={styles.action}>
              <Feather name="phone" color={"black"} size={20} />
              <TextInput
                placeholder="Phone"
                placeholderTextColor="#666666"
                keyboardType="number-pad"
                autoCorrect={false}
                style={[
                  styles.textInput,
                  {
                    color: "black",
                  },
                ]}
                onChangeText={(val) => {
                  this.setState({
                    phone: val,
                  });
                }}
                value={this.state.phone}
              />
            </View>
            <View style={styles.action}>
              <Feather name="calendar" color={"black"} size={20} />
              <TextInput
                placeholder="Age"
                placeholderTextColor="#666666"
                keyboardType="number-pad"
                autoCorrect={false}
                style={[
                  styles.textInput,
                  {
                    color: "black",
                  },
                ]}
                onChangeText={(val) => {
                  this.setState({
                    age: val,
                  });
                }}
                value={this.state.age}
              />
            </View>
            <View style={styles.action}>
              <FontAwesome name="envelope-o" color={"black"} size={20} />
              <TextInput
                placeholder="Introduction"
                placeholderTextColor="#666666"
                autoCorrect={false}
                style={[
                  styles.textInput,
                  {
                    color: "black",
                  },
                ]}
                onChangeText={(val) => {
                  this.setState({
                    intro: val,
                  });
                }}
                value={this.state.intro}
              />
            </View>
            <View
              style={[
                styles.action,
                {
                  width: "100%",
                  marginTop: 5,
                  marginBottom: 10,
                  flexDirection: "column",
                },
              ]}
            >
              <View style={[styles.action, { borderBottomWidth: 0 }]}>
                <FontAwesome name="globe" color={"black"} size={20} />
                <Text style={{ color: "#666666" }}>Pick your hobbies</Text>
              </View>

              <MultiselectDropdown
                textInputPlaceholderColor="#666666"
                data={[
                  { value: 1, label: "reading" },
                  { value: 2, label: "singing" },
                  { value: 3, label: "dancing" },
                  { value: 4, label: "collecting coins" },
                  { value: 5, label: "travelling" },
                  { value: 6, label: "writing" },
                ]}
                value={this.state.hobbies}
                onChange={(val) => {
                  this.setState({ hobbies: val });
                }}
                selectedItemViewStyle={{
                  backgroundColor: "#32867d",
                }}
                selectedItemTextStyle={{ color: "#fff" }}
                textInputStyle={{ color: "#32867d" }}
                itemContainerStyle={{ color: "#32867d" }}
              />
            </View>
            <View style={[styles.action, { marginTop: 20 }]}>
              <Icon name="map-marker-outline" color={"black"} size={20} />
              <TextInput
                placeholder="Address"
                placeholderTextColor="#666666"
                autoCorrect={false}
                style={[
                  styles.textInput,
                  {
                    color: "black",
                  },
                ]}
                value={this.state.address === "" ? " " : this.state.address}
                onChangeText={(val) => {
                  this.setState({
                    address: val,
                  });
                }}
              />
            </View>
            <TouchableOpacity
              style={styles.commandButton}
              onPress={() => {
                this.submitDetailsToDb();
              }}
            >
              <Text style={styles.panelButtonTitle}>Submit</Text>
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  commandButton: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: "black",
    alignItems: "center",
    marginTop: 10,
  },
  panel: {
    padding: 20,
    backgroundColor: "#FFFFFF",
    paddingTop: 20,
    // borderTopLeftRadius: 20,
    // borderTopRightRadius: 20,
    // shadowColor: '#000000',
    // shadowOffset: {width: 0, height: 0},
    // shadowRadius: 5,
    // shadowOpacity: 0.4,
  },
  header: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#333333",
    shadowOffset: { width: -1, height: -3 },
    shadowRadius: 2,
    shadowOpacity: 0.4,
    // elevation: 5,
    paddingTop: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  panelHeader: {
    alignItems: "center",
  },
  panelHandle: {
    width: 40,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#00000040",
    marginBottom: 10,
  },
  panelTitle: {
    fontSize: 27,
    height: 35,
  },
  panelSubtitle: {
    fontSize: 14,
    color: "gray",
    height: 30,
    marginBottom: 10,
  },
  panelButton: {
    padding: 13,
    borderRadius: 10,
    backgroundColor: "black",
    alignItems: "center",
    marginVertical: 7,
  },
  panelButtonTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "white",
  },
  action: {
    flexDirection: "row",
    marginTop: 10,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f2f2f2",
    paddingBottom: 5,
  },
  actionError: {
    flexDirection: "row",
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#FF0000",
    paddingBottom: 5,
  },
  textInput: {
    flex: 1,
    marginTop: Platform.OS === "ios" ? 0 : -12,
    paddingLeft: 10,
    color: "#05375a",
  },
});
