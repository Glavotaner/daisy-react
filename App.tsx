import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {
  PairResponseData,
  RegistrationData,
  RequestPairData,
  SendOptions,
} from 'daisy-types';
import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Image,
  ImageSourcePropType,
  Pressable,
  SafeAreaView,
  StatusBar,
  Text,
  TextInput as Input,
  ToastAndroid,
  useColorScheme,
  View,
} from 'react-native';
import {Button, TextInput} from 'react-native-paper';
import messaging from '@react-native-firebase/messaging';
import * as dotenv from 'dotenv';
dotenv.config();

import {Colors} from 'react-native/Libraries/NewAppScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';

// TODO arrange files
// TODO get Token
// TODO subscribe to messages
// TODO error logging

export const pairingImage = require('./assets/images/step_pairing.png');
export const reqistrationImage = require('./assets/images/step_registration.png');
export const kissRequest = require('./assets/images/request.png');
export const bossBabyKiss = require('./assets/images/boss-baby.png');

type UserContext = State<string | undefined>;
type PairContext = State<string | undefined>;
type OnBoardingContext = State<boolean>;
type KissesContext = State<boolean>;
type State<T> = [T, React.Dispatch<React.SetStateAction<T>>];

// TODO initial null
const OnBoardingContext = createContext<OnBoardingContext>([false, () => {}]);
const UserContext = createContext<UserContext>(['', () => {}]);
const PairContext = createContext<PairContext>(['', () => {}]);
const KissesContext = createContext<KissesContext>([false, () => {}]);

type PairingState = {
  pairingCode: string[];
  currentCharacterIndex: number;
};

type PairingReducerData = {
  type: 'setCode' | 'clearCode' | 'focusCode';
  characterIndex: number;
  code?: string;
};

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

const apiUrl = process.env.API_URL;

const postToApi = (url: string, data: Record<string, any>) => {
  ToastAndroid.show('err', ToastAndroid.LONG);
  return;
};

type UsersPayloads = RegistrationData | RequestPairData | PairResponseData;
type UserEndpoints = 'register' | 'requestPair' | 'respondPair';

const postToUsers = async (endpoint: UserEndpoints, data: UsersPayloads) => {
  await new Promise<void>(r => setTimeout(r, 2000));
  return postToApi(`/users/${endpoint}`, data);
};

const sendMessage = async ({message, to}: SendOptions) => {
  return postToApi(`/messages/send`, {message, to});
};

interface Kiss {
  type: string;
}

function App(): JSX.Element {
  // TODO check user
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  useEffect(() => {
    messaging()
      .getToken()
      .then(token => AsyncStorage.setItem('token', token));
    // TODO state, persist in API
  }, []);

  return (
    <NavigationContainer>
      <SafeAreaView style={{...backgroundStyle, flex: 1}}>
        <StatusBar
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
          backgroundColor={backgroundStyle.backgroundColor}
        />
        <Navigator />
      </SafeAreaView>
    </NavigationContainer>
  );
}
const Navigator = () => {
  const Stack = createNativeStackNavigator();
  const [isOnboarded, setIsOnboarded] = useState(false);
  return (
    <OnBoardingContext.Provider value={[isOnboarded, setIsOnboarded]}>
      <Stack.Navigator>
        {isOnboarded ? (
          <Stack.Screen name={Routes.Messages} component={Messages} />
        ) : (
          <Stack.Screen
            name={Routes.OnBoarding}
            component={OnBoarding}
            options={{headerShown: false}}
          />
        )}
      </Stack.Navigator>
    </OnBoardingContext.Provider>
  );
};
const OnBoarding = () => {
  const [username, setUsername] = useState<string | undefined>('');
  const Stack = createNativeStackNavigator();
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
  const [isSelectingKiss, setIsSelectingKiss] = useState(false);
  return (
    <KissesContext.Provider value={[isSelectingKiss, setIsSelectingKiss]}>
      <Stack.Navigator>
        <Stack.Group>
          {isSelectingKiss ? (
            <Stack.Screen
              name={MessagesRoutes.KissSelection}
              component={KissSelection}
              options={{headerShown: false}}
            />
          ) : (
            <Stack.Screen
              name={MessagesRoutes.KissRequest}
              component={KissRequest}
              options={{headerShown: false}}
            />
          )}
        </Stack.Group>
      </Stack.Navigator>
    </KissesContext.Provider>
  );
};
const KissRequest = () => {
  const [request, setRequest] = useState('');
  const [_, setIsSelectingKiss] = useContext(KissesContext);
  const requestKiss = async () => {
    try {
      // TODO payload
      await sendMessage({
        to: 'pair',
        message: {
          notification: {
            title: 'I am requesting kiss',
            body: request,
          },
        },
      });
      ToastAndroid.show('Request sent!', 1000);
    } catch (e) {
      console.error(e);
      ToastAndroid.show('Oops something went wrong!', 2000);
    }
  };
  // OPTIMIZE separate button
  return (
    <>
      <Pressable onPress={() => requestKiss()}>
        <KissRequestImage />
      </Pressable>
      <TextInput
        value={request}
        onChangeText={setRequest}
        placeholder="I request kiss..."
        style={{marginHorizontal: 100, textAlign: 'center'}}
      />
      <Button onPress={() => setIsSelectingKiss(true)}>Select kiss</Button>
    </>
  );
};

