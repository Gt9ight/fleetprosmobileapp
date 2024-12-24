import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';

const UnitSpecifics = ({ onDone }) => {
  const [serviceNeeded, setServiceNeeded] = useState(null);
  const [treadDepth, setTreadDepth] = useState('');
  const [tireNeeded, setTireNeeded] = useState('');
  const [specificsList, setSpecificsList] = useState([]);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([
    { label: 'Flat Repair', value: 'Flat Repair' },
    { label: 'Replace', value: 'Replace' },
  ]);

  const handleAddSpecific = () => {
    if (!serviceNeeded || !treadDepth || !tireNeeded) {
      Alert.alert('Error', 'Please fill in all fields before adding.');
      return;
    }

    const newSpecific = { serviceNeeded, treadDepth, tireNeeded };
    setSpecificsList([...specificsList, newSpecific]);

    setServiceNeeded(null);
    setTreadDepth('');
    setTireNeeded('');
  };

  const handleSubmit = () => {
    if (specificsList.length === 0) {
      Alert.alert('Error', 'Please add at least one specific before submitting.');
      return;
    }

    onDone(specificsList);
  };

  return (
    <View style={styles.container}>
      <View><Text style={styles.SpecificsTitle}>Unit Specifics</Text></View>
      <Text style={styles.label}>Service Needed:</Text>
      <DropDownPicker
        open={open}
        value={serviceNeeded}
        items={items}
        setOpen={setOpen}
        setValue={setServiceNeeded}
        setItems={setItems}
        placeholder="Select a service"
        style={styles.dropdown}
        textStyle={styles.dropdownText}
        placeholderStyle={styles.placeholder}
      />

      <Text style={styles.label}>Tread Depth:</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter the tread depth"
        keyboardType="numeric"
        value={treadDepth}
        onChangeText={setTreadDepth}
      />

      <Text style={styles.label}>Tire Needed:</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter the tire needed"
        value={tireNeeded}
        onChangeText={setTireNeeded}
      />

      <TouchableOpacity style={styles.addButton} onPress={handleAddSpecific}>
        <Text style={styles.buttonText}>Add</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Added Specifics:</Text>
      <FlatList
        data={specificsList}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.specificCard}>
            <Text style={styles.specificText}>
              {index + 1}. Service: {item.serviceNeeded}
            </Text>
            <Text style={styles.specificText}>Tread Depth: {item.treadDepth}</Text>
            <Text style={styles.specificText}>Tire Needed: {item.tireNeeded}</Text>
          </View>
        )}
      />

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f4f4f4',
    flex: 1,
  },
  SpecificsTitle: {
    fontSize: 20,
    textAlign: 'center',
    marginTop: 50
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  dropdown: {
    marginBottom: 15,
    borderRadius: 8,
    borderColor: '#ccc',
  },
  dropdownText: {
    fontSize: 16,
  },
  placeholder: {
    color: '#999',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  specificCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  specificText: {
    fontSize: 14,
    color: '#333',
  },
});

export default UnitSpecifics;
