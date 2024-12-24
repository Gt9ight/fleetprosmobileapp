import React from 'react';
import { Text, View, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import Navbar from '../navbar/Navbar';

export default function FleetManager({navigation}) {
  return (
    <View style={styles.container}>

      <Text style={styles.welcomeText}>Welcome</Text>
      <Navbar navigation={navigation} currentScreen="FleetManager" />
    </View>
    
    
  );
}

const styles = StyleSheet.create({
  
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  welcomeText: {
    position: 'absolute',
    top: 20,
    left: 20,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  navContainer: {
    position: 'absolute',
    bottom: 0, // Place the navbar at the bottom
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    backgroundColor: '#333',
    paddingBottom: 10, // Padding to avoid interference with the home button
    paddingTop: 20,
    zIndex: 1, // Ensure navbar appears above other UI
  },
  navTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
