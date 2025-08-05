import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';

// Mock data since API is not connected yet
const mockFriends = [
  { id: '1', nickname: 'Alice', status: 'awake' },
  { id: '2', nickname: 'Bob', status: 'asleep' },
  { id: '3', nickname: 'Charlie', status: 'awake' },
];

const HomePage = () => {
  // const { user, logout } = useContext(AuthContext); // TODO: Migrate AuthContext
  const [friends, setFriends] = useState(mockFriends);
  const [status, setStatus] = useState('awake');
  // const toastRef = useRef(null); // TODO: Migrate Toast component

  // useEffect(() => { ... }); // TODO: Migrate API calls and socket logic

  const handleStatusChange = (value: boolean) => {
    const newStatus = value ? 'awake' : 'asleep';
    setStatus(newStatus);
    // TODO: Call API to update status
  };

  const handlePoke = (friendId: string) => {
    console.log(`Poking friend ${friendId}`);
    // TODO: Call API to poke friend
  };

  const renderFriend = ({ item }: { item: { id: string; nickname: string; status: string } }) => (
    <View style={styles.friendCard}>
      <View style={styles.friendInfo}>
        <Text style={styles.friendName}>{item.nickname}</Text>
        <Text style={styles.friendStatus}>
          {item.status === 'awake' ? '😴 Awake' : '🤫 Asleep'}
        </Text>
      </View>
      {item.status === 'awake' && (
        <TouchableOpacity style={styles.pokeButton} onPress={() => handlePoke(item.id)}>
          <Text style={styles.pokeButtonText}>Poke</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* <Toast ref={toastRef} /> */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerText}>Your Status:</Text>
          <Text style={styles.statusText}>{status === 'awake' ? '😴 Awake' : '🤫 Asleep'}</Text>
        </View>
        <Switch
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={status === 'awake' ? '#f5dd4b' : '#f4f3f4'}
          onValueChange={handleStatusChange}
          value={status === 'awake'}
        />
      </View>

      <Text style={styles.title}>Friends</Text>
      <FlatList
        data={friends}
        renderItem={renderFriend}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.emptyText}>No friends yet. Add some!</Text>}
      />

      <View style={styles.footer}>
        <Link href="/friends/requests" style={styles.footerLink}>Friend Requests</Link>
        <Link href="/friends/add" style={styles.footerLink}>Add Friend</Link>
        <TouchableOpacity onPress={() => console.log('Logout') /* TODO: logout() */}>
            <Text style={[styles.footerLink, {color: '#ff4d4d'}]}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 40, // Adjust for status bar
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerText: {
    fontSize: 16,
    color: '#333',
  },
  statusText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  friendCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    marginHorizontal: 10,
    marginBottom: 10,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  friendInfo: {},
  friendName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  friendStatus: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  pokeButton: {
    backgroundColor: '#1e90ff',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  pokeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#888',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  footerLink: {
      color: '#1e90ff',
      fontSize: 16,
      fontWeight: 'bold',
  }
});

export default HomePage;