import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React, {createContext, useContext, useState} from 'react';
import {
  Image,
  SafeAreaView,
  StatusBar,
  Text,
  useColorScheme,
  View,
} from 'react-native';
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
                options={{headerRight: () => <Text>Pair</Text>}}
              />
            ) : (
              <Stack.Screen name={Routes.OnBoarding} component={OnBoarding} />
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
      <Stack.Screen
        options={{headerShown: false}}
        name={MessagesRoutes.KissRequest}
        component={KissRequest}
      />
      <Stack.Screen
        options={{headerShown: false}}
        name={MessagesRoutes.KissSelection}
        component={KissSelection}
      />
    </Stack.Navigator>
  );
};
const KissRequest = ({navigation}) => (
  <>
    <Placeholder />
    <TextInput
      placeholder="I request kiss..."
      style={{marginHorizontal: 100, textAlign: 'center'}}
    />
    <Button onPress={() => navigation.replace(MessagesRoutes.KissSelection)}>
      Select kiss
    </Button>
  </>
);
const KissSelection = ({navigation}) => (
  <>
    <Button onPress={() => navigation.replace(MessagesRoutes.KissRequest)}>
      Request kiss
    </Button>
    <Placeholder />
  </>
);
const Registration = () => {
  const [persistedUsername, setPersistedUsername] = useContext(UserContext);
  const [username, setUsername] = useState('');
  const onRegister = async () => {
    console.log(username);
    setPersistedUsername(username);
  };
  return (
    <View style={{padding: 50}}>
      <Placeholder />
      <TextInput
        placeholder="Username..."
        mode="outlined"
        value={username || persistedUsername}
        onChangeText={setUsername}
        style={{marginBottom: 25}}
      />
      <Button
        disabled={!username}
        mode="contained"
        icon="account"
        onPress={() => onRegister()}>
        Register
      </Button>
    </View>
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
      <Placeholder />
      <TextInput
        placeholder="Pair..."
        mode="outlined"
        value={pair || persistedPair}
        onChangeText={setPair}
        style={{marginBottom: 25}}
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
  const [__, setUsername] = useContext(UserContext);
  const onPairLater = () => {
    setIsOnboarded(true);
  };
  const onChangeUsername = () => {
    setUsername('');
  };
  return (
    <View style={{padding: 50}}>
      <Pairing />
      <Button
        mode="outlined"
        style={{marginBottom: 100, marginTop: 25}}
        onPress={() => onPairLater()}>
        Pair later
      </Button>
      <Button
        mode="elevated"
        icon="arrow-left-circle"
        onPress={() => onChangeUsername()}>
        Change username
      </Button>
    </View>
  );
};
const Placeholder = () => (
  <Image
    source={require('./assets/images/placeholder.png')}
    style={{width: 150, height: 200, alignSelf: 'center'}}
  />
);
export default App;
