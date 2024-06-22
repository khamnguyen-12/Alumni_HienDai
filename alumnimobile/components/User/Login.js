import { View, Text, ScrollView, KeyboardAvoidingView, Platform, Alert, TouchableOpacity,StyleSheet } from "react-native";
import { Button, TextInput } from "react-native-paper";
// import Styles from "./Styles";
import React, { useContext } from "react";
import APIs, { authApi, endpoints } from "../../configs/APIs";
import { MyDispatchContext, MyDispatcherContext } from "../../configs/Context";
import { useNavigation } from "@react-navigation/native"; 
import { IconButton } from 'react-native-paper';
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Icon } from 'react-native-paper';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../configs/firebase";

const Login = () => {
    const fields = [{
        "label": "Tên đăng nhập",
        // "icon": "account", 
        "name": "username"
    }, {
        "label": "Mật khẩu",
        // "icon": "eye",
        "secureTextEntry": true,
        "name": "password"
    }];
    const [user, setUser] = React.useState({});
    const [loading, setLoading] = React.useState(false);
    const dispatch = useContext(MyDispatchContext);
    const nav = useNavigation();

    const login = async () => {
        setLoading(true);
        // console.log(user);
        try {
            console.info("Thông tin người dùng:", user);
            let res = await APIs.post(endpoints['login'],{
                'username':user.username,
                'password':user.password,
                // ...user,
                'client_id': 'Ap91RYqwPglTWPf40tX38kTvwSxUd7pkLT9u8N06',
                'client_secret': 'kHAcLZThhQzWKCPOhbxrAcvnoPytoEhr9kfnZ4wSZIvqCjpuStaILA4V8TSeGggBfqIpgoyMpB6rwT2x9qHsQd2IJ8iwkY2lqPTH6VFDbeoCGEDnTbptMoDz1NSOvBKG',
                'grant_type': "password"
            }
            , {
                headers:{
                    'Content-Type':  'multipart/form-data',
                    Authorization: 'Bearer LPTf5nFpa8yJ1H6O3XwwghOtKo5gRK',
                }
            }
            );
                // Kiểm tra phản hồi từ máy chủ
                console.info("Phản hồi từ máy chủ:", res.data);

                // Lưu token truy cập vào AsyncStorage
                AsyncStorage.setItem('access-token', res.data.access_token);


                // Lấy thông tin người dùng hiện tại sau khi đăng nhập thành công
                setTimeout(async () => {
                    let token = await AsyncStorage.getItem('access-token');
                    let user = await authApi(token).get(endpoints['current_user']);

                    AsyncStorage.setItem('user', JSON.stringify(user.data));
                    // Đăng nhập vào Firebase
                    await signInWithEmailAndPassword(auth, user.data.username, user.data.password); 

                    console.info(user.data);
                    // gửi tín hiệu đã dăng nhập rồi cho MyDispatchContext,payload gửi DL user đã đăng nhập rồi 
                    dispatch({
                        "type": "login",
                        "payload": user.data
                    })
                    // chuyển hướng tới trang Home sau khi đăng nhập
                    console.log(res.status);

                    if(res.status == 200 ){
                        console.log("Đăng nhập thành công!");
                        nav.navigate('Home');
                    }
                }, 100);


            } catch (ex) {
                Alert.alert("Lỗi đăng nhập","Sai tên hoặc mật khẩu")
                console.error("Lỗi khi đăng nhập:", ex);
                // Kiểm tra chi tiết lỗi nếu có
                if (ex.response) {
                    console.log("Phản hồi lỗi từ máy chủ:", ex.response.data);
                } else {
                    Alert.alert("Lỗi kết nối", "Không thể kết nối tới máy chủ. Vui lòng thử lại sau.");
                }
            } finally {
                setLoading(false);
            }
    }

    const updateState = (field, value) => {
        setUser(current => {
            return { ...current, [field]: value }
        })
    }

    return (
        <View style={Styles.container}>
            <ScrollView>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                    <View style={Styles.header}>
                        <Text style={Styles.title}>Đăng nhập</Text>
                        
                    </View>
                    <Icon name="home" color={"white"} size={20} />
                    {fields.map(f => (
                        <TextInput 
                            value={user[f.name]} 
                            onChangeText={t => updateState(f.name, t)} 
                            key={f.label} 
                            style={Styles.input} 
                            label={f.label} 
                            secureTextEntry={f.secureTextEntry} 
                            right={<IconButton icon={f.icon} />} 
                        />
                    ))}

                    <Button 
                        style={Styles.button} 
                        labelStyle={Styles.buttonText}
                        loading={loading} 
                        // icon="account" 
                        mode="contained" 
                        onPress={login}
                    >
                        Đăng nhập
                    </Button>
                </KeyboardAvoidingView>

               <TouchableOpacity>


               <Text style = {Styles.linkText} onPress={() => nav.navigate("Register")} >Nếu chưa có tài khoản? Nhấp vào đây</Text>
               </TouchableOpacity>
            </ScrollView>
        </View>
    );
}
const Styles = StyleSheet.create({
    container: {
      paddingTop: 100,
      flex: 1,
      backgroundColor: '#f5f5f5',
      paddingHorizontal: 20,
      justifyContent: 'center',
    },
    header: {
      alignItems: 'center',
      marginBottom: 30,
    },
    title: {
      fontSize: 30,
      fontWeight: 'bold',
      color: '#333',
    },
    input: {
      backgroundColor: '#fff',
      marginBottom: 15,
      borderRadius: 10,
      paddingHorizontal: 15,
      height: 50,
      borderColor: '#ddd',
      borderWidth: 1,
    },
    button: {
      backgroundColor: '#007BFF',
      borderRadius: 10,
      paddingVertical: 10,
    },
    buttonText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#fff',
    },
    linkText: {
      marginTop: 20,
      textAlign: 'center',
      color: '#007BFF',
      textDecorationLine: 'underline',
    },
  });

export default Login;