import { StyleSheet } from "react-native";

export default StyleSheet.create({
    container: {
        paddingTop: 66,
        flex: 1,
        backgroundColor: '#f0f2f5', // Màu nền giống với Facebook
        padding: 10,
    },
    coverImage: {
        width: '100%',
        height: 200,
        marginBottom: 10,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        paddingHorizontal: 10,
    },
    profileAvatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderColor: '#fff',
        borderWidth: 3,
        marginTop: -50, // Để ảnh avatar lên phía trên của ảnh bìa
    },
    profileName: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#050505", // Màu chữ đậm hơn giống Facebook
    },
    postContainer: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 10,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 5 },
        elevation: 5, // Dành cho Android
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 10,
    },
    userName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#050505', // Màu chữ đậm hơn giống Facebook
    },
    content: {
        fontSize: 16,
        color: '#1c1e21', // Màu chữ đậm nhẹ cho nội dung bài viết
        marginBottom: 10,
    },
    imageScrollView: {
        marginBottom: 10,
    },
    postImage: {
        width: 300, // Chiều rộng của mỗi hình ảnh trong chế độ cuộn ngang
        height: 200,
        borderRadius: 10,
        marginRight: 10, // Khoảng cách giữa các hình ảnh
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    button: {
        flex: 1,
        alignItems: 'center',
        padding: 10,
        borderRadius: 5,
        backgroundColor: '#e4e6eb', // Màu nền xám nhạt cho nút giống Facebook
        marginHorizontal: 5,
    },
    buttonText: {
        color: '#050505', // Màu chữ đậm cho nút
        fontSize: 16,
        fontWeight: 'bold',
    },
    timeAgo: {
        marginLeft: 12,
        fontSize: 12,
        color: '#606770', // Màu xám nhạt hơn cho thời gian đăng bài
    },
    // CSS cho Login.js
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    input: {
        marginBottom: 10,
    },
    linkText: {
        textAlign: 'center',
        marginTop: 10,
        color: 'blue', // Màu chữ link
    }, modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Nền mờ cho modal
        height: '80%',
      },
      modalContent: {
        width: '90%',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        shadowColor: '#000',
        shadowOpacity: 0.25,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 5,
      },
      modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#050505', // Màu chữ đậm hơn giống Facebook
        marginBottom: 10,
      },
      selectedImage: {
        width: '100%',
        height: 200,
        borderRadius: 10,
        marginBottom: 10,
      },
      selectedVideo: {
        width: '100%',
        height: 200,
        backgroundColor: '#e4e6eb', // Màu nền xám nhẹ
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        marginBottom: 10,
      },
      modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
      },
      modalAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 10,
      },
      modalUsername: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#050505', // Màu chữ đậm hơn giống Facebook
      },
      modalInput: {
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 10,
        padding: 10,
        fontSize: 16,
        color: '#1c1e21',
        maxHeight: 200, // Giới hạn chiều cao của text input
        marginBottom: 10,
        textShadowColor : 'gray',
      },
      modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 10,
      },
      modalActionButton: {
        flex: 1,
        alignItems: 'center',
        padding: 10,
        borderRadius: 5,
        backgroundColor: '#e4e6eb',
        marginHorizontal: 5,
      },
      modalPostButton: {
        backgroundColor: '#1877f2', // Màu xanh đặc trưng của Facebook
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
        marginVertical: 10,
      },
      modalPostButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
      },
      modalCloseButton: {
          position: 'absolute',
          top: 10,
          right: 10,
          padding: 10,
          backgroundColor: 'blue',
          borderRadius: 20,
          elevation: 5, // Đổ bóng cho nút
          zIndex: 1000, // Đảm bảo nút được ưu tiên hiển thị
      },buttonCreate: {
        backgroundColor: '#1877F2', // Facebook's blue
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'center',
        margin:10
      }, text: {
        color: 'white',
        fontSize: 15,
        fontWeight: 'bold',
      },  // Nút "Chỉnh"
      editButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'lightblue',
        borderRadius: 10,
        padding: 10,
        zIndex: 10,
        size : 24
      },  modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)', // Làm tối nền khi modal hiện lên
        justifyContent: 'center',
        alignItems: 'center',
      },
      // CSS cho nội dung Modal
      modalContent: {
        width: '90%',
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5, // Hiệu ứng shadow cho Android
      },
      // CSS cho TextInput
      textInput: {
        height: 100,
        borderColor: '#dddfe2', // Màu viền giống với Facebook
        borderWidth: 1,
        borderRadius: 8,
        padding: 10,
        marginBottom: 10,
        textAlignVertical: 'top', // Đảm bảo văn bản bắt đầu từ đầu ô input
        fontSize: 16,
        lineHeight: 20,
      },
      // CSS cho container chứa hình ảnh đã chọn
      selectedImageContainer: {
        alignItems: 'center',
        marginBottom: 10,
      },
      // CSS cho hình ảnh đã chọn
      selectedImage: {
        width: 100,
        height: 100,
        resizeMode: 'cover',
        borderRadius: 8,
      },
      // CSS cho nút chọn ảnh từ thư viện
      pickImageButton: {
        alignItems: 'center',
        backgroundColor: '#f0f2f5', // Màu nền nút giống Facebook
        padding: 10,
        borderRadius: 8,
        marginBottom: 10,
      },
      // CSS cho văn bản nút chọn ảnh từ thư viện
      pickImageButtonText: {
        color: '#1877f2', // Màu xanh giống với màu của Facebook
        fontWeight: 'bold',
      },
      // CSS cho container chứa các nút
      modalButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
      },
      // CSS cho nút đăng bài viết
      submitButton: {
        flex: 1,
        marginRight: 5,
        backgroundColor: '#1877f2', // Màu xanh của nút giống với Facebook
        borderRadius: 8,
        paddingVertical: 10,
      },
      // CSS cho nút hủy
      cancelButton: {
        flex: 1,
        marginLeft: 5,
        backgroundColor: '#e4e6eb', // Màu xám nhạt cho nút Hủy giống Facebook
        borderRadius: 8,
        paddingVertical: 10,
      }, modalTitle: {
        fontSize: 20, // Tăng cỡ chữ
        fontWeight: 'bold', // Tô đậm chữ
        textAlign: 'center', // Căn giữa văn bản
        marginBottom: 15, // Khoảng cách dưới tiêu đề
        color: '#333', // Màu chữ
      },modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)', // Nền mờ đen
        justifyContent: 'center',
        alignItems: 'center',
      },
      // Nội dung của modal
      modalContent: {
        width: '80%', // Chiều rộng modal bằng 80% chiều rộng màn hình
        backgroundColor: 'white',
        borderRadius: 10, // Bo góc hộp thoại
        padding: 20, // Khoảng cách bên trong modal
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
      },
      // Phong cách cho các tùy chọn trong modal
      modalOption: {
        paddingVertical: 15, // Khoảng cách trên dưới giữa các tùy chọn
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd', // Đường viền giữa các tùy chọn
      },
      modalOptionText: {
        fontSize: 16, // Cỡ chữ
        fontWeight: '500', // Đậm vừa phải
        textAlign: 'center', // Căn giữa văn bản
        color: '#1877f2', // Màu xanh đặc trưng của Facebook
      },
      // Phong cách cho nút Hủy
      modalCancelOption: {
        paddingVertical: 15, // Khoảng cách trên dưới cho nút Hủy
        paddingHorizontal: 10,
        borderTopWidth: 1,
        borderTopColor: '#ddd', // Đường viền phía trên nút Hủy
        marginTop: 10, // Khoảng cách trên nút Hủy
      },
      modalCancelText: {
        fontSize: 16, // Cỡ chữ
        fontWeight: 'bold', // Chữ đậm cho nút Hủy
        textAlign: 'center', // Căn giữa văn bản
        color: '#FF0000', // Màu đỏ cho nút Hủy
      },
});
