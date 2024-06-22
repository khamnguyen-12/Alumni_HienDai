
import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, KeyboardAvoidingView } from 'react-native';
import { collection, addDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../../configs/firebase';
import APIs, { authApi, endpoints } from '../../configs/APIs'; // Import APIs và endpoints
import { MyUserContext } from '../../configs/Context';

const Chat = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
    const user = useContext(MyUserContext);

  useEffect(() => {
    const q = query(collection(db, 'messages'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let msgs = [];
      snapshot.forEach(doc => {
        msgs.push({ ...doc.data(), id: doc.id });
      });
      setMessages(msgs);
    });
    return () => unsubscribe();
  }, []);

  const sendMessage = async () => {
    console.log(user)
    if (message.trim()) {
      await addDoc(collection(db, 'messages'), {
        text: message,
        createdAt: new Date(),
        ten:user.first_name + user.last_name,
        userId: user.id,
      });
      setMessage('');
    }
  };

  const renderItem = ({ item }) => {
    const isSentByCurrentUser = item.userId === user.id;
    return (
      <View style={[styles.message, { alignSelf: isSentByCurrentUser ? 'flex-end' : 'flex-start' }]}>
        <Text style={{ fontSize: 12, color: '#888' }}>{item.createdAt.toDate().toLocaleString()}</Text>
        <Text style={{ fontSize: 18, color: 'red' }} >{item.ten}</Text>
        <Text>{item.text}</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior='padding'
      keyboardVerticalOffset={80}
    >
      <View style={styles.container}>
        <FlatList
          data={messages}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          inverted
        />
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={message}
            onChangeText={setMessage}
            placeholder="Nhập tin nhắn..."
          />
          <Button title="Gửi" onPress={sendMessage} />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  message: {
    marginVertical: 5,
    padding: 10,
    backgroundColor: '#f1f1f1',
    borderRadius: 5,
    maxWidth: '80%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
  },
});

export default Chat;