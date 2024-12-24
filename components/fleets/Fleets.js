import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Modal, Dimensions } from 'react-native';
import { getDocs, collection } from 'firebase/firestore';
import { db } from '../../Firebase';
import { ScrollView } from 'react-native-gesture-handler';

const Fleets = ({ navigation }) => {
  const [fleets, setFleets] = useState([]);
  const [selectedFleet, setSelectedFleet] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedLabel, setSelectedLabel] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const fetchFleets = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'fleets'));
        const fetchedFleets = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setFleets(fetchedFleets);
      } catch (error) {
        console.error('Error fetching fleets:', error);
      }
    };

    fetchFleets();
  }, []);

  const groupFleetsByDate = (fleets) => {
    const groupedFleets = fleets.reduce((acc, fleet) => {
      const fleetDate = new Date(fleet.createdAt.seconds * 1000).toLocaleDateString();
      if (!acc[fleetDate]) {
        acc[fleetDate] = [];
      }
      acc[fleetDate].push(fleet);
      return acc;
    }, {});

    return groupedFleets;
  };

  const renderImages = (images) => {
    return images.map((image, index) => (
      <TouchableOpacity key={index} onPress={() => handleImagePress(image.url, image.label)}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: image.url }} style={styles.imagePreview} />
          <Text style={styles.imageLabel}>{image.label || "No Label"}</Text>
        </View>
      </TouchableOpacity>
    ));
  };

  const handleImagePress = (imageUrl, label) => {
    setSelectedImage(imageUrl);
    setSelectedLabel(label);
    setModalVisible(true);
  };

  const renderUnits = (fleets) => {
    const groupedUnits = fleets.reduce((acc, fleet) => {
      fleet.units.forEach(unit => {
        const unitType = unit.UnitType || 'Unknown';
        if (!acc[unitType]) {
          acc[unitType] = [];
        }
        acc[unitType].push(unit);
      });
      return acc;
    }, {});

    return Object.keys(groupedUnits).map((unitType) => (
      <View key={unitType} style={styles.unitGroup}>
        <Text style={styles.unitGroupTitle}>{unitType}</Text>
        {groupedUnits[unitType].map((unit, index) => {
          const unitDone = unit.done; // Check if the unit is marked as done
          return (
            <View
              key={index}
              style={[
                styles.unitCard,
                unitDone && { backgroundColor: 'green' }, // Apply green background if the unit is done
              ]}
            >
              <Text style={styles.unitText}>Unit Number: {unit.UnitNumber}</Text>
              <Text style={styles.unitText}>Emergency: {unit.Emergency}</Text>
  
              <View style={styles.specificsContainer}>
                {unit.specifics.length > 0 ? (
                  unit.specifics.map((specific, specIndex) => (
                    <View key={specIndex} style={styles.specificItem}>
                      <Text style={styles.specificDetail}>Service: {specific.service}</Text>
                      <Text style={styles.specificDetail}>Tread Depth: {specific.TreadDepth}</Text>
                      <Text style={styles.specificDetail}>Tire Needed: {specific.tireNeeded}</Text>
                      <Text style={styles.specificDetail}>
                        Position: {specific.selectedPosition.join(", ") || "None"}
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text>No specifics available.</Text>
                )}
              </View>
  
              <View style={styles.imagesContainer}>
                {unit.images && unit.images.length > 0 ? renderImages(unit.images) : <Text>No images available</Text>}
              </View>
            </View>
          );
        })}
      </View>
    ));
  };

  const renderFleetsByDate = () => {
    const groupedFleets = groupFleetsByDate(fleets);
    return Object.keys(groupedFleets).map((date) => (
      <TouchableOpacity key={date} style={styles.fleetButton} onPress={() => setSelectedFleet(groupedFleets[date])}>
        <Text style={styles.fleetButtonText}>Fleet from {date}</Text>
      </TouchableOpacity>
    ));
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedImage(null);
    setSelectedLabel(null);
  };

  const exitFleetView = () => {
    setSelectedFleet(null);
  };

  return (
    <View style={styles.container}>
      <View style={styles.fleetButtonsContainer}>
        {renderFleetsByDate()}
      </View>

      {selectedFleet && (
        <View style={styles.fleetContainer}>
          <TouchableOpacity onPress={exitFleetView} style={styles.exitButton}>
            <Text style={styles.exitButtonText}>Exit Fleets</Text>
          </TouchableOpacity>
          <Text style={styles.fleetTitle}>Units for the selected fleet(s):</Text>
          <ScrollView>
            {renderUnits(selectedFleet)}
          </ScrollView>
        </View>
      )}

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.modalBackground} onPress={closeModal}>
            <View style={styles.modalContent}>
              <Image source={{ uri: selectedImage }} style={styles.enlargedImage} />
              {selectedLabel && <Text style={styles.modalLabel}>{selectedLabel}</Text>}
            </View>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  fleetButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  fleetButton: {
    marginRight: 10,
    marginBottom: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
  },
  fleetButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  fleetContainer: {
    marginBottom: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 16,
    backgroundColor: '#f9f9f9',
    height: 550,
  },
  fleetTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  unitGroup: {
    marginBottom: 20,
  },
  unitGroupTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  unitCard: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  unitText: {
    fontSize: 16,
    marginBottom: 6,
  },
  specificsContainer: {
    marginTop: 10,
  },
  specificItem: {
    marginBottom: 8,
  },
  specificDetail: {
    fontSize: 14,
    color: '#555',
  },
  imagesContainer: {
    marginTop: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  imageContainer: {
    margin: 5,
    alignItems: 'center',
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  imageLabel: {
    marginTop: 4,
    textAlign: 'center',
    color: '#555',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    maxWidth: '90%',
    maxHeight: '90%',
  },
  enlargedImage: {
    width: Dimensions.get('window').width - 40,
    height: 300,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  modalLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  exitButton: {
    alignSelf: 'flex-end',
    marginBottom: 10,
    backgroundColor: '#f44336',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 5,
  },
  exitButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default Fleets;
