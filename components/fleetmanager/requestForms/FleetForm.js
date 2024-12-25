import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert, FlatList, Modal,Image, ScrollView } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import UnitSpecifics from './UnitSpecifics';
import * as ImagePicker from 'expo-image-picker';
import { db, storage } from '../../../Firebase';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc } from 'firebase/firestore';
const FleetForm = () => {
  const DEFAULT_FLEET_NAME = 'Fleet';
  const [unitNumber, setUnitNumber] = useState('');
  const [unitType, setUnitType] = useState('Truck');
  const [emergency, setEmergency] = useState('Dropped Unit');
  const [fleetData, setFleetData] = useState([]);
  const [date, setDate] = useState(new Date());
  const [openUnitType, setOpenUnitType] = useState(false);
  const [openEmergency, setOpenEmergency] = useState(false);
  const [unitTypeValue, setUnitTypeValue] = useState(null);
  const [itemsUnitType, setItemsUnitType] = useState([
  
    { label: 'Truck', value: 'Truck' },
    { label: 'Trailer', value: 'Trailer' }
  ]);
  const [emergencyValue, setEmergencyValue] = useState(null);
  const [itemsEmergency, setItemsEmergency] = useState([
   
    { label: 'Dropped Unit', value: 'Dropped Unit' },
    { label: 'Leaving Soon', value: 'Leaving Soon' },
    { label: 'Driver Waiting', value: 'Driver Waiting' }
  ]);
  const [specificsModalVisible, setSpecificsModalVisible] = useState(false);
  const [currentUnitIndex, setCurrentUnitIndex] = useState(null);
  const [imageLabel, setImageLabel] = useState('');

  const formattedDate = date.toLocaleDateString('en-CA')
  const fleetName = `${DEFAULT_FLEET_NAME} ${formattedDate}`;

  const addUnit = () => {
    if (!unitNumber) {
      Alert.alert('Validation Error', 'Please enter Unit Number.');
      return;
    }

    const existingFleet = fleetData.find((fleet) => fleet.fleetName === fleetName);

    if (existingFleet) {
      const updatedFleetData = fleetData.map((fleet) => {
        if (fleet.fleetName === fleetName) {
          return {
            ...fleet,
            units: [...fleet.units, { unitNumber, unitType: unitTypeValue, emergency: emergencyValue, specifics: [], images: [] }],
          };
        }
        return fleet;
      });
      setFleetData(updatedFleetData);
    } else {
      setFleetData([
        ...fleetData,
        {
          fleetName,
          units: [{ unitNumber, unitType: unitTypeValue, emergency: emergencyValue, specifics: [], images: [] }],
        },
      ]);
    }

    setUnitNumber('');
    setEmergencyValue('');
    setUnitTypeValue('');
};

  const handleAddSpecifics = (index) => {
    setCurrentUnitIndex(index);
    setSpecificsModalVisible(true);
  };

  const handleSpecificsDone = (specifics) => {
    if (currentUnitIndex !== null) {
      const updatedFleetData = fleetData.map((fleet) => {
        if (fleet.fleetName === fleetName) {
          return {
            ...fleet,
            units: fleet.units.map((unit, index) =>
              index === currentUnitIndex
                ? { ...unit, specifics: [...unit.specifics, ...specifics] }
                : unit
            ),
          };
        }
        return fleet;
      });
      setFleetData(updatedFleetData);
    }
    setSpecificsModalVisible(false);
  };

  const handleImageUpload = async (unitIndex) => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    const cameraPermissionResult = await ImagePicker.requestCameraPermissionsAsync();
  
    if (!permissionResult.granted || !cameraPermissionResult.granted) {
      Alert.alert('Permission Denied', 'You need to allow permissions to upload an image.');
      return;
    }
  
    Alert.alert(
      'Upload Image',
      'Choose an option:',
      [
        {
          text: 'Camera',
          onPress: async () => {
            const result = await ImagePicker.launchCameraAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              quality: 1,
            });
            if (!result.canceled) {
              promptForLabel(unitIndex, result.assets[0].uri);
            }
          },
        },
        {
          text: 'Photo Library',
          onPress: async () => {
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              quality: 1,
            });
            if (!result.canceled) {
              promptForLabel(unitIndex, result.assets[0].uri);
            }
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };
  
  const promptForLabel = (unitIndex, uri) => {
    Alert.prompt(
      'Add Label',
      'Enter a label for the image:',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: (label) => {
            updateImage(unitIndex, uri, label);
          },
        },
      ],
      'plain-text'
    );
  };
  
  const updateImage = async (unitIndex, uri, label) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
  
      const imageRef = ref(storage, `images/${new Date().toISOString()}_${unitIndex}.jpg`);

      await uploadBytes(imageRef, blob);
  
      const imageUrl = await getDownloadURL(imageRef);
  
      const updatedFleetData = fleetData.map((fleet) => {
        if (fleet.fleetName === fleetName) {
          const updatedUnits = fleet.units.map((unit, index) => {
            if (index === unitIndex) {
              const updatedUnit = {
                ...unit,
                images: [...unit.images, { uri: imageUrl, label }],  // Save the URL instead of the local URI
              };
              return updatedUnit;
            }
            return unit;
          });
  
          return {
            ...fleet,
            units: updatedUnits,
          };
        }
        return fleet;
      });
      setFleetData(updatedFleetData);
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  const deleteUnit = (fleetName, unitIndex) => {
    const updatedFleetData = fleetData.map((fleet) => {
      if (fleet.fleetName === fleetName) {
        const updatedUnits = fleet.units.filter((_, index) => index !== unitIndex);
        return {
          ...fleet,
          units: updatedUnits,
        };
      }
      return fleet;
    });
    setFleetData(updatedFleetData);
  };

  const submitFleet = async () => {
    try {
      const fleetRef = collection(db, 'fleets');
      
      // Upload all images for the units before submitting fleet data
      const updatedFleetData = await Promise.all(
        fleetData.flatMap(async (fleet) => {
          const updatedUnits = await Promise.all(
            fleet.units.map(async (unit) => {
              const updatedImages = await Promise.all(
                unit.images.map(async (image) => {
                  if (image.uri.startsWith('http')) {
                    return image;  // If already a URL, no need to upload
                  }
                  try {
                    const response = await fetch(image.uri);
                    const blob = await response.blob();
  
                    const imageRef = ref(storage, `images/${new Date().toISOString()}.jpg`);
                    await uploadBytes(imageRef, blob);
  
                    const imageUrl = await getDownloadURL(imageRef);
                    return { ...image, uri: imageUrl }; // Update URI with the download URL
                  } catch (error) {
                    console.error('Error uploading image:', error);
                    return image;
                  }
                })
              );
              return { ...unit, images: updatedImages };
            })
          );
          return { ...fleet, units: updatedUnits };
        })
      );
  
      // After uploading images, submit the fleet data to Firestore
      await addDoc(fleetRef, {
        fleetName,
        units: updatedFleetData.flatMap((fleet) => fleet.units),
        createdAt: new Date(),
      });
  
      Alert.alert('Success', 'Fleet data submitted successfully!');
    } catch (error) {
      Alert.alert('Error', 'There was an error submitting the fleet data.');
      console.error(error);
    }
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{fleetName}</Text>

      <View style={styles.formGroup}>     
        <View style={styles.pickerContainer}>
          <DropDownPicker
            open={openUnitType}
            value={unitTypeValue}
            items={itemsUnitType}
            setOpen={setOpenUnitType}
            setValue={setUnitTypeValue}
            setItems={setItemsUnitType}
            style={styles.picker}
            placeholder="Select Unit Type"
            dropDownStyle={styles.dropDown}
          />
        </View>
      </View>

      <View style={styles.formGroup}>
        <TextInput
          style={styles.input}
          value={unitNumber}
          onChangeText={setUnitNumber}
          placeholder="Enter Unit Number"
          placeholderTextColor="#6c757d"
        />
      </View>
      <View style={styles.formGroup}>      
        <View style={styles.pickerContainer}>
          <DropDownPicker
            open={openEmergency}
            value={emergencyValue}
            items={itemsEmergency}
            setOpen={setOpenEmergency}
            setValue={setEmergencyValue}
            setItems={setItemsEmergency}
            style={styles.picker}
            placeholder="Select Emergency Status"
            dropDownStyle={styles.dropDown}
          />
        </View>
      </View>
      <TouchableOpacity style={styles.AddUnitbutton} onPress={addUnit}>
        <Text style={styles.buttonText}>Add Unit</Text>
      </TouchableOpacity>

      <Text style={styles.subTitle}>Units</Text>
      <FlatList
  data={fleetData.flatMap((fleet) =>
    fleet.units.map((unit, index) => ({
      key: `${fleet.fleetName}-${index}`,
      unitNumber: unit.unitNumber,
      unitType: unit.unitType,
      emergency: unit.emergency,
      specifics: unit.specifics,
      images: unit.images, // Include the image URI
      imageLabel: unit.imageLabel,
      fleetName: fleet.fleetName,
      index,
    }))
  )}
  keyExtractor={(item) => item.key}
  renderItem={({ item }) => (
    <View style={styles.unitCard}>
      <Text style={styles.unitText}>Type: {item.unitType}</Text>
      <Text style={styles.unitText}>Unit: {item.unitNumber}</Text>
      <Text style={styles.unitText}>Emergency: {item.emergency}</Text>
      <Text style={styles.unitText}>Specifics:</Text>
      {item.specifics.length > 0 ? (
        item.specifics.map((specific, i) => (
          <Text key={i} style={styles.unitText}>
            - Service: {specific.serviceNeeded}, Tread Depth: {specific.treadDepth}, Tire Needed: {specific.tireNeeded}
          </Text>
        ))
      ) : (
        <Text style={styles.unitText}>No specifics added</Text>
      )}

{item.images.length > 0 ? (
        <ScrollView horizontal={true} style={styles.imagesRow}>
          {item.images.map((image, index) => (
            <View key={index} style={styles.imageContainer}>
              <Image source={{ uri: image.uri }} style={styles.unitImage} />
              <Text style={styles.imageLabel}>{image.label}</Text>
            </View>
          ))}
        </ScrollView>
      ) : (
        <Text style={styles.unitText}>No Image Uploaded</Text>
      )}
      <TouchableOpacity
        style={styles.addSpecificsButton}
        onPress={() => handleAddSpecifics(item.index)}
      >
        <Text style={styles.addSpecificsButtonText}>Add Specifics</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.uploadButton}
        onPress={() => handleImageUpload(item.index)}
      >
        <Text style={styles.uploadButtonText}>Upload Image</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteUnit(item.fleetName, item.index)}
      >
        <Text style={styles.deleteButtonText}>X</Text>
      </TouchableOpacity>
    </View>
  )}
