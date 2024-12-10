import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import LandingPage from './components/landing/LandingPage';
import SignUp from './components/auth/Signup';
import Login from './components/auth/Login';
import FleetManager from './components/fleetmanager/FleetManager';
import FleetForm from './components/fleetmanager/requestForms/FleetForm';
import RequestType from './components/fleetmanager/requestForms/RequestType';
import ServiceCallForm from './components/fleetmanager/requestForms/ServiceForm';
import ServiceCalls from './components/fleets/servicecalls/ServiceCalls';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Landing">
        <Stack.Screen name="Landing" component={LandingPage} />
        <Stack.Screen name="SignUp" component={SignUp} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="FleetManager" component={FleetManager} />
        <Stack.Screen name="FleetForm" component={FleetForm} />
        <Stack.Screen name="ServiceForm" component={ServiceCallForm} />
        <Stack.Screen name="ServCalls" component={ServiceCalls} />
        <Stack.Screen name="RequestType" component={RequestType} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
