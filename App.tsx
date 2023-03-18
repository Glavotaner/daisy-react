import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React, {createContext, useContext, useState} from 'react';
import {SafeAreaView, StatusBar, useColorScheme} from 'react-native';
import {Button, TextInput} from 'react-native-paper';

import {Colors} from 'react-native/Libraries/NewAppScreen';

type UserContext = State<string | undefined>;
type PairContext = State<string | undefined>;
type OnBoardingContext = State<boolean>;
type State<T> = [T, React.Dispatch<React.SetStateAction<T>>];

const OnBoardingContext = createContext<OnBoardingContext>([false, () => {}]);
const UserContext = createContext<UserContext>(['', () => {}]);
const PairContext = createContext<PairContext>(['', () => {}]);

enum Routes {
  OnBoarding = 'OnBoarding',
  Messages = 'Messages',
}

enum OnBoardingRoutes {
  Registration = 'Registration',
  Pairing = 'Pairing',
}

enum MessagesRoutes {
  KissRequest = 'KissRequest',
  KissSelection = 'KissSelection',
}

function App(): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const Stack = createNativeStackNavigator();
  const [isOnboarded, setIsOnboarded] = useState(false);
  return (
    <NavigationContainer>
      <OnBoardingContext.Provider value={[isOnboarded, setIsOnboarded]}>
        <SafeAreaView style={{...backgroundStyle, flex: 1}}>
          <StatusBar
            barStyle={isDarkMode ? 'light-content' : 'dark-content'}
            backgroundColor={backgroundStyle.backgroundColor}
          />
          <Stack.Navigator>
            {isOnboarded ? (
              <Stack.Screen
                name={Routes.Messages}
                component={Messages}
                options={{headerShown: false}}
              />
            ) : (
              <Stack.Screen
                name={Routes.OnBoarding}
                component={OnBoarding}
                options={{headerShown: false}}
              />
            )}
          </Stack.Navigator>
        </SafeAreaView>
      </OnBoardingContext.Provider>
    </NavigationContainer>
  );
}

const OnBoarding = () => {
  const Stack = createNativeStackNavigator();
  const [username, setUsername] = useState<string | undefined>('');
  return (
    <UserContext.Provider value={[username, setUsername]}>
      <Stack.Navigator>
        {username ? (
          <Stack.Screen
            name={OnBoardingRoutes.Pairing}
            component={InitialPairing}
          />
        ) : (
          <Stack.Screen
            name={OnBoardingRoutes.Registration}
            component={Registration}
          />
        )}
      </Stack.Navigator>
    </UserContext.Provider>
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
const Registration = () => {
  const [persistedUsername, setPersistedUsername] = useContext(UserContext);
  const [username, setUsername] = useState('');
  const onRegister = async () => {
    console.log(username);
    setPersistedUsername(username);
  };
  return (
    <>
      <TextInput
        placeholder="Username..."
        mode="outlined"
        value={username || persistedUsername}
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
const Pairing = () => {
  const [persistedPair, setPersistedPair] = useContext(PairContext);
  const [pair, setPair] = useState('');
  const onPaired = () => {
    console.log(pair);
    setPersistedPair(pair);
  };
  return (
    <>
      <TextInput
        placeholder="Pair..."
        mode="outlined"
        value={pair || persistedPair}
        onChangeText={setPair}
      />
      <Button
        disabled={!pair}
        mode="contained"
        icon="heart"
        onPress={() => onPaired()}>
        Pair
      </Button>
    </>
  );
};
const InitialPairing = () => {
  const [_, setIsOnboarded] = useContext(OnBoardingContext);
  const onPairLater = () => {
    setIsOnboarded(true);
  };
  return (
    <>
      <Pairing />
      <Button
        mode="outlined"
        style={{marginTop: 10}}
        onPress={() => onPairLater()}>
        Pair later
      </Button>
    </>
  );
};
export default App;
