import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Modal, Dimensions, FlatList, ScrollView } from 'react-native';
import { getDocs, collection } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../Firebase';
import * as Progress from 'react-native-progress'; 

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
                    const imageRef = ref(storage, image.uri);
                    const imageUrl = await getDownloadURL(imageRef);
                    return { ...image, uri: imageUrl };
                  } catch (error) {
                    console.error('Error fetching image URL:', error);
                    return image;
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
    setExpandedFleet(expandedFleet === fleetName ? null : fleetName);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Fleets</Text>
      <FlatList
        data={fleetData}
        keyExtractor={(item, index) => `${item.fleetName}-${index}`}
        renderItem={({ item }) => {
          const totalUnits = item.units.length;
          const completedUnits = item.units.filter((unit) => unit.done).length;
          const progress = totalUnits > 0 ? completedUnits / totalUnits : 0;
          const progressPercentage = Math.round(progress * 100);

          return (
            <View style={styles.fleetCard}>
              <TouchableOpacity onPress={() => toggleFleetDetails(item.fleetName)}>
                <View style={styles.fleetHeader}>
                  <Text style={styles.fleetName}>{item.fleetName}</Text>
                  <Text style={styles.unitCount}>
                    {completedUnits}/{totalUnits} Units Completed
                  </Text>
                </View>
                {/* Progress Bar */}
                <View style={styles.progressContainer}>
                  <Progress.Bar 
                    progress={progress} 
                    width={null} 
                    color="#28d75c" 
                    borderWidth={1} 
                    height={10} 
                    borderRadius={5}
                    style={styles.progressBar}
                  />
                  <Text style={styles.progressPercentage}>{progressPercentage}%</Text>
                </View>
              </TouchableOpacity>
              {expandedFleet === item.fleetName && (
                
                <FlatList
                  data={item.units}
                  keyExtractor={(unit, index) => `unit-${index}`}
                  renderItem={({ item: unit }) => (
                    <View style={unit.done ? styles.unitCardDone : styles.unitCard}>
                      <Text style={styles.unitText}><Text style={styles.BoldText}>Unit Type:</Text> {unit.unitType}</Text>
                      <Text style={styles.unitText}><Text style={styles.BoldText}>Unit #:</Text> {unit.unitNumber}</Text>
                      <Text style={styles.unitText}><Text style={styles.BoldText}>Priority:</Text> {unit.emergency}</Text>
                      <Text style={styles.BoldText}>Specifics</Text>
                      {unit.specifics.length > 0 ? (
                        unit.specifics.map((specific, i) => (
                          <Text key={i} style={styles.unitText}>
                            - Service: {specific.serviceNeeded}, Tread Depth: {specific.treadDepth}, Tire Needed: {specific.tireNeeded}
                          </Text>
                        ))
                      ) : (
                        <Text style={styles.unitText}>No specifics added</Text>
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
                        <Text style={styles.unitText}>No Images Uploaded</Text>
                      )}
                    </View>
                  )}
                />
              )}
            </View>
          );
        }}
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
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  progressBar: {
    flex: 1,
    marginBottom: 10,
  },
  progressPercentage: {
    marginLeft: 10,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#343a40',
  },
  unitCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  unitCardDone: {
    backgroundColor: '#28d75c',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  unitText: {
    fontSize: 14,
    marginBottom: 5,
  },
  BoldText: {
    color: 'black',
    fontWeight: 'bold',
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
});

export default Fleets;

