import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, FlatList, Button, StyleSheet, TouchableOpacity } from 'react-native';
import Toast from 'react-native-toast-message';
import { searchUsers, sendFriendRequest, getFriendRequests, acceptFriendRequest } from '../../api/api';
import { useFocusEffect } from 'expo-router';

const SocialPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);

  const fetchFriendRequests = async () => {
    try {
      const response = await getFriendRequests();
      setFriendRequests(response.data);
    } catch (error) {
      console.error('Failed to fetch friend requests:', error);
    }
  };

  // useFocusEffect to refetch data when the screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchFriendRequests();
    }, [])
  );

  const handleSearch = async () => {
    if (searchQuery.trim() === '') return;
    try {
      const response = await searchUsers(searchQuery);
      setSearchResults(response.data);
    } catch (error) {
      console.error('Failed to search users:', error);
      Alert.alert('Error', 'Failed to search for users.');
    }
  };

  const handleAddFriend = async (userId: string) => {
    try {
      await sendFriendRequest(userId);
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Friend request sent!',
      });
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to send friend request.';
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: errorMessage,
      });
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await acceptFriendRequest(requestId);
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Friend request accepted!',
      });
      fetchFriendRequests(); // Refresh the list
    } catch (error) {
      console.error('Failed to accept friend request:', error.response?.data || error.message);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Failed to accept friend request.',
      });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Add Friends</Text>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter username"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <Button title="Search" onPress={handleSearch} />
        </View>
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => {
            if (!item) return null; // Add this check
            return (
              <View style={styles.listItem}>
                <Text>{item.nickname || item.username}</Text>
                <Button title="Add" onPress={() => handleAddFriend(item.id)} />
              </View>
            );
          }}
          ListEmptyComponent={<Text style={styles.emptyText}>Search for users to add.</Text>}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Friend Requests</Text>
        <FlatList
          data={friendRequests}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => {
            if (!item) return null; // Add this check
            return (
              <View style={styles.listItem}>
                <Text>{item.nickname || item.username}</Text>
                <Button title="Accept" onPress={() => handleAcceptRequest(item.id)} />
              </View>
            );
          }}
          ListEmptyComponent={<Text style={styles.emptyText}>No pending friend requests.</Text>}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
    padding: 10,
  },
  section: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 10,
  },
});

export default SocialPage;