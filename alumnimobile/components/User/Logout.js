// import { useContext } from "react"
// import { Button } from "react-native-paper"
// import MyUserContext from "../../configs/Context"
// import AsyncStorage from "@react-native-async-storage/async-storage";


// const Logout = () => {
//     const [user, dispatch, isAuthenticated, setIsAuthenticated] = useContext(MyUserContext);

//     const logout = async () => {
//         dispatch({
//             "type": "logout"
//         })
//         setRole(null);
//         console.log("Đăng xuất thành công!");
//         if (AsyncStorage.setItem('access-token', "null")) {
//             setIsAuthenticated(false);
//         }
       
//     }


//     return <Button icon="logout-variant" onPress={logout} style={{ marginTop: 10 }} labelStyle={{ marginHorizontal: 0 }}></Button>
// }
// export default Logout();