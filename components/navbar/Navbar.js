import React from 'react';
import { Text, View, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';

export default function Navbar({ navigation, currentScreen }) {
  return (
    <View>
      {/* SafeAreaView ensures navbar doesn't overlap with the home button/gestures */}
      <SafeAreaView style={styles.navContainer}>
        <TouchableOpacity           style={[
            styles.navTab,
            currentScreen === 'ServCalls' && styles.activeTab, // Style for "Home" tab
          ]} onPress={() => navigation.navigate('ServCalls')}>
          <Text style={styles.navText}>Fleets</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navTab}>
          <Text style={styles.navText}>Stats</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.navTab,
            currentScreen === 'FleetManager' && styles.activeTab, // Style for "Home" tab
          ]}
          onPress={() => navigation.navigate('FleetManager')}
        >
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity           style={[
            styles.navTab,
            currentScreen === 'RequestType' && styles.activeTab, // Style for "Home" tab
          ]} onPress={() => navigation.navigate('RequestType')}>
          <Text style={styles.navText}>Service</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navTab}>
          <Text style={styles.navText}>Account</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  navContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    paddingTop: 10,
    paddingBottom: 10,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    
  },
  navTab: {
    padding: 10,
  },
  navText: {
    fontSize: 16,
    color: '#333',
  },
  activeTab: {
    backgroundColor: '#007bff',
    borderRadius: 5,
  },
});
