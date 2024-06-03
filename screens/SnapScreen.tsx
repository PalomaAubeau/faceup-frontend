// @ts-nocheck
import React, { useState, useRef } from "react";
import { StyleSheet, TouchableOpacity, View, Text, Button } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useDispatch } from "react-redux";
import { addPhoto } from "../reducers/user";
import _FontAwesome from "react-native-vector-icons/FontAwesome";
import { useIsFocused } from "@react-navigation/native";

export default function SnapScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const isFocused = useIsFocused();
  const [facing, setFacing] = useState("back"); // pour paramétrer le bouton ‘Flip’
  const [torch, setTorch] = useState(false);
  let cameraRef: any = useRef(null); // pour pouvoir enregistrer la ref pour la fonction takePicture
  const FontAwesome = _FontAwesome as React.ElementType;
  const dispatch = useDispatch();

  if (!permission || !isFocused) {
    // En attente permission et/ou isFocused false: early return
    return <View />;
  }

  if (!permission.granted) {
    // Si la permission n’est pas ok.
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: "center" }}>
          We need your permission to show the camera
        </Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  const takePicture = async () => {
    const photo = await cameraRef.takePictureAsync({ quality: 0.3 });
    const formData = new FormData();

    formData.append("photoFromFront", {
      uri: photo.uri,
      name: "photo.jpg",
      type: "image/jpeg",
    });
    fetch("https://faceup-backend-nu.vercel.app/upload", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        dispatch(addPhoto(data.url));
      });
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing={facing}
        //ref={(ref) => (cameraRef = ref)}
        ref={(ref: any) => (cameraRef = ref)}
        enableTorch={torch}
      >
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() =>
              setFacing((current) => (current === "back" ? "front" : "back"))
            }
          >
            <FontAwesome name="rotate-right" size={25} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => setTorch(() => !torch)}
          >
            <FontAwesome
              name="flash"
              size={25}
              color={!torch ? "#ffffff" : "#e8be4b"}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.snapContainer}>
          <TouchableOpacity onPress={() => cameraRef && takePicture()}>
            <FontAwesome name="circle-thin" size={95} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  camera: {
    flex: 1,
  },
  buttonsContainer: {
    flex: 0.1,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginTop: 50,
    paddingLeft: 50,
    paddingRight: 50,
  },
  button: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    borderRadius: 50,
  },
  snapContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 25,
  },
});
