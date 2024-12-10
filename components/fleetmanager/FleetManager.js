import React from 'react';
import { Text, View, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';

export default function FleetManager({navigation}) {
  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Welcome</Text>

      {/* SafeAreaView ensures navbar doesn't overlap with the home button/gestures */}
      <SafeAreaView style={styles.navContainer}>
        <TouchableOpacity style={styles.navTab} style={styles.navTab} onPress={() => navigation.navigate('ServCalls')}>>
          <Text style={styles.navText}>Fleets</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navTab}>
          <Text style={styles.navText}>Stats</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navTab}>
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navTab} onPress={() => navigation.navigate('RequestType')}>
          <Text style={styles.navText}>Start</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navTab}>
          <Text style={styles.navText}>Account</Text>
        </TouchableOpacity>
      </SafeAreaView>
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
