import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text, FlatList, Modal, Image, Alert, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import UnitSpecifics from './UnitSpecifics';

const FleetForm = ({ navigation }) => {
  const [UnitType, setUnitType] = useState('');
  const [UnitNumber, setUnitNumber] = useState('');
  const [Emergency, setEmergency] = useState('');
  const [Units, setUnits] = useState([]);
  const [imageLabel, setImageLabel] = useState('');
  const [enlargedImage, setEnlargedImage] = useState(null);
  const [enlargedImageVisible, setEnlargedImageVisible] = useState(false);
  const [isSpecificsModalVisible, setSpecificsModalVisible] = useState(false); // Modal visibility state
  const [selectedUnitId, setSelectedUnitId] = useState(null); 
  
  
  const handleAddUnit = () => {
    setUnits((prevUnits) => [
      ...prevUnits,
      {
        id: Math.random().toString(),
        UnitType,
        UnitNumber,
        Emergency,
        specifics: [],
        images: [],
      },
    ]);
    setUnitType('');
    setUnitNumber('');
    setEmergency('');
  };




  const handleImageUpload = (unitId) => {
    Alert.alert(
      'Upload Image',
      'Choose an option',
      [
        {
          text: 'Camera',
          onPress: () => selectImage(unitId, 'camera'),
        },
        {
          text: 'Photo Library',
          onPress: () => selectImage(unitId, 'library'),
        },
        { text: 'Cancel', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  const selectImage = async (unitId, type) => {
    let permissionResult;
  
    if (type === 'camera') {
      permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    } else {
      permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    }
  
    if (permissionResult.granted === false) {
      alert('Permission to access camera or photo library is required!');
      return;
    }
  
    let result;
    if (type === 'camera') {
      result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
    } else {
      result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
    }
  
    if (!result.canceled) {
      const uri = result.assets[0].uri;

  
      setImageLabel('');
      Alert.prompt(
        'Position',
        'Please specify a position for the image to be uploaded.',
        [
          { text: 'Cancel' },
          { text: 'OK', onPress: (text) => saveImageWithLabel(unitId, uri, text) },
        ],
        'plain-text',
        imageLabel
      );
    }
  };

  const saveImageWithLabel = (unitId, uri, label) => {
    if (label) {
      setUnits((prevUnits) =>
        prevUnits.map((unit) =>
          unit.id === unitId
            ? { ...unit, images: [...unit.images, { uri, label }] }
            : unit
        )
      );
    } else {
      alert('Please enter a Position.');
    }
  };

  const handleImageTap = (image) => {
    setEnlargedImage(image);
    setEnlargedImageVisible(true);
  };

  const handleAddSpecifics = (unitId) => {
    setSelectedUnitId(unitId); // Set the unit ID for which specifics are being added
    setSpecificsModalVisible(true); // Show the modal
  };

  const saveSpecifics = (unitId, newSpecifics) => {
    setUnits((prevUnits) =>
      prevUnits.map((unit) =>
        unit.id === unitId
          ? { ...unit, specifics: [...unit.specifics, ...newSpecifics] }
          : unit
      )
    );
    closeSpecificsModal(); // Close the modal
  };

  const closeSpecificsModal = () => {
    setSpecificsModalVisible(false);
    setSelectedUnitId(null); // Clear the selected unit ID
  };


  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <TextInput
          style={styles.input}
          placeholder="Unit Type"
          value={UnitType}
          onChangeText={setUnitType}
        />
        <TextInput
          style={styles.input}
          placeholder="Enter Unit Number"
          value={UnitNumber}
          onChangeText={setUnitNumber}
        />
      </View>
      <TextInput
        style={styles.input}
        placeholder="Emergency"
        value={Emergency}
        onChangeText={setEmergency}
      />

      <Button title="ADD" onPress={handleAddUnit} />

      <FlatList
        data={Units}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.previewCard}>
            <Text style={styles.previewText}>Unit Type: {item.UnitType}</Text>
            <Text style={styles.previewText}>Unit Number: {item.UnitNumber}</Text>
            <Text style={styles.previewText}>Emergency: {item.Emergency}</Text>
            
            <View style={styles.specificsList}>
  <Text style={styles.previewText}>Specifics:</Text>
  {item.specifics.length > 0 ? (
    <FlatList
      data={item.specifics}
      keyExtractor={(specific, index) => index.toString()} // Unique key for each item
      renderItem={({ item: specific, index }) => {
        // Alternate background color between gray and light gray
        const backgroundColor = index % 2 === 0 ? '#D3D3D3' : '#F0F0F0'; // Gray and Light Gray

        return (
          <View style={[styles.specificItem, { backgroundColor }]}>
            <Text style={styles.specificDetail}>Service: {specific.service}</Text>
            <Text style={styles.specificDetail}>Tread Depth: {specific.TreadDepth}</Text>
            <Text style={styles.specificDetail}>Tire Needed: {specific.tireNeeded}</Text>
            <Text style={styles.specificDetail}>
              Position: {specific.selectedPosition.join(", ") || "None"}
            </Text>
          </View>
        );
      }}
    />
  ) : (
    <Text style={styles.noSpecificsText}>No specifics added.</Text>
  )}
</View>
            
            {item.images.length > 0 && (
              <FlatList
                data={item.images}
                horizontal
                keyExtractor={(item, index) => `${item.uri}-${index}`}
                renderItem={({ item }) => (
                  <TouchableOpacity onPress={() => handleImageTap(item)}>
                    <Image source={{ uri: item.uri }} style={styles.imagePreview} />
                    <Text style={styles.imageLabel}>{item.label}</Text>
                  </TouchableOpacity>
                )}
              />
            )}
            <Button title="Add Specifics" onPress={() => handleAddSpecifics(item.id)} />
            <Button title="Upload Image" onPress={() => handleImageUpload(item.id)} />
          </View>
        )}
        style={styles.unitList}
      />
      <Modal
        visible={isSpecificsModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={closeSpecificsModal}
      >
        <UnitSpecifics
          saveSpecifics={(newSpecifics) => saveSpecifics(selectedUnitId, newSpecifics)}
          closeModal={closeSpecificsModal}
        />
      </Modal>

  
      <Modal
        visible={enlargedImageVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setEnlargedImageVisible(false)}
      >
        <View style={styles.enlargedImageOverlay}>
          <TouchableOpacity
            style={styles.enlargedImageClose}
            onPress={() => setEnlargedImageVisible(false)}
          >
            <Text style={styles.closeText}>X</Text>
          </TouchableOpacity>
          {enlargedImage && (
          <>
          <Image source={{ uri: enlargedImage.uri }} style={styles.enlargedImage} />
          <Text style={styles.enlargedImageLabel}>{enlargedImage.label}</Text>
        </>

          )}
          
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 4,
    width: '48%',
    paddingLeft: 8,
  },
  unitList: {
    marginTop: 16,
  },
  previewCard: {
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 4,
    backgroundColor: '#f9f9f9',
  },
  previewText: {
    fontSize: 16,
    marginBottom: 4,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 8,
  },
  modalInput: {
    width: '100%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 4,
    marginBottom: 16,
    paddingLeft: 8,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  imagePreview: {
    width: 100,
    height: 100,
    margin: 5,
    borderRadius: 8,
  },
  imageLabel: {
    textAlign: 'center',
    marginTop: 4,
    color: '#555',
  },
  enlargedImageOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  enlargedImage: { width: '90%', height: '70%', resizeMode: 'contain' },
  enlargedImageClose: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 20,
  },
  enlargedImageLabel: {  
  color: 'white',
  fontSize: 16,
  marginTop: 10,
  textAlign: 'center',
},
specificItem: {
  padding: 10,
  borderRadius: 4,
  marginBottom: 8,
},
  
});

export default FleetForm;
