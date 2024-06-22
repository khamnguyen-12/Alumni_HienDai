// import React, { useState, useEffect } from 'react';
// import { View, Text, TextInput, Button, Image, ScrollView } from 'react-native';
// import { useNavigation, useRoute } from '@react-navigation/native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import APIs, { endpoints } from "../../configs/APIs"; 
// import Styles from "./Styles";

// const EditPost = () => {
//   const [post, setPost] = useState();
//   const [content, setContent] = useState('');
//   const [images, setImages] = useState([]); // State để lưu danh sách hình ảnh của bài viết
//   const navigation = useNavigation();
//   const route = useRoute();
//   const [postId, setPostId] = useState();
//   const [selectedImages, setSelectedImages] = useState([]); // State cho các hình ảnh được chọn

//   const fetchPost = async () => {
//     try {
//       console.log(1);
//       let resPost = await APIs.get(`${endpoints['get_post']}/${postId}/`);
//       console.log(1);
//       console.log(resPost.data);
//       setPost(resPost.data);
//       setContent(resPost.data.content);
//       setImages(resPost.data.images);

//     } catch (error) {
//       console.error("Lỗi khi lấy dữ liệu bài viết:", error);
//     }
//   };

//   useEffect(() => {
//     const id = route.params?.id;
//     // console.log("Id bài viết", id);
//     if (id) {
//       setPostId(id);
//       fetchPost();
//     } else {
//       console.error("Không tìm thấy postId trong route.params");
//     }
//   }, [route.params?.id]);

//   const handleSaveEdit = async () => {
//     try {
//       const token = await AsyncStorage.getItem('access-token');
//       const formData = new FormData();
//       formData.append("content", content);

//       // Đẩy ảnh đã chọn (selectedImageURI) vào form nếu có
//       if (selectedImages) {
//         formData.append('images', {
//           uri: selectedImages.uri,
//           name: selectedImages.fileName || 'photo.jpg', // Đặt tên mặc định nếu không có fileName
//           type: selectedImages.type || 'image/jpeg'
//         });
//       }

//       let resEdit = await APIs.put(`${endpoints['edit_post']}/${postId}`, formData, {
//         headers: {
//           'Content-Type': 'multipart/form-data',
//           "Authorization": `Bearer ${token}`, // Token được đính kèm vào header của yêu cầu
//         }
//       });

//       if (resEdit.status === 200) {
//         console.log("Bài viết đã được cập nhật");
//         navigation.navigate('Profile'); // Chuyển về trang Profile sau khi chỉnh sửa thành công
//       }
//     } catch (error) {
//       console.error("Lỗi khi chỉnh sửa bài viết:", error);
//     }
//   };

//   if (!post) {
//     return <Text>Đang tải...</Text>;
//   }

//   return (
//     <View style={Styles.container}>
//       {/* Form chỉnh sửa bài viết */}
//       <View style={Styles.editForm}>
//         <TextInput
//           style={Styles.contentInput}
//           value={content}
//           onChangeText={setContent}
//           placeholder="Nội dung"
//           multiline
//           numberOfLines={4}
//         />
//         <Button title="Xác nhận chỉnh sửa" onPress={handleSaveEdit} />
//       </View>

//       {/* Hình ảnh bài đăng */}
//       {images.length > 0 && (
//         <ScrollView horizontal showsHorizontalScrollIndicator={false} style={Styles.imageScrollView}>
//           {images.map((image, index) => (
//             <Image
//               key={index}
//               style={Styles.postImage}
//               source={{ uri: image.image }}
//             />
//           ))}
//         </ScrollView>
//       )}
//     </View>
//   );
// };

// export default EditPost;


import React, { useState } from 'react';
import { View, Text, TextInput, Button, Image, ScrollView, StyleSheet  } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import APIs, { endpoints } from "../../configs/APIs";
// import Styles from "./Styles";
import * as ImagePicker from 'expo-image-picker';

const EditPost = () => {
  const [content, setContent] = useState('');
  const [selectedImages, setSelectedImages] = useState([]); // State cho các hình ảnh được chọn
  const navigation = useNavigation();
  const route = useRoute();
  const postId = route.params?.id;

  const handleImagePicker = async () => {

    try {
      let { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permissions denied!");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync();
      if (!result.canceled) {
        setSelectedImages(result.assets[0]);
        console.log("Thông tin ảnh đã được chọn: ", selectedImages);
      } else {
        Alert.alert("Bạn chưa chọn ảnh đại diện.");
        console.warn("Chưa chọn ảnh ");
      }
    } catch (error) {
      console.error("Error picking image: ", error);
      Alert.alert("Xảy ra lỗi khi chọn ảnh từ thư viện.");
    }
  };

  const handleSaveEdit = async () => {
    try {
      const token = await AsyncStorage.getItem('access-token');
      const formData = new FormData();
      formData.append("content", content);

      // Đẩy ảnh đã chọn (selectedImages) vào form nếu có
      if (selectedImages.uri) {
        formData.append('images', {
          uri: selectedImages.uri,
          name: selectedImages.fileName || 'photo.jpg', // Đặt tên mặc định nếu không có fileName
          type: selectedImages.type || 'image/jpeg'
        });
      }

      let resEdit = await APIs.patch(endpoints['edit_post'](postId), formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          "Authorization": `Bearer ${token}`,
        }
      });

      if (resEdit.status === 200) {
        console.log("Bài viết đã được cập nhật");
        navigation.navigate('Profile'); // Chuyển về trang Profile sau khi chỉnh sửa thành công
      }
    } catch (error) {
      console.error("Lỗi khi chỉnh sửa bài viết:", error);
    }
  };

  return (
    <ScrollView>
    <View style={Styles.container}>
      <Text style={Styles.title}>Chỉnh sửa bài viết</Text>

      <TextInput
        style={Styles.contentInput}
        value={content}
        onChangeText={setContent}
        placeholder="Nội dung mới của bài viết"
        multiline
        numberOfLines={4}
      />

      <Button title="Chọn hình ảnh" onPress={handleImagePicker} />

      {selectedImages.uri && (
        <Image
          source={{ uri: selectedImages.uri }}
          style={Styles.selectedImage}
        />
      )}

      <Button title="Lưu thay đổi" onPress={handleSaveEdit} />
    </View>
    </ScrollView>
  );
};



const Styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f0f0f0', // Màu nền nhẹ
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333', // Màu chữ tiêu đề
    textAlign: 'center',
  },
  contentInput: {
    width: '100%',
    minHeight: 100,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 20,
    fontSize: 16,
    color: '#333',
    textAlignVertical: 'top', // Giúp văn bản căn chỉnh từ đầu trong ô input
  },
  button: {
    width: '100%',
    padding: 15,
    backgroundColor: '#007BFF', // Màu xanh cho nút
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  selectedImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
    marginVertical: 10,
  },
});

export default EditPost;