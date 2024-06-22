import axios from "axios";
// import AsyncStorage from '@react-native-async-storage/async-storage';


// const BASE_URL = "https://kham77bd.pythonanywhere.com/" 
const BASE_URL = "http://192.168.1.233:8000/"
// const BASE_URL = "http://127.0.0.1:8000/"

export const endpoints = {
    'posts' : '/posts/list-random-posts/',
    'comments' : (postId) => `/posts/${postId}/list_comments/`,
    'register' : '/users/',
    'login' : '/o/token/',
    'current_user': '/users/current_user/',
    'user_post' :'/users/list_posts/',
    'create_post' : 'users/create_posts/',
    'add_comments' : (postId) => `/posts/${postId}/comments/`,
    'update_cover_image' : 'users/current-user/',
    'delete_post' : '/posts/',
    'edit_post' : (postId) => `/posts/${postId}/`,
}

export const authApi = (token) => {
    return axios.create({
        baseURL: BASE_URL,
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
};


export default axios.create({
    baseURL: BASE_URL
})