const KissSelection = () => {
  const [_, setIsSelectingKiss] = useContext(KissesContext);
  const sendKiss = async (kiss: unknown) => {
    try {
      // TODO payload
      await sendMessage(kiss as SendOptions);
      ToastAndroid.show('Kiss sent!', 1000);
    } catch (e) {
      console.error(e);
      ToastAndroid.show('Oops something went wrong!', 2000);
    }
  };
  const kisses: Kiss[] = [{type: 'baby kiss'}];
  return (
    <>
      <Button onPress={() => setIsSelectingKiss(false)}>Request kiss</Button>
      {kisses.map(k => (
        <Pressable key={k.type} onPress={() => sendKiss(k)}>
          <KissImage kissType={k.type} />
        </Pressable>
      ))}
    </>
  );
};
const Registration = () => {
  const [persistedUsername, setPersistedUsername] = useContext(UserContext);
  const [username, setUsername] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const token = 'TODO';
  const onRegister = async () => {
    setIsRegistering(true);
    try {
      await postToUsers('register', {username, token});
      setPersistedUsername(username);
    } finally {
      setIsRegistering(false);
    }
  };
  // OPTIMIZE separate registration button
  return (
    <SetupStep>
      <StepImage stepImage={reqistrationImage} />
      <TextInput
        placeholder="Username..."
        mode="outlined"
        value={username || persistedUsername}
        onChangeText={setUsername}
        style={{marginBottom: 25}}
      />
      <>
        {isRegistering && <Loading message="Registering..." />}
        {!isRegistering && (
          <Button
            disabled={!username}
            mode="contained"
            icon="account"
            onPress={() => onRegister()}>
            Register
          </Button>
        )}
      </>
    </SetupStep>
  );
};
const Pairing = () => {
  const [persistedPair, setPersistedPair] = useContext(PairContext);
  const [username] = useContext(UserContext);
  const [pair, setPair] = useState('');
  const [isRequestingPair, setIsRequestingPair] = useState(false);
  const [isValidatingPairingCode, setIsValidatingPairingCode] = useState(false);
  const onPairRequested = async () => {
    setIsRequestingPair(true);
    try {
      await postToUsers('requestPair', {
        requestingUsername: username!,
        pairUsername: pair,
      });
      setPersistedPair(pair);
    } finally {
      setIsRequestingPair(false);
    }
  };
  const onPairingCodeComplete = async (code: string) => {
    setIsValidatingPairingCode(true);
    try {
      await postToUsers('respondPair', {
        requestingUsername: pair,
        respondingUsername: username!,
        pairingResponse: code,
      });
    } finally {
      setIsValidatingPairingCode(false);
    }
  };
  // OPTIMIZE separate components
  return (
    <>
      <StepImage stepImage={pairingImage} />
      <TextInput
        placeholder="Pair..."
        mode="outlined"
        value={pair || persistedPair}
        onChangeText={setPair}
        style={{marginBottom: 25}}
      />
      {isRequestingPair && <Loading message="Requesting pair..." />}
      {!isRequestingPair && (
        <Button
          disabled={!pair}
          mode="contained"
          icon="heart"
          style={{marginBottom: 25}}
          onPress={() => onPairRequested()}>
          Pair
        </Button>
      )}
      <PairingCodeInput onCodeComplete={onPairingCodeComplete} />
      {isValidatingPairingCode && <Loading message="Pairing..." />}
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
    <SetupStep>
      <Pairing />
      <Button
        mode="outlined"
        style={{marginVertical: 50}}
        onPress={() => onPairLater()}>
        Pair later
      </Button>
      <Button
        mode="elevated"
        icon="arrow-left-circle"
        onPress={() => onChangeUsername()}>
        Change username
      </Button>
    </SetupStep>
  );
};
const PairingCodeInput = ({
  onCodeComplete,
}: {
  onCodeComplete: (code: string) => void;
}) => {
  // TODO move reducer
  const reducer = (state: PairingState, action: PairingReducerData) => {
    switch (action.type) {
      case 'setCode':
        return {
          pairingCode: state.pairingCode.map((c, i) =>
            i === action.characterIndex ? action.code! : c,
          ),
          currentCharacterIndex: action.characterIndex + 1,
        };
      case 'clearCode':
        return {
          pairingCode: state.pairingCode.map((c, i) =>
            i === action.characterIndex ? '' : c,
          ),
          currentCharacterIndex: action.characterIndex - 1,
        };
      case 'focusCode':
        return {
          ...state,
          currentCharacterIndex: action.characterIndex,
        };
    }
  };
  const [{pairingCode, currentCharacterIndex}, dispatch] = useReducer(reducer, {
    pairingCode: ['', '', '', '', '', ''],
    currentCharacterIndex: 0,
  });
  const setCode = (code: string, characterIndex: number) => {
    const filledCodes = pairingCode.filter(c => c);
    if (filledCodes.length + 1 === 6) {
      onCodeComplete(pairingCode.join(''));
    } else {
      dispatch({type: 'setCode', code, characterIndex});
    }
  };
  return (
    <>
      <Text style={{textAlign: 'center', paddingBottom: 10}}>Pairing code</Text>
      <View
        style={{
          marginHorizontal: 'auto',
          flexDirection: 'row',
          flexWrap: 'nowrap',
        }}>
        {[0, 1, 2, 3, 4, 5].map(index => {
          return (
            <Character
              key={index}
              characterIndex={currentCharacterIndex}
              index={index}
              onChange={code => setCode(code, index)}
              onClear={() =>
                dispatch({type: 'clearCode', characterIndex: index})
              }
              onFocus={() =>
                dispatch({type: 'focusCode', characterIndex: index})
              }
            />
          );
        })}
      </View>
    </>
  );
};
const Character = ({
  characterIndex,
  index,
  onChange,
  onClear,
  onFocus,
}: {
  characterIndex: number;
  index: number;
  onChange: (code: string) => any;
  onClear: () => any;
  onFocus: () => any;
}) => {
  let textInput: Input;
  const style = {
    flex: 1,
    width: 50,
    height: 50,
  };
  useEffect(() => {
    if (characterIndex === index) {
      textInput.focus();
      textInput.clear();
    }
  }, [characterIndex]);
  return (
    <TextInput
      inputMode="numeric"
      onKeyPress={keyPress => {
        if (keyPress.nativeEvent.key === 'Backspace') {
          onClear();
        }
      }}
      ref={(input: Input) => (textInput = input)}
      style={{...style, textAlign: 'center', marginHorizontal: 1}}
      onFocus={() => onFocus()}
      onChangeText={code => {
        if (code) {
          onChange(code);
        }
      }}
      mode="outlined"
    />
  );
};
const SetupStep = ({children}: {children: JSX.Element[]}) => {
  return <View style={{padding: 50}}>{children}</View>;
};
const StepImage = ({stepImage}: {stepImage: ImageSourcePropType}) => (
  <Image
    source={stepImage}
    style={{width: 200, height: 200, alignSelf: 'center'}}
  />
);
const KissRequestImage = () => (
  <Image
    source={kissRequest}
    style={{width: 500, height: 600, alignSelf: 'center'}}
  />
);
const KissImage = ({kissType}: {kissType: string}) => (
  <Image
    source={bossBabyKiss}
    style={{width: 250, height: 300, alignSelf: 'center'}}
  />
);
const Loading = ({message}: {message: string}) => {
  return (
    <Text style={{textAlignVertical: 'center', textAlign: 'center'}}>
      {message} <ActivityIndicator />
    </Text>
  );
};
export default App;