/>
<TouchableOpacity style={styles.button} onPress={submitFleet}>
        <Text style={styles.buttonText}>Submit Fleet</Text>
      </TouchableOpacity>
      <Modal
        visible={specificsModalVisible}
        animationType="slide"
        onRequestClose={() => setSpecificsModalVisible(false)}
      >
        <UnitSpecifics onDone={handleSpecificsDone} />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#343a40',
    marginBottom: 20,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 19,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ced4da',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    color: '#343a40',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#495057',
    marginBottom: 5,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  picker: {
    height: 50,
    color: '#343a40',
    backgroundColor: '#ffffff',
  },
  dropDown: {
    backgroundColor: '#ffffff',
    borderColor: '#ced4da',
    borderRadius: 8,
    marginTop: 10,
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 15,
  },
  AddUnitbutton: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  subTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#495057',
    marginVertical: 15,
  },
  unitCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  unitText: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 5,
  },
  addSpecificsButton: {
    backgroundColor: '#28a745',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  addSpecificsButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  doneButton: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 15,
    marginHorizontal: 20,
  },
  doneButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  imagesRow: {
    flexDirection: 'row', // Align images in a row
    marginTop: 10,
    paddingHorizontal: 5,
  },
  imageContainer: {
    alignItems: 'center',
    marginRight: 10, // Space between images
  },
  unitImage: {
    width: 100, // Width of the image
    height: 100, // Height of the image
    borderRadius: 8, // Rounded corners
  },
  imageLabel: {
    marginTop: 5,
    fontSize: 12,
    textAlign: 'center',
    color: '#6c757d',
  },
  uploadButton: {
    backgroundColor: '#007bff',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  uploadButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  deleteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#dc3545',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  deleteButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 15,
  },
  
});

export default FleetForm;


