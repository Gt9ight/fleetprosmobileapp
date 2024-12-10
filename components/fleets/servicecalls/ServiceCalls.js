import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import { getDocs, collection } from 'firebase/firestore';
import { db } from '../../../Firebase'; // Make sure to adjust this path based on your project structure

const ServiceCalls = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch data from Firestore when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'serviceCalls'));
        const fetchedData = querySnapshot.docs.map(doc => doc.data());
        setData(fetchedData);
      } catch (error) {
        console.error('Error fetching data: ', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <Text>Loading...</Text>;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {data.map((item, index) => (
        <View key={index} style={styles.card}>
          <Text style={styles.cardTitle}>Service Call {index + 1}</Text>
          <Text style={styles.cardText}>Unit Type: {item.question1_1}</Text>
          <Text style={styles.cardText}>Unit Number: {item.question1_2}</Text>
          <Text style={styles.cardText}>Urgency: {item.question1_3}</Text>
          <Text style={styles.cardText}>Position: {item.question2_1}</Text>
          <Text style={styles.cardText}>Specifics: {item.question2_2}</Text>
          <Text style={styles.cardText}>Tread Depth: {item.question2_3}</Text>
          <Text style={styles.cardText}>Tire Needed: {item.question2_4}</Text>

          {/* Display the uploaded image if exists */}
          {item.imageUrl && (
            <View style={styles.imagePreview}>
              <Image source={{ uri: item.imageUrl }} style={styles.image} />
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  cardText: {
    fontSize: 16,
    marginBottom: 5,
  },
  imagePreview: {
    marginTop: 15,
    alignItems: 'center',
  },
  image: {
    width: 100,
    height: 100,
    resizeMode: 'cover',
  },
});

export default ServiceCalls;
