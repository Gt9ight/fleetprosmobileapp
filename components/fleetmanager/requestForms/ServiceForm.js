import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Image, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { db, storage } from '../../../Firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, setDoc } from 'firebase/firestore';

const ServiceCallForm = () => {
  const [section, setSection] = useState(1);
  const [answers, setAnswers] = useState({});
  const [image, setImage] = useState(null);
  const [imageUri, setImageUri] = useState(null);

  // Function to handle input changes
  const handleInputChange = (question, value) => {
    setAnswers(prevState => ({
      ...prevState,
      [question]: value,
    }));
  };

  // Function to go to the next section
  const goToNextSection = () => {
    setSection(prevSection => prevSection + 1);
  };

  // Function to handle form submission
  const handleSubmit = async () => {
    if (image) {
      const imageName = `images/${Date.now()}.jpg`;
      const imageRef = ref(storage, imageName);

      // Upload the image to Firebase Storage
      const response = await fetch(image);
      const blob = await response.blob();
      await uploadBytes(imageRef, blob);

      // Get image URL
      const imageUrl = await getDownloadURL(imageRef);

      // Save the form data to Firestore along with the image URL
      const formData = {
        ...answers,
        imageUrl: imageUrl,
      };

      try {
        await setDoc(doc(db, "serviceCalls", Date.now().toString()), formData);
        alert('Form submitted successfully!');
      } catch (error) {
        console.error('Error saving data: ', error);
        alert('Error submitting form!');
      }
    } else {
      alert('Please upload an image before submitting');
    }
  };

  // Function to pick an image
  const handleImagePick = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted) {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaType: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri); // Set the selected image URI
      }
    } else {
      alert('Permission to access media library is required!');
    }
  };

  const renderSection = () => {
    switch (section) {
      case 1:
        return (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>1 of 3</Text>
            <Text style={styles.cardText}>Unit Type</Text>
            <TextInput
              style={styles.input}
              placeholder="Answer for Question 1.1"
              onChangeText={(text) => handleInputChange('question1_1', text)}
            />
            <Text style={styles.cardText}>Unit Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Answer for Question 1.2"
              onChangeText={(text) => handleInputChange('question1_2', text)}
            />
            <Text style={styles.cardText}>Urgency</Text>
            <TextInput
              style={styles.input}
              placeholder="Answer for Question 1.3"
              onChangeText={(text) => handleInputChange('question1_3', text)}
            />
          </View>
        );
      case 2:
        return (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>2 of 3</Text>
            <Text style={styles.cardText}>Position(s)</Text>
            <TextInput
              style={styles.input}
              placeholder="Answer for Question 2.1"
              onChangeText={(text) => handleInputChange('question2_1', text)}
            />
            <Text style={styles.cardText}>Specifics</Text>
            <TextInput
              style={styles.input}
              placeholder="Answer for Question 2.2"
              onChangeText={(text) => handleInputChange('question2_2', text)}
            />
            <Text style={styles.cardText}>Tread Depth</Text>
            <TextInput
              style={styles.input}
              placeholder="Answer for Question 2.3"
              onChangeText={(text) => handleInputChange('question2_3', text)}
            />
            <Text style={styles.cardText}>Tire Needed</Text>
            <TextInput
              style={styles.input}
              placeholder="Answer for Question 2.4"
              onChangeText={(text) => handleInputChange('question2_4', text)}
            />
          </View>
        );
      case 3:
        return (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>3 of 3</Text>
            <Button title="Upload Image" onPress={handleImagePick} />
            {image && (
              <View style={styles.imagePreview}>
                <Image source={{ uri: image }} style={styles.image} />
              </View>
            )}
            <Button title="Submit" onPress={handleSubmit} />
          </View>
        );
      default:
        return (
          <View>
            <Text>Form Completed</Text>
          </View>
        );
    }
  };

  return (
    <View style={styles.container}>
      {renderSection()}
      {section < 3 && <Button title="Next" onPress={goToNextSection} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    elevation: 5, 
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
  input: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
    paddingLeft: 10,
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

export default ServiceCallForm;
