import React, { useRef } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  StatusBar,
  Platform,
  FlatList,
} from "react-native";
import {
  ImageHeaderScrollView,
  TriggeringView,
} from "react-native-image-header-scroll-view";
import db from "../config";
import * as Animatable from "react-native-animatable";

import FontAwesome from "react-native-vector-icons/FontAwesome";
import firebase from "firebase";
import MyHeader from "../components/MyHeader";
import { Card, ListItem, Icon } from "react-native-elements";

const MIN_HEIGHT = Platform.OS === "ios" ? 50 : 55;
const MAX_HEIGHT = 250;

export default class ShowProfile extends React.Component {
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
      allDetails: [],
    };
  }
  getUserDetails() {
    var details = [];
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
            allDetails: [
              { detailName: "Name: ", detailValue: doc.data().name },

              { detailName: "Age: ", detailValue: doc.data().age },
              { detailName: "Phone: ", detailValue: doc.data().phone },
              { detailName: "Introduction: ", detailValue: doc.data().intro },
              { detailName: "Address: ", detailValue: doc.data().address },
              {
                detailName: "Hobbies: ",
                detailValue: doc.data().hobbies,
              },
            ],
          });
        });
      });
  }
  componentDidMount() {
    this.getUserDetails();
    this.fetchImage(this.state.userId);
  }
  render() {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />

        <ImageHeaderScrollView
          maxHeight={MAX_HEIGHT}
          minHeight={MIN_HEIGHT}
          maxOverlayOpacity={0.6}
          minOverlayOpacity={0.3}
          renderHeader={() => (
            <Image source={{ uri: this.state.image }} style={styles.image} />
          )}
          renderForeground={() => (
            <View style={styles.titleContainer}>
              <Text style={styles.imageTitle}>{this.state.name}</Text>
            </View>
          )}
          renderFixedForeground={() => (
            <Animatable.View style={styles.navTitleView}>
              <Text style={styles.navTitle}>{this.state.userId}</Text>
            </Animatable.View>
          )}
        >
          <TriggeringView style={styles.section}>
            <View>
              <Text style={styles.title}>Overview</Text>
            </View>
          </TriggeringView>

          <View style={styles.section}>
            {this.state.allDetails.length === 0 ? (
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text style={{ fontSize: 25 }}>You have no details</Text>
              </View>
            ) : (
              <FlatList
                keyExtractor={this.keyExtractor}
                data={this.state.allDetails}
                renderItem={this.renderItem}
              />
            )}
          </View>
        </ImageHeaderScrollView>
      </View>
    );
  }
  keyExtractor = (item, index) => index.toString();

  renderItem = (data) => (
    <Card>
      <ListItem>
        <ListItem.Content>
          <View style={styles.subtitleView}>
            <ListItem.Title>{data.item.detailName}</ListItem.Title>

            <ListItem.Subtitle>{data.item.detailValue}</ListItem.Subtitle>
          </View>
        </ListItem.Content>
      </ListItem>
    </Card>
  );
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
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    height: MAX_HEIGHT,
    width: Dimensions.get("window").width,
    alignSelf: "stretch",
    resizeMode: "cover",
  },
  title: {
    fontSize: 20,
    color: "#fff",
  },
  name: {
    fontWeight: "bold",
  },
  section: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#cccccc",
    backgroundColor: "#32867d",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  sectionContent: {
    fontSize: 16,
    textAlign: "justify",
  },
  categories: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    flexWrap: "wrap",
  },
  categoryContainer: {
    flexDirection: "row",
    backgroundColor: "#FF6347",
    borderRadius: 20,
    margin: 10,
    padding: 10,
    paddingHorizontal: 15,
  },
  category: {
    fontSize: 14,
    color: "#fff",
    marginLeft: 10,
  },
  titleContainer: {
    flex: 1,
    alignSelf: "stretch",
    justifyContent: "center",
    alignItems: "center",
  },
  imageTitle: {
    color: "white",
    backgroundColor: "transparent",
    fontSize: 24,
  },
  navTitleView: {
    height: MIN_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? 40 : 5,
    opacity: 0,
  },
  navTitle: {
    color: "white",
    fontSize: 18,
    backgroundColor: "transparent",
  },
  sectionLarge: {
    minHeight: 300,
  },
  subtitleView: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 5,
  },
});
