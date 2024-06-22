import React, { useEffect, useState, useContext } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, ActivityIndicator, Modal, TextInput, Alert, RefreshControl } from 'react-native';
import { Button } from 'react-native-paper';
import Styles from "./Styles"; // Import styles từ file Styles.js
import APIs, { authApi, endpoints } from '../../configs/APIs'; // Import APIs và endpoints
import { useNavigation } from '@react-navigation/native';
import { MyUserContext } from '../../configs/Context';
import AsyncStorage from "@react-native-async-storage/async-storage";
import moment from "moment";
import "moment/locale/vi";
import * as ImagePicker from 'expo-image-picker';
import { Icon } from "react-native-elements";
import MyStyles from '../../styles/MyStyles';
import { MyDispatchContext } from '../../configs/Context'; // Adjust the path based on your project structure


const Profile = ({ onPostCreated }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const user = useContext(MyUserContext); // Lấy thông tin người dùng hiện tại từ Context
  const nav = useNavigation();
  const [coverImage, setCoverImage] = useState(''); // State cho ảnh bìa
  const [avatarImage, setAvatarImage] = useState(''); // State cho ảnh đại diện
  const [userImg, setUser] = React.useState({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]); // State cho các hình ảnh được chọn
  const [selectedImageURI, setSelectedImageURI] = useState(null);
  const [postContent, setPostContent] = useState("");
  const [refreshing, setRefreshing] = useState(false); // State cho refresh control
  const dispatch = useContext(MyDispatchContext);
  const [editMenuVisible, setEditMenuVisible] = useState(false); // State cho menu chỉnh sửa
  const [showModal, setShowModal] = useState(false); // State để điều khiển hiển thị modal nhỏ
  const [postId, setpostId] = useState();
  const navigation = useNavigation(); 

  // Hàm để lấy bài đăng của người dùng hiện tại
  const fetchUserPosts = async () => {
    setLoading(true); // Bắt đầu tải
    try {
      let token = await AsyncStorage.getItem('access-token'); // Lấy token từ AsyncStorage
      const resposts = await APIs.get(endpoints['user_post'], {
        headers: {
          Authorization: `Bearer ${token}` // Thêm token vào headers
        }
      });

      if (resposts.status === 200) {

        const sortedPosts = resposts.data.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
        setPosts(sortedPosts);
        // setPosts(resposts.data); // Cập nhật danh sách bài đăng
      }
    } catch (error) {
      console.error('Lỗi khi lấy danh sách bài đăng:', error); // Xử lý lỗi nếu có
    } finally {
      setLoading(false); // Kết thúc tải
    }
  };

  // Hàm để lấy thông tin người dùng hiện tại
  const fetchUserInfo = async () => {
    try {
      let token = await AsyncStorage.getItem('access-token'); // Lấy token từ AsyncStorage
      const res = await APIs.get(endpoints['current_user'], {
        headers: {
          Authorization: `Bearer ${token}` // Thêm token vào headers
        }
      });

      if (res.status === 200) {
        setAvatarImage(res.data.avatar || 'https://example.com/default-avatar.png'); // Cập nhật ảnh đại diện
        setCoverImage(res.data.cover_image || 'https://example.com/default-cover-image.png'); // Cập nhật ảnh bìa
      }
    } catch (error) {
      console.error('Lỗi khi lấy thông tin người dùng:', error); // Xử lý lỗi nếu có
    }
  };


  // Hàm xử lý đăng bài viết mới
  const handleSubmitPost = async () => {
    if (!postContent.trim()) {
      Alert.alert("Thông báo", "Nội dung bài viết không được để trống.");
      return;
    }
    setLoading(true); // Bắt đầu quá trình tải

    try {
      // Lấy token của user đang đăng nhập hiện tại
      const token = await AsyncStorage.getItem("access-token");

      const formData = new FormData();
      formData.append("content", postContent);

      // Đẩy ảnh đã chọn (selectedImageURI) vào form nếu có
      if (selectedImages) {
        formData.append('images', {
          uri: selectedImages.uri,
          name: selectedImages.fileName || 'photo.jpg', // Đặt tên mặc định nếu không có fileName
          type: selectedImages.type || 'image/jpeg'
        });
      }

      const response = await APIs.post(endpoints["create_post"], formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${token}`, // Token được đính kèm vào header của yêu cầu
        },
      });

      if (response.status === 201) {
        Alert.alert("Bài viết mới đã được tạo!");
        if (onPostCreated) {  // Kiểm tra nếu onPostCreated có được truyền vào
          onPostCreated(response.data);
        }
        closeCreatePostModal();
      }
    } catch (error) {
      console.error("Lỗi khi đăng bài viết:", error);
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi đăng bài viết.");
    } finally {
      setLoading(false); // Kết thúc quá trình tải
    }
  };

  // Hàm chọn ảnh từ thư viện
  const pickImage = async () => {
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

  // Hàm đăng xuất
  const handleLogout = async () => {
    try {
      // Xóa access-token từ AsyncStorage
      await AsyncStorage.removeItem('access-token');
      console.log("Access token đã được xóa.");

    // Đặt user về null trong MyDispatchContext để cập nhật trạng thái đăng nhập
      dispatch({ type: 'logout' });

      // Chuyển hướng về màn hình đăng nhập
      nav.navigate('Login')
    } catch (error) {
      console.error('Lỗi khi đăng xuất:', error);
    }
  };
  const handleRefresh = async () => {
    setRefreshing(true); // Bắt đầu trạng thái làm mới
    try {
        await fetchUserPosts(); // Gọi hàm để lấy danh sách bài đăng mới
    } catch (error) {
        console.error('Lỗi khi làm mới bài đăng:', error);
    } finally {
        setRefreshing(false); // Kết thúc trạng thái làm mới
    }
};

  // Hàm chọn ảnh bìa từ thư viện
  const pickCoverImage = async () => {
    try {
      let { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permissions denied!");
        return;
      }
  
      const result = await ImagePicker.launchImageLibraryAsync();
      if (!result.canceled) {
        const selectedImage = result.assets[0];
        setCoverImage(selectedImage.uri); // Cập nhật ảnh bìa ngay lập tức
  
        // Nếu bạn muốn cập nhật ảnh bìa trên server
        let token = await AsyncStorage.getItem('access-token');
        const formData = new FormData();
        formData.append('cover_image', {
          uri: selectedImage.uri,
          name: selectedImage.fileName || 'cover.jpg',
          type: selectedImage.type || 'image/jpeg',
        });
  
        const response = await APIs.patch(endpoints['update_cover_image'], formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`,
          },
        });
  
        if (response.status === 200) {
          Alert.alert('Ảnh bìa đã được cập nhật thành công!');
        }
      }
    } catch (error) {
      console.error('Error picking cover image: ', error);
      Alert.alert('Xảy ra lỗi khi chọn ảnh từ thư viện.');
    }
  };
  // Hàm đóng modal tạo bài viết
  const closeCreatePostModal = () => {
    setIsModalVisible(false);
    setSelectedImageURI(null);
    setPostContent("");
    setEditMenuVisible(false); // Đóng menu chỉnh sửa khi đóng modal
  };

  // Hàm mở modal tạo bài viết
  const openCreatePostModal = () => {
    setIsModalVisible(true);
  };

  const openModal = () => {
    setEditMenuVisible(false); // Ẩn menu chỉnh sửa khi mở modal nhỏ
    setShowModal(true);
  };

  // Handler để đóng modal
  const closeModal = () => {
    setShowModal(false);
  };

  // Hàm xử lý event xóa bài viết
  const handleDeletePost = async () => {
    
    const token = await AsyncStorage.getItem("access-token");
    if (!token) {
      console.error("Người dùng chưa đăng nhập");
      return;
    }
    console.log("Token người dùng hiện tại: ", token)
    try {
      const resdele = await APIs.delete(`${endpoints['delete_post']}${postId}/`,{
        headers: {
          'Authorization': `Bearer ${token}`
        },
      }
      )
      if(resdele.status == 204)
        Alert.alert("Bài viết đã được xóa!");
        closeModal();
      console.log(resdele.status)                     
      setPosts((currentPosts) =>
        currentPosts.filter((post) => post.id !== postId)
      );
    } catch (error) {
      console.error("Lỗi không thể xóa bài viết:", error);
      Alert.alert("Error", "Lỗi không thể xóa bài viết");
    }
  };

  const handleEditPost =  ()=> {
    // Tạm thời không có hành động
    console.log('Chỉnh sửa bài viết');
    console.log(postId);

    // closeModal(); // Đóng modal khi bấm chỉnh sửa
    navigation.navigate("EditPost", { id: postId});
    closeModal();
  };


  // Gọi hàm fetchUserPosts khi component mount
  useEffect(() => {
    fetchUserPosts();
    fetchUserInfo();
  }, []);

  return (
    <ScrollView
      style={Styles.container}
      refreshControl={
          <RefreshControl
              refreshing={refreshing} // Trạng thái làm mới
              onRefresh={handleRefresh} // Gọi hàm làm mới khi kéo xuống
          />
      }
    >
      {/* Ảnh bìa (có thể đổi ảnh bìa) */}
      <TouchableOpacity onPress={pickCoverImage}>
        <Image
          style={Styles.coverImage}
          source={{ uri: coverImage }}
          onError={(error) => console.log('Image load error:', error)}
        />
      </TouchableOpacity>

      {/* Thông tin người dùng */}
      <View style={Styles.userInfo}>
        <Image
          style={Styles.profileAvatar}
          source={{ uri: avatarImage }}
          onError={(error) => console.log('Image load error:', error)}
        />
        <Text style={Styles.profileName}>
          {user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : 'Người dùng'}
        </Text>
      </View>

      {/* Nút tạo bài viết */}
      <TouchableOpacity style={Styles.buttonCreate} onPress={openCreatePostModal}>
        <Text style={Styles.text}>Tạo bài viết</Text>
      </TouchableOpacity>

        {/* Modal tạo bài viết */}
        <Modal visible={isModalVisible} animationType="slide" transparent={true}>
          <View style={Styles.modalOverlay}>
            <View style={Styles.modalContent}>

            <Text style={Styles.modalTitle}>TẠO BÀI ĐĂNG MỚI</Text> 
              
              <TextInput
                style={Styles.textInput}
                placeholder="Nhập nội dung bài viết"
                placeholderTextColor={'lightgray'}
                value={postContent}
                onChangeText={setPostContent}
                multiline
              />
              {selectedImages && (
                <View style={Styles.selectedImageContainer}>
                  <Image source={{ uri: selectedImages.uri }} style={Styles.selectedImage} />
                </View>
              )}
              <TouchableOpacity onPress={pickImage} style={Styles.pickImageButton}>
                <Text style={Styles.pickImageButtonText}>Chọn ảnh từ thư viện</Text>
              </TouchableOpacity>
              <View style={Styles.modalButtonsContainer}>
                <Button mode="contained" onPress={handleSubmitPost} style={Styles.submitButton}>
                  Đăng bài viết
                </Button>
                <Button mode="contained" onPress={closeCreatePostModal} style={Styles.cancelButton}>
                  Hủy
                </Button>
              </View>
            </View>
          </View>
        </Modal>

      {/* Modal Chỉnh */}
      <Modal
      animationType="slide"
      transparent={true}
      visible={showModal}
      onRequestClose={closeModal}
    >
          <View style={Styles.modalContainer}>
          <View style={Styles.modalContent}>
            <TouchableOpacity onPress={() => handleDeletePost()} style={Styles.modalOption}>
              <Text style={Styles.modalOptionText}>Xóa bài viết</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleEditPost()} style={Styles.modalOption}>
              <Text style={Styles.modalOptionText}>Chỉnh sửa bài viết</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={closeModal} style={Styles.modalCancelOption}>
              <Text style={Styles.modalCancelText}>Hủy</Text>
            </TouchableOpacity>
          </View>
        </View>      
       
      
      </Modal>  
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <View>
          {posts.length > 0 ? (
            posts.map(post => (
              <View key={post.id} style={Styles.postContainer}>
                
                {/* Button "Chỉnh" */}
                <TouchableOpacity
                  style={Styles.editButton}
                  onPress={() => {
                    openModal();
                    setpostId(post.id);
                  }}
                >
                  <Text>Chỉnh</Text>
                  <Icon name="edit" type="font-awesome" color="#000" size={24} />
                </TouchableOpacity>
                
                <View style={Styles.header}>
                  <Image
                    style={Styles.avatar}
                    source={{ uri: post.user.avatar || 'https://example.com/default-avatar.png' }}
                    onError={(error) => console.log('Image load error:', error)}
                  />
                  <Text style={Styles.userName}>
                    {post.user.first_name || post.user.last_name ? `${post.user.first_name} ${post.user.last_name}` : 'Người dùng'}
                  </Text>
                  <Text style={Styles.timeAgo}>
                    {moment(post.created_date).fromNow()}
                  </Text>
                </View>
                <Text style={Styles.content}>{post.content}</Text>
                {/* Hiển thị các ảnh của bài đăng */}
                {post.images && post.images.length > 0 && (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={Styles.imageScrollView}>
                    {post.images.map((image, index) => (
                      <Image
                        key={index}
                        style={Styles.postImage}
                        source={{ uri: image.image }}
                        onError={(error) => console.log('Image load error:', error)}
                      />
                    ))}
                  </ScrollView>
                )}
                <View style={Styles.footer}>
                  <TouchableOpacity style={Styles.button}>
                    <Text style={Styles.buttonText}>React</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={Styles.button}
                    onPress={() => nav.navigate('PostDetailScreen', { post, postId: post.id })}
                  >
                    <Text style={Styles.buttonText}>Comment</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <Text>Không có bài đăng nào.</Text>
          )}
        </View>
      )}

      <Button style={Styles.button} onPress={handleLogout}>Đăng xuất</Button>
    </ScrollView>
  );
};

export default Profile;
