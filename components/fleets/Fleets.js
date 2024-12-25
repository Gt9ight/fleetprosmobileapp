import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Modal, Dimensions, FlatList, ScrollView } from 'react-native';
import { getDocs, collection } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../Firebase';


const Fleets = ({ navigation }) => {
  const [fleetData, setFleetData] = useState([]);
  const [expandedFleet, setExpandedFleet] = useState(null); // Track the expanded fleet

  // Fetch fleet data from Firebase
  const fetchFleetData = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'fleets'));
      const fleets = querySnapshot.docs.map((doc) => doc.data());
  
      // Group fleets by fleetName
      const groupedFleets = fleets.reduce((acc, fleet) => {
        const existingFleet = acc.find((f) => f.fleetName === fleet.fleetName);
  
        if (existingFleet) {
          // Merge units if the fleetName matches
          existingFleet.units = [...existingFleet.units, ...fleet.units];
        } else {
          acc.push({ ...fleet });
        }
        return acc;
      }, []);
  
      // Fetch image URLs for each unit in grouped fleets
      const fleetsWithImages = await Promise.all(
        groupedFleets.map(async (fleet) => {
          const updatedUnits = await Promise.all(
            fleet.units.map(async (unit) => {
              if (unit.images && unit.images.length > 0) {
                const imagePromises = unit.images.map(async (image) => {
                  try {
                    const imageRef = ref(storage, image.uri); // Assuming image.uri is the path in Firebase Storage
                    const imageUrl = await getDownloadURL(imageRef);
                    return { ...image, uri: imageUrl }; // Replace uri with the download URL
                  } catch (error) {
                    console.error('Error fetching image URL:', error);
                    return image; // Return the original image if there is an error
                  }
                });
  
                unit.images = await Promise.all(imagePromises);
              }
              return unit;
            })
          );
  
          return { ...fleet, units: updatedUnits };
        })
      );
  
      setFleetData(fleetsWithImages);
    } catch (error) {
      console.error('Error fetching fleet data:', error);
    }
  };

  useEffect(() => {
    fetchFleetData();
  }, []);

  const toggleFleetDetails = (fleetName) => {
    setExpandedFleet(expandedFleet === fleetName ? null : fleetName); // Toggle visibility
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Fleets</Text>
      <FlatList
        data={fleetData}
        keyExtractor={(item, index) => `${item.fleetName}-${index}`}
        renderItem={({ item }) => (
          <View style={styles.fleetCard}>
            <TouchableOpacity onPress={() => toggleFleetDetails(item.fleetName)}>
              <View style={styles.fleetHeader}>
                <Text style={styles.fleetName}>{item.fleetName}</Text>
                <Text style={styles.unitCount}>
                  {item.units.length} {item.units.length === 1 ? 'Unit' : 'Units'}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Show fleet details if this fleet is expanded */}
            {expandedFleet === item.fleetName && (
  <FlatList
  data={item.units}
  keyExtractor={(unit, index) => `unit-${index}`}
  renderItem={({ item: unit }) => {
    // Check if unit is done
    const unitStyle = unit.done ? styles.unitCardDone : styles.unitCard;
    const unitTextStyle = unit.done ? styles.unitTextDone : styles.unitText; 

    return (
      <View style={unitStyle}>
        <Text style={unitTextStyle}><Text style={styles.BoldText}>Unit Type:</Text> {unit.unitType}</Text>
        <Text style={unitTextStyle}><Text style={styles.BoldText}>Unit #:</Text> {unit.unitNumber}</Text>
        <Text style={unitTextStyle}><Text style={styles.BoldText}>Priority:</Text>{unit.emergency}</Text>
        <Text style={styles.BoldText}>Specifics</Text>
        {unit.specifics.length > 0 ? (
          unit.specifics.map((specific, i) => (
            <Text key={i} style={unitTextStyle}>
              - Service: {specific.serviceNeeded}, Tread Depth: {specific.treadDepth}, Tire Needed: {specific.tireNeeded}
            </Text>
          ))
        ) : (
          <Text style={unitTextStyle}>No specifics added</Text>
        )}
        {unit.images.length > 0 ? (
          <ScrollView horizontal={true} style={styles.imagesRow}>
            {unit.images.map((image, index) => (
              <View key={index} style={styles.imageContainer}>
                <Image source={{ uri: image.uri }} style={styles.unitImage} />
                <Text style={styles.imageLabel}>{image.label}</Text>
              </View>
            ))}
          </ScrollView>
        ) : (
          <Text style={unitTextStyle}>No Images Uploaded</Text>
        )}
      </View>
    );
  }}
/>
            )}
          </View>
        )}
      />
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
  fleetCard: {
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
  fleetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fleetName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#343a40',
  },
  unitCount: {
    fontSize: 14,
    color: '#6c757d',
  },
  unitCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  unitCardDone: {
    backgroundColor: '#28d75c', // Green background for done units
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  unitText: {
    fontSize: 14,
    marginBottom: 5,
  },

  imagesRow: {
    flexDirection: 'row',
    marginTop: 10,
    paddingHorizontal: 5,
  },
  imageContainer: {
    alignItems: 'center',
    marginRight: 10,
  },
  unitImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  imageLabel: {
    marginTop: 5,
    fontSize: 12,
    textAlign: 'center',
  },
  BoldText: {
    color: 'black',
  }
});

export default Fleets;

