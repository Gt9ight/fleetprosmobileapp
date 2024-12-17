import React, { useState } from "react";
import { View, Text, TouchableOpacity, TextInput, Button, StyleSheet, FlatList } from "react-native";
import TruckPositionSelect from "./TruckPositionSelector";
const UnitSpecifics = ({ closeModal, saveSpecifics }) => {
    const [service, setService] = useState('')
    const [TreadDepth, setTreadDepth] = useState('')
    const [tireNeeded, setTireNeeded] = useState('')
    const [selectedPosition, setSelectePosition] = useState([]);
    const [specificsList, setSpecificsList] = useState([]);
    const handleAddSpecific = () => {
      if (!service || !TreadDepth || !tireNeeded) {
        alert("Please fill in all fields.");
        return;
      }
  
      const newSpecific = {
        service,
        TreadDepth,
        tireNeeded,
        selectedPosition,
      };
  
      setSpecificsList((prevList) => [...prevList, newSpecific]);
  
      // Clear the form
      setService('');
      setTreadDepth('');
      setTireNeeded('');
      setSelectePosition([]);
    };
  
    const handleDone = () => {
      saveSpecifics(specificsList); // Pass the specifics list back to FleetForm
      closeModal(); // Close the modal
      setSpecificsList([]); // Clear the specifics list
    };
  
    return (
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Add Specifics</Text>
          <TouchableOpacity onPress={() => navigation.navigate('truckpositionSelect')}>
            <Text>Position Select</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.modalInput}
            placeholder="Flat or Replace"
            value={service}
            onChangeText={setService}
          />
          <TextInput
            style={styles.modalInput}
            placeholder="Enter TreadDepth"
            value={TreadDepth}
            onChangeText={setTreadDepth}
          />
          <TextInput
            style={styles.modalInput}
            placeholder="Enter Tire Needed"
            value={tireNeeded}
            onChangeText={setTireNeeded}
          />
          <View style={styles.modalButtons}>
            <Button title="Done" onPress={handleDone} color="green" />
            <Button title="Add" onPress={handleAddSpecific} color="blue" />
         </View>

{/* Display the list of specifics added */}
<FlatList
  data={specificsList}
  keyExtractor={(item, index) => index.toString()}
  renderItem={({ item, index }) => {
    // Alternate background color between light gray and dark gray
    const backgroundColor = index % 2 === 0 ? '#D3D3D3' : '#A9A9A9'; // Light gray and Dark gray
    
    return (
      <View style={[styles.specificItem, { backgroundColor }]}>
        <Text>Service: {item.service}</Text>
        <Text>Tread Depth: {item.TreadDepth}</Text>
        <Text>Tire Needed: {item.tireNeeded}</Text>
        <Text>Position: {item.selectedPosition.join(", ") || "None"}</Text>
      </View>
    );
  }}
/>


</View>
</View>
);
};
const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    padding: 16,
    backgroundColor: "white",
    borderRadius: 8,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 8,
  },
  modalInput: {
    width: "100%",
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 4,
    marginBottom: 16,
    paddingLeft: 8,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  specificItem: {
    padding: 10,
    margin: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    width: 200,
    textAlign: 'center',  // Horizontal text alignment
    justifyContent: 'center', // Vertical alignment of children
    alignItems: 'center', // Centers the content horizontally inside the container
  
  }
});
  
  export default UnitSpecifics;