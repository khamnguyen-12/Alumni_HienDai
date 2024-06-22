import { View, Text, Image, ScrollView, Platform, KeyboardAvoidingView, Alert, StyleSheet } from "react-native";
import { Button, HelperText, TextInput, TouchableRipple } from "react-native-paper";
// import MyStyles from "../../styles/MyStyles"; 
import React from "react";
import APIs, { endpoints } from "../../configs/APIs";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from 'expo-image-picker';
import { IconButton } from 'react-native-paper';

const Register = () => {
    const [user, setUser] = React.useState({});
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState({});

    const nav = useNavigation();

    const fields = [{
        "label": "Mã số sinh viên",
        "name": "alumni_id"
    }, {
        "label": "Tên",
        "name": "first_name"
    }, {
        "label": "Họ và tên lót",
        "name": "last_name"
    }, {
        "label": "Tên đăng nhập",
        "name": "username"
    }, {
        "label": "Email",
        "name": "email"
    }, {
        "label": "Mật khẩu",
        "secureTextEntry": true,
        "name": "password"
    }, {
        "label": "Xác nhận mật khẩu",
        "secureTextEntry": true,
        "name": "confirm"
    }];

    const validateEmail = (email) => {
        const re = /^[^\s@]+@gmail\.com$/i;  
        return re.test(String(email).toLowerCase());
    }

    const validatePassword = (password) => {
        const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return re.test(password);
    }

    const picker = async () => {
        try {
            let { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert("Không cho phép lấy ảnh từ thư viện!");
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync();
            if (!result.canceled) {
                setUser(current => {
                    return { ...current, "avatar": result.assets[0] }
                });
            } else {
                Alert.alert("Bạn chưa chọn ảnh đại diện.");
                console.warn("Chưa chọn ảnh ");
            }
        } catch (error) {
            console.error("Error selecting avatar: ", error);
            Alert.alert("Xuất hiện lỗi khi chọn ảnh");
        }
    }

    const register = async () => {
        let errors = {};

        fields.forEach(f => {
            if (!user[f.name]) {
                errors[f.name] = `Vui lòng nhập ${f.label.toLowerCase()}`;
            }
        });

        if (user.email && !validateEmail(user.email)) {
            errors.email = "Email không hợp lệ";
            Alert.alert("Email phải chứa kí tự ở đuôi là @gmail.com")
        }

        // if (user.password && !validatePassword(user.password)) {
        //     errors.password = "Mật khẩu phải chứa ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt";
        // }

        if (user.password !== user.confirm) {
            errors.confirm = "Mật khẩu không khớp";
        }

            // Kiểm tra nếu chưa chọn ảnh đại diện
        if (!user.avatar || !user.avatar.uri) {
            errors.avatar = "Vui lòng chọn ảnh đại diện";
        }
        if (Object.keys(errors).length > 0) {
            setError(errors);
            return;
        } else {
            setError({});
        }

        setLoading(true)
        try {
            let form = new FormData();

            for (let key in user) {
                if (key !== 'confirm') {
                    if (key === 'avatar') {
                        form.append(key, {
                            uri: user.avatar.uri,
                            name: user.avatar.fileName,
                            type: user.avatar.type || 'image/jpeg'
                        });
                    } else {
                        form.append(key, user[key]);
                    }
                }
            }

            let response = await APIs.post(endpoints['register'], form, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            console.log("Response status:", response.status);

            if (response.status === 201) {
                Alert.alert("Thông báo", "Đăng ký thành công!");
                nav.navigate("Login");
            } else {
                let errorResponse = await response.json();
                Alert.alert("Đăng ký thất bại", errorResponse.message || "Có lỗi xảy ra.");
            }
        } catch (ex) {
            Alert.alert("Lỗi đăng ký tài khoản", ex.message)
            console.log("Lỗi trong quá trình đăng kí: ", ex.message);
        } finally {
            setLoading(false);
        }
    }

    const CustomIcon = ({ icon = 'default-icon', ...props }) => (
        <IconButton icon={icon} {...props} />
    );

    const updateState = (field, value) => {
        setUser(current => {
            return { ...current, [field]: value }
        })
    }

    return (
        <View style={MyStyles.container}>
            <ScrollView contentContainerStyle={MyStyles.scrollView}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                    <View style={MyStyles.header}>
                        <Text style={MyStyles.title}>Đăng ký</Text>
                    </View>
                    {fields.map(f => (
                        <View key={f.label} style={MyStyles.inputContainer}>
                            <TextInput
                                value={user[f.name]}
                                onChangeText={t => updateState(f.name, t)}
                                style={MyStyles.input}
                                label={f.label}
                                secureTextEntry={f.secureTextEntry}
                                right={<CustomIcon icon={f.icon} />}
                                error={!!error[f.name]}
                            />
                            <HelperText type="error" visible={!!error[f.name]}>
                                {error[f.name]}
                            </HelperText>
                        </View>
                    ))}

                    <TouchableRipple onPress={picker}>
                        <Text style={MyStyles.selectAvatarText}>Chọn hình đại diện...</Text>
                    </TouchableRipple>

                    {user?.avatar && <Image
                        source={{ uri: user.avatar.uri }}
                        style={MyStyles.avatar}
                    />}

                    <Button
                        style={MyStyles.button}
                        labelStyle={MyStyles.buttonText}
                        loading={loading}
                        mode="contained"
                        onPress={register}
                    >
                        Đăng ký
                    </Button>
                </KeyboardAvoidingView>
            </ScrollView>
        </View>
    );
}

const MyStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#f5f5f5',
      paddingHorizontal: 20,
      justifyContent: 'center',
    },
    scrollView: {
      flexGrow: 1,
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
    inputContainer: {
      marginBottom: 20,
    },
    input: {
      backgroundColor: '#fff',
      borderRadius: 10,
      paddingHorizontal: 15,
      height: 50,
      borderColor: '#ddd',
      borderWidth: 1,
    },
    selectAvatarText: {
      fontSize: 16,
      color: '#007BFF',
      textAlign: 'center',
      marginBottom: 20,
      textDecorationLine: 'underline',
    },
    avatar: {
      width: 100,
      height: 100,
      borderRadius: 50,
      alignSelf: 'center',
      marginBottom: 20,
    },
    button: {
      backgroundColor: '#007BFF',
      borderRadius: 10,
      paddingVertical: 10,
      marginTop: 10,
    },
    buttonText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#fff',
    },
  });
export default Register;
