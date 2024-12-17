import React, { useState } from 'react';
import { View, Image, TouchableOpacity, StyleSheet, Text } from 'react-native';
import TrailerpositionImage from './Trailer.png'; 

const TrailerPositionSelect = () => {
  const [selectedTires, setSelectedTires] = useState([]); // Store selected tires in an array

  // Define tire positions with updated side-by-side positioning for front tires
  const tirePositions = [
    { id: 'leftFrontIn', label: 'Left Front In', position: { bottom: 229, left: 41.5 } },
    { id: 'leftFrontOut', label: 'Left Front Out', position: { bottom: 229, left: 87.5 } },
    { id: 'rightFrontIn', label: 'Right Front In', position: { bottom: 229, right: 43 } },
    { id: 'rightFrontOut', label: 'Right Front Out', position: { bottom: 229, right: 90 } },
    { id: 'leftRearIn', label: 'Left Rear In', position: { bottom: 90, left: 41.5 } },
    { id: 'leftRearOut', label: 'Left Rear Out', position: { bottom: 90, left: 87.5 } },
    { id: 'rightRearIn', label: 'Right Rear In', position: { bottom: 90, right: 43.5 } },
    { id: 'rightRearOut', label: 'Right Rear Out', position: { bottom: 90, right: 89.5 } },
  ];

  // Function to handle tire selection and toggle selection
  const handleTrailerTirePress = (tire) => {
    setSelectedTires((prevSelectedTires) => {
      if (prevSelectedTires.some((selectedTire) => selectedTire.id === tire.id)) {
        // If tire is already selected, deselect it
        return prevSelectedTires.filter((selectedTire) => selectedTire.id !== tire.id);
      } else {
        // If tire is not selected, add it to the selected list
        return [...prevSelectedTires, tire];
      }
    });
    console.log(`Selected tires: ${selectedTires.map((tire) => tire.label).join(', ')}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.PositionTitleText}>Select Position(s)</Text>
      <Image source={TrailerpositionImage} style={styles.image} />
      
      {/* Overlay clickable areas for each tire */}
      {tirePositions.map((tire) => (
        <TouchableOpacity
          key={tire.id}
          style={[
            styles.tireButton,
            tire.position,
            {
              width: 35.5,
              height: 123,
              borderRadius: 25,
              backgroundColor: selectedTires.some((selectedTire) => selectedTire.id === tire.id)
                ? 'green' // If tire is selected, make it green
                : 'rgba(0, 0, 0, 0.7)', // Otherwise keep the default color
            },
          ]}
          onPress={() => handleTrailerTirePress(tire)}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  image: {
    width: 704,
    height: 704,
    resizeMode: 'contain',
  },
  tireButton: {
    position: 'absolute',
  },
  PositionTitleText: {
    fontSize: 20,
    margin: 10,
  },
});

export default TrailerPositionSelect;
