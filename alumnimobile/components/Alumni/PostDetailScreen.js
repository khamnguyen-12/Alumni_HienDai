import React from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, RefreshControl, Alert, KeyboardAvoidingView, Platform  } from 'react-native';
import MyStyles from "../../styles/MyStyles"; // Import styles từ file MyStyles.js
import moment from 'moment';
import APIs, { endpoints } from "../../configs/APIs"; 
import { ActivityIndicator, TextInput, Button } from 'react-native-paper';
import { isCloseToBottom } from "../../configs/Utils";
import AsyncStorage from '@react-native-async-storage/async-storage';

const PostDetailScreen = ({ route, navigation }) => {
    const { post, postId } = route.params;
    const [comments, setComments] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [page, setPage] = React.useState(1);
    const [refreshing, setRefreshing] = React.useState(false);
    const [commentText, setCommentText] = React.useState('');

    // Hàm load bình luận từ API
    const loadComments = async (reset = false) => {
        setLoading(true); // Đánh dấu đang tải bình luận
        try {
            let url = `${endpoints['comments'](postId)}?page=${page}`;
            let res = await APIs.get(url);
            
            if (reset) {
                setComments(res.data.results);
            } else {
                setComments(current => [...current, ...res.data.results]);
            }

            if (!res.data.next) {
                setPage(0); // Đã đến trang cuối cùng
            } else {
                setPage(page + 1); // Tăng số trang lên
            }
        } catch (error) {
            console.error("Lỗi khi tải bình luận:", error);
        } finally {
            setLoading(false); // Kết thúc trạng thái tải
            setRefreshing(false); // Kết thúc trạng thái làm mới
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadComments(true); // Load lại bình luận từ đầu
    };

    React.useEffect(() => {
        loadComments();
    }, [postId]);

    const loadMoreComments = ({ nativeEvent }) => {
        if (!loading && page > 0 && isCloseToBottom(nativeEvent)) {
            loadComments();
        }
    };
    const handleCommentSubmit = async () => {
        if (!commentText.trim()) {
            Alert.alert("Thông báo", "Vui lòng nhập nội dung bình luận");
            return;
        }

        setLoading(true);
        try {
            let token = await AsyncStorage.getItem('access-token'); // Lấy token từ AsyncStorage

            const response = await APIs.post(endpoints.add_comments(postId), { comment: commentText }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const newComment = response.data;
            // Thêm comment mới vào đầu danh sách
            setComments(current => [newComment, ...current]);
            setCommentText(''); // Xóa nội dung trong ô nhập liệu
            Alert.alert("Thông báo", "Bình luận của bạn đã được gửi thành công.");
        } catch (error) {
            console.error("Lỗi khi gửi bình luận:", error);
            Alert.alert("Lỗi", "Đã xảy ra lỗi khi gửi bình luận. Vui lòng thử lại sau.");
        } finally {
            setLoading(false);
        }
    };
    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={MyStyles.container}
        >
            <ScrollView
                contentContainerStyle={MyStyles.scrollViewContent}
                onScroll={({ nativeEvent }) => loadMoreComments({ nativeEvent })}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                    />
                }
            >
                {/* Header với avatar và tên người dùng */}
                <View style={MyStyles.header}>
                    <Image
                        style={MyStyles.avatar}
                        source={{ uri: post.user.avatar || 'https://example.com/default-avatar.png' }}
                    />
                    <Text style={MyStyles.userName}>
                        {post.user.first_name || post.user.last_name ? `${post.user.first_name} ${post.user.last_name}` : 'Người dùng'}
                    </Text>
                </View>
    
                {/* Nội dung bài viết */}
                <Text style={MyStyles.content}>{post.content}</Text>
    
                {/* Hình ảnh bài đăng */}
                {post.images && post.images.length > 0 && (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={MyStyles.imageScrollView}>
                        {post.images.map((image, index) => (
                            <Image
                                key={index}
                                style={MyStyles.postImage}
                                source={{ uri: image.image }}
                            />
                        ))}
                    </ScrollView>
                )}
    
                {/* Ô nhập liệu cho bình luận */}
                <View style={MyStyles.commentInputContainer}>
                    <TextInput
                        style={MyStyles.commentInput}
                        placeholder="Viết bình luận..."
                        multiline
                        value={commentText}
                        onChangeText={text => setCommentText(text)}
                    />
                    <Button mode="contained" onPress={handleCommentSubmit} loading={loading}>
                        Gửi
                    </Button>
                </View>
    
    
                {/* Danh sách các bình luận */}
                <View style={MyStyles.commentsSection}>
                    <Text style={MyStyles.commentsTitle}>Bình luận</Text>
                    {comments.length > 0 ? comments.map((comment, index) => (
                        <View key={index} style={MyStyles.commentItem}>
                            <Image
                                style={MyStyles.commentAvatar}
                                source={{ uri: comment.user.avatar }}
                            />
                            <View style={MyStyles.commentContent}>
                                <Text style={MyStyles.commentUser}>
                                    {comment.user.first_name} {comment.user.last_name}
                                </Text>
                                <Text style={MyStyles.commentText}>{comment.comment}</Text>
                                <Text style={MyStyles.commentDate}>{moment(comment.created_date).fromNow()}</Text>
                            </View>
                        </View>
                    )) : (
                        <Text>Chưa có bình luận nào.</Text>
                    )}
                    {loading && <ActivityIndicator />}
                </View>
    
                {/* Nút quay lại */}
                <TouchableOpacity onPress={() => navigation.goBack()} style={MyStyles.button}>
                    <Text style={MyStyles.buttonText}>Quay lại</Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
    
}

export default PostDetailScreen;
