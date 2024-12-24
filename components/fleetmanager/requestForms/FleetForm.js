import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert, FlatList, Modal } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import UnitSpecifics from './UnitSpecifics';
const FleetForm = () => {
  const DEFAULT_FLEET_NAME = 'Fleet';
  const [unitNumber, setUnitNumber] = useState('');
  const [unitType, setUnitType] = useState('Truck');
  const [emergency, setEmergency] = useState('Dropped Unit');
  const [fleetData, setFleetData] = useState([]);
  const [date, setDate] = useState(new Date());
  const [openUnitType, setOpenUnitType] = useState(false);
  const [openEmergency, setOpenEmergency] = useState(false);
  const [itemsUnitType, setItemsUnitType] = useState([
    { label: 'Truck', value: 'Truck' },
    { label: 'Trailer', value: 'Trailer' }
  ]);
  const [itemsEmergency, setItemsEmergency] = useState([
    { label: 'Dropped Unit', value: 'Dropped Unit' },
    { label: 'Leaving Soon', value: 'Leaving Soon' },
    { label: 'Driver Waiting', value: 'Driver Waiting' }
  ]);
  const [specificsModalVisible, setSpecificsModalVisible] = useState(false);
  const [currentUnitIndex, setCurrentUnitIndex] = useState(null);

  const formattedDate = date.toISOString().split('T')[0];
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
            units: [...fleet.units, { unitNumber, unitType, emergency, specifics: [] }],
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
          units: [{ unitNumber, unitType, emergency, specifics: [] }],
        },
      ]);
    }

    setUnitNumber('');
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{fleetName}</Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Select Unit Type:</Text>
        <View style={styles.pickerContainer}>
          <DropDownPicker
            open={openUnitType}
            value={unitType}
            items={itemsUnitType}
            setOpen={setOpenUnitType}
            setValue={setUnitType}
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
        <Text style={styles.label}>Select Emergency Status:</Text>
        <View style={styles.pickerContainer}>
          <DropDownPicker
            open={openEmergency}
            value={emergency}
            items={itemsEmergency}
            setOpen={setOpenEmergency}
            setValue={setEmergency}
            setItems={setItemsEmergency}
            style={styles.picker}
            placeholder="Select Emergency Status"
            dropDownStyle={styles.dropDown}
          />
        </View>
      </View>

      <TouchableOpacity style={styles.button} onPress={addUnit}>
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
            index,
          }))
        )}
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => (
          <View style={styles.unitCard}>
            <Text style={styles.unitText}>Unit: {item.unitNumber}</Text>
            <Text style={styles.unitText}>Type: {item.unitType}</Text>
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
            <TouchableOpacity
              style={styles.addSpecificsButton}
              onPress={() => handleAddSpecifics(item.index)}
            >
              <Text style={styles.addSpecificsButtonText}>Add Specifics</Text>
            </TouchableOpacity>
          </View>
        )}
      />

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
    marginBottom: 15,
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
    marginBottom: 10,
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
});

export default FleetForm;


