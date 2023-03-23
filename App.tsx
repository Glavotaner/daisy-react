import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {
  PairResponseData,
  RegistrationData,
  RequestPairData,
  SendOptions,
} from 'daisy-types';
import React, {createContext, useContext, useEffect, useState} from 'react';
import {
  Alert,
  Image,
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

import {Colors} from 'react-native/Libraries/NewAppScreen';

type UserContext = State<string | undefined>;
type PairContext = State<string | undefined>;
type OnBoardingContext = State<boolean>;
type KissesContext = State<boolean>;
type State<T> = [T, React.Dispatch<React.SetStateAction<T>>];

const OnBoardingContext = createContext<OnBoardingContext>([false, () => {}]);
const UserContext = createContext<UserContext>(['', () => {}]);
const PairContext = createContext<PairContext>(['', () => {}]);
const KissesContext = createContext<KissesContext>([false, () => {}]);

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

const url = 'localhost';

const postToApi = (url: string, data: Record<string, any>) => {
  ToastAndroid.show('err', ToastAndroid.LONG);
  return;
  /* const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (response.ok) {
    return response.json();
  } else {
    const error = await response.text();
    ToastAndroid.show(error, ToastAndroid.LONG);
  } */
};

type UsersPayloads = RegistrationData | RequestPairData | PairResponseData;
type UserEndpoints = 'register' | 'requestPair' | 'respondPair';

const postToUsers = async (endpoint: UserEndpoints, data: UsersPayloads) => {
  return postToApi(`${url}/users/${endpoint}`, data);
};

const sendMessage = async ({message, to}: SendOptions) => {
  return postToApi(`${url}/messages/send`, {message, to});
};

interface Kiss {
  type: string;
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
              <Stack.Screen name={Routes.Messages} component={Messages} />
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
  const token = 'TODO';
  const onRegister = async () => {
    await postToUsers('register', {username, token});
    setPersistedUsername(username);
  };
  return (
    <SetupStep>
      <StepImage />
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
    </SetupStep>
  );
};
const Pairing = () => {
  const [persistedPair] = useContext(PairContext);
  const [username] = useContext(UserContext);
  const [pair, setPair] = useState('');
  const [hasRequestedPair, setHasRequestedPair] = useState(false);
  const onPairRequested = async () => {
    await postToUsers('requestPair', {
      requestingUsername: username!,
      pairUsername: pair,
    });
    setHasRequestedPair(true);
  };
  const onPairingCodeComplete = async (code: string) => {
    await postToUsers('respondPair', {
      requestingUsername: pair,
      respondingUsername: username!,
      pairingResponse: code,
    });
  };
  return (
    <>
      <StepImage />
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
        style={{marginBottom: 25}}
        onPress={() => onPairRequested()}>
        Pair
      </Button>
      {hasRequestedPair && (
        <PairingCodeInput onCodeComplete={onPairingCodeComplete} />
      )}
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
  const [pairingCode, setPairingCode] = useState<string[]>([
    '',
    '',
    '',
    '',
    '',
    '',
  ]);
  const [characterIndex, setCharacterIndex] = useState(0);
  const codeLength = 6;
  const setCode = (code: string[], index: number) => {
    setPairingCode(code);
    if (code.filter(c => c).length === codeLength) {
      onCodeComplete(code.join(''));
    } else {
      setCharacterIndex(index + 1);
    }
  };
  const clearCharacter = (index: number) => {
    setPairingCode(pairingCode.map((c, i) => (i === index ? '' : c)));
    setCharacterIndex(index - 1);
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
              characterIndex={characterIndex}
              index={index}
              onChange={code =>
                setCode(
                  pairingCode.map((c, i) => (i === index ? code : c)),
                  index,
                )
              }
              onClear={() => clearCharacter(index)}
              onFocus={() => setCharacterIndex(index)}
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
      ref={(input: Input) => (textInput = input)}
      style={{...style, textAlign: 'center', marginHorizontal: 1}}
      onFocus={() => onFocus()}
      onChangeText={code => {
        if (code) {
          onChange(code);
        } else {
          onClear();
        }
      }}
      mode="outlined"
    />
  );
};
const SetupStep = ({children}: {children: JSX.Element[]}) => {
  return <View style={{padding: 50}}>{children}</View>;
};
const StepImage = ({stepImage}: {stepImage?: string} = {}) => (
  <Image
    source={require(`./assets/images/placeholder.png`)}
    style={{width: 150, height: 200, alignSelf: 'center'}}
  />
);
const KissRequestImage = () => (
  <Image
    source={require('./assets/images/placeholder.png')}
    style={{width: 500, height: 600, alignSelf: 'center'}}
  />
);
const KissImage = ({kissType}: {kissType: string}) => (
  <Image
    source={require(`./assets/images/placeholder.png`)}
    style={{width: 250, height: 300, alignSelf: 'center'}}
  />
);
export default App;
