
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../hooks/useAuth';
import api from '../../api/api';

export default function ProfilePage() {
  const { user, logout, updateUser } = useAuth();
  const [avatar, setAvatar] = useState<string | null>(null);

  useEffect(() => {
    console.log('[Profile] User object changed:', user);
    if (user?.avatar_url) {
      const avatarUrl = `${process.env.EXPO_PUBLIC_API_URL}${user.avatar_url}`;
      console.log(`[Profile] Setting avatar from user.avatar_url: ${avatarUrl}`);
      setAvatar(avatarUrl);
    } else {
      console.log('[Profile] User has no avatar_url, setting avatar to null.');
      setAvatar(null);
    }
  }, [user]);

  const handleChooseAvatar = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permission Denied", "You've refused to allow this app to access your photos!");
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
    });

    if (!pickerResult.canceled) {
        const uri = pickerResult.assets[0].uri;
        console.log(`[Profile] Image picked. URI: ${uri}`);
        setAvatar(uri); // Temporarily display the local image
        handleUpload(uri);
    }
  };

  const handleUpload = async (uri: string) => {
      const formData = new FormData();
      const fileType = uri.split('.').pop();
      const fileName = `avatar_${user.id}.${fileType}`;

      if (Platform.OS === 'web') {
        const response = await fetch(uri);
        const blob = await response.blob();
        formData.append('avatar', blob, fileName);
      } else {
        formData.append('avatar', {
            uri,
            name: fileName,
            type: `image/${fileType}`,
        } as any);
      }

      try {
          console.log('[Profile] Uploading avatar...');
          const response = await api.put('/users/avatar', formData, {
              headers: {
                  'Content-Type': 'multipart/form-data',
              },
          });
          console.log('[Profile] Avatar uploaded successfully. Response:', response.data);
          Alert.alert('Success', 'Avatar updated successfully!');
          const newAvatarUrl = response.data.avatarUrl;
          updateUser({ avatar_url: newAvatarUrl });
      } catch (error) {
          console.error('[Profile] Failed to upload avatar:', error.response?.data || error.message);
          Alert.alert('Error', 'Failed to upload avatar.');
          // Revert on failure
          setAvatar(user?.avatar_url ? `${process.env.EXPO_PUBLIC_API_URL}${user.avatar_url}` : null);
      }
  }

  console.log(`[Profile] Rendering with avatar state: ${avatar}`);

  return (
    <View style={styles.container}>
        <TouchableOpacity onPress={handleChooseAvatar}>
            <Image 
                source={avatar ? { uri: avatar } : require('../../assets/images/icon.png')} 
                style={styles.avatar}
                onError={(e) => console.error(`[Profile] Image load error for URI: ${avatar}`, e.nativeEvent.error)}
            />
        </TouchableOpacity>
        <Text style={styles.nickname}>{user?.nickname || user?.username}</Text>
        <Text style={styles.username}>@{user?.username}</Text>

        <TouchableOpacity style={styles.button} onPress={handleChooseAvatar}>
            <Text style={styles.buttonText}>Change Avatar</Text>
        </TouchableOpacity>


        <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={logout}>
            <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 50,
    backgroundColor: '#f0f4f8',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
    backgroundColor: '#ccc',
  },
  nickname: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  username: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  
  button: {
    width: '80%',
    height: 50,
    backgroundColor: '#1e90ff',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  logoutButton: {
      backgroundColor: '#ff4d4d',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
