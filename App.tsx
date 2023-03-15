import {
  NavigationContainer,
  NavigationProp,
  ParamListBase,
} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React, {useState} from 'react';
import {SafeAreaView, StatusBar, Text, useColorScheme} from 'react-native';
import {Button, TextInput} from 'react-native-paper';

import {Colors} from 'react-native/Libraries/NewAppScreen';

function App(): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const Stack = createNativeStackNavigator();

  return (
    <SafeAreaView style={{...backgroundStyle, flex: 1}}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name={Routes.Registration}
            component={Registration}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name={Routes.Messages}
            component={Messages}
            options={{headerShown: false}}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
}

enum Routes {
  Registration = 'Registration',
  Messages = 'Messages',
}

enum SetupRoutes {
  UserSetup = 'UserSetup',
  Pairing = 'Pairing',
}

enum MessagesRoutes {
  KissRequest = 'KissRequest',
  KissSelection = 'KissSelection',
}

const Registration = () => {
  const Stack = createNativeStackNavigator();
  return (
    <Stack.Navigator>
      <Stack.Screen name={SetupRoutes.UserSetup} component={UserSetup} />
      <Stack.Screen name={SetupRoutes.Pairing} component={Pairing} />
    </Stack.Navigator>
  );
};
const Messages = () => {
  const Stack = createNativeStackNavigator();
  return (
    <Stack.Navigator>
      <Stack.Screen name={MessagesRoutes.KissRequest} component={KissRequest} />
      <Stack.Screen
        name={MessagesRoutes.KissSelection}
        component={KissSelection}
      />
    </Stack.Navigator>
  );
};
const KissRequest = ({navigation}) => (
  <Button onPress={() => navigation.replace(MessagesRoutes.KissSelection)}>
    Kiss request
  </Button>
);
const KissSelection = ({navigation}) => (
  <Button onPress={() => navigation.replace(MessagesRoutes.KissRequest)}>
    Kiss selection
  </Button>
);
const UserSetup = ({navigation}) => {
  const [username, setUsername] = useState('');
  const onRegister = async () => {
    console.log(username);
    navigation.push(SetupRoutes.Pairing);
  };
  return (
    <>
      <TextInput
        placeholder="Username..."
        mode="outlined"
        value={username}
        onChangeText={setUsername}
      />
      <Button
        disabled={!username}
        mode="contained"
        icon="account"
        onPress={() => onRegister()}>
        Register
      </Button>
    </>
  );
};
const Pairing = ({navigation}) => {
  const [pair, setPair] = useState('');
  const onPaired = () => {
    console.log(pair);
    navigation.replace(Routes.Messages);
  };
  return (
    <>
      <TextInput
        placeholder="Pair..."
        mode="outlined"
        value={pair}
        onChangeText={setPair}
      />
      <Button
        disabled={!pair}
        mode="contained"
        icon="heart"
        onPress={() => onPaired()}>
        Pair
      </Button>
      <Button mode="outlined" style={{marginTop: 10}}>
        Pair later
      </Button>
    </>
  );
};
export default App;
