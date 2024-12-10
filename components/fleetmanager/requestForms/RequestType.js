import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

const RequestType = ({navigation}) => {
  const handleServiceCallPress = () => {
    console.log('Service Call button pressed');
  };

  const handleFleetPress = () => {
    console.log('Fleet button pressed');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose an Option</Text>
      <Button
        title="Service Call"
        onPress={() => navigation.navigate('ServiceForm')}
        style={styles.button}
      />
      <Button
        title="Fleet"
        onPress={() => navigation.navigate('FleetForm')}
        style={styles.button}
      />
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
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  button: {
    marginBottom: 10,
  },
});

export default RequestType;
