import React, { useContext, useReducer } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Post from './components/Alumni/Post';
import PostDetailScreen from './components/Alumni/PostDetailScreen';
import Login from './components/User/Login';
import Register from './components/User/Register';
import Profile from './components/User/Profile';
import { MyDispatchContext, MyUserContext } from './configs/Context';
import { MyUserReducer } from './configs/Reducers';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi, endpoints } from './configs/APIs';
import EditPost from './components/User/EditPost';
import Chat from './components/User/chat';
// import Logout from './components/User/Logout';


const Stack = createStackNavigator();

const MyStack = () => (
  <Stack.Navigator>
    {/* <Stack.Screen name="Home" component={MyStack}/> */}
    <Stack.Screen name="Post" component={Post} options={{ title: 'Bài viết' }} />
    <Stack.Screen name="PostDetailScreen" component={PostDetailScreen} />
    <Stack.Screen name="Profile" component={Profile} />
    <Stack.Screen name="Login" component={Login} />
    <Stack.Screen name="Register" component={Register} />
    <Stack.Screen name="EditPost" component={EditPost} />

  </Stack.Navigator>
);

const Tab = createBottomTabNavigator();

const MyTab = ({ isAuthenticated }) => {
  const user = useContext(MyUserContext);

  return (
    <Tab.Navigator  screenOptions={{
      headerShown: false, // Ẩn header mặc định của tab
    }}>
      {user === null ? (
        <>
          <Tab.Screen
            name="Login"
            component={Login}
            options={{
              title: "Đăng nhập",
              tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="login" color={color} size={size} />,
            }}
          />
          <Tab.Screen
            name="Register"
            component={Register}
            options={{
              title: "Đăng ký",
              tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="account" color={color} size={size} />,
            }}
          />
        </>
      ) : (
        <>
          <Tab.Screen
            name="Home"
            component={MyStack}
            options={{
              tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="home" color={color} size={size} />,
            }}
          />
          <Tab.Screen
            name="Profile"
            component={Profile}
            options={{
              title: user.username || "Profile",
              tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="account" color={color} size={size} />,
            }}
          />
          <Tab.Screen
            name="Chat"
            component={Chat}
            options={{
              tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="account" color={color} size={size} />,
            }}
          />
        </>
      )}
    </Tab.Navigator>

  );
};

export default function App() {
  const [user, dispatch] = useReducer(MyUserReducer, null);
  const [role, setRole] = React.useState();
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  const getAccessToken = async () => {
    try {
      const token = await AsyncStorage.getItem('access-token');
      if (token !== null) {
        let userResponse = await authApi(token).get(endpoints['current_user']);
        console.log(userResponse.data);
        dispatch({
          "type": "login",
          "payload": userResponse.data
        });
        setIsAuthenticated(true);
        setRole(userResponse.data.role);
      } else {
        console.log('Không tìm thấy token trong AsyncStorage');
      }
    } catch (ex) {
      console.log("Lỗi", ex);
    }
  };

  React.useEffect(() => {
    getAccessToken();
  }, []);

  return (
    <NavigationContainer>
      <MyUserContext.Provider value={user}>
        <MyDispatchContext.Provider value={dispatch}>
          <MyTab isAuthenticated={isAuthenticated} />
        </MyDispatchContext.Provider>
      </MyUserContext.Provider>
    </NavigationContainer>
  );
}

