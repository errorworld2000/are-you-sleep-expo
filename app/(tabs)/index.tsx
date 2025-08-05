
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Switch, TouchableOpacity, Modal, Image, Platform, Alert } from 'react-native';
import Toast from 'react-native-toast-message';
import { useAuth } from '../../hooks/useAuth';
import { getFriends, updateStatus, poke, updateMood } from '../../api/api';
import io from 'socket.io-client';

const POKE_TYPES = [
  { key: 'default', label: 'Poked you!', emoji: '👉' },
  { key: 'coffee', label: 'Sent you a coffee', emoji: '☕️' },
  { key: 'sleep', label: 'Time to sleep', emoji: '😴' },
  { key: 'wake_up', label: 'Wake up!', emoji: '☀️' },
];

const MOOD_OPTIONS = [
  { key: 'happy', label: 'Happy', emoji: '😊' },
  { key: 'studying', label: 'Studying', emoji: '📚' },
  { key: 'gaming', label: 'Gaming', emoji: '🎮' },
  { key: 'working', label: 'Working', emoji: '💻' },
  { key: 'chilling', label: 'Chilling', emoji: '🛋️' },
];

const HomePage = () => {
  const { user } = useAuth();
  const [friends, setFriends] = useState([]);
  const [status, setStatus] = useState(user?.status || 'awake');
  const [mood, setMood] = useState(user?.mood || null);
  const [showPokeOptions, setShowPokeOptions] = useState(false);
  const [selectedFriendForPoke, setSelectedFriendForPoke] = useState(null);
  const [showMoodOptions, setShowMoodOptions] = useState(false);

  const fetchFriends = async () => {
    try {
      const response = await getFriends();
      setFriends(response.data);
    } catch (error) {
      console.error('Failed to fetch friends:', error);
    }
  };

  useEffect(() => {
    if (user) {
      setStatus(user.status);
      setMood(user.mood);
      fetchFriends();
    }

    const socket = io(process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001');

    socket.on('connect', () => {
      if (user?.id) {
        socket.emit('authenticate', user.id);
      }
    });

    socket.on('statusChanged', ({ userId, status }) => {
      setFriends((prevFriends) =>
        prevFriends.map((friend) =>
          friend.id === userId ? { ...friend, status } : friend
        )
      );
    });

    socket.on('poke', ({ from, type }) => {
      const pokeLabel = POKE_TYPES.find(p => p.key === type)?.label || POKE_TYPES[0].label;
      const message = `${from.nickname} ${pokeLabel}!`;
      Toast.show({
        type: 'info',
        text1: 'Poke!',
        text2: message,
      });
    });

    socket.on('moodChanged', ({ userId, mood }) => {
      setFriends((prevFriends) =>
        prevFriends.map((friend) =>
          friend.id === userId ? { ...friend, mood } : friend
        )
      );
    });

    socket.on('friendRequestAccepted', fetchFriends);

    return () => {
      socket.disconnect();
    };
  }, [user]);

  const handleStatusChange = async (value: boolean) => {
    const newStatus = value ? 'awake' : 'asleep';
    setStatus(newStatus);
    try {
      await updateStatus(newStatus);
    } catch (error) {
      console.error('Failed to update status:', error);
      setStatus(!value ? 'awake' : 'asleep'); // Revert on failure
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to update status.',
      });
    }
  };

  const handlePoke = (friendId: string) => {
    setSelectedFriendForPoke(friendId);
    setShowPokeOptions(true);
  };

  const sendPoke = async (pokeType: string) => {
    if (!selectedFriendForPoke) return;
    console.log(`[Mobile] Sending poke to friend ${selectedFriendForPoke} with type ${pokeType}`);
    try {
      const response = await poke(selectedFriendForPoke, pokeType);
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: response.data.message || 'Poked!',
      });
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to poke friend.';
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: errorMessage,
      });
    } finally {
      setShowPokeOptions(false);
      setSelectedFriendForPoke(null);
    }
  };

  const handleSetMood = async (selectedMood: string) => {
    setMood(selectedMood);
    try {
      await updateMood(selectedMood);
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Mood updated!',
      });
    } catch (error) {
      console.error('Failed to update mood:', error);
      Alert.alert('Error', 'Failed to update mood.');
      setMood(user?.mood || null); // Revert on failure
    } finally {
      setShowMoodOptions(false);
    }
  };

  const renderFriend = ({ item }) => {
    if (!item || (!item.nickname && !item.username)) {
      return null;
    }
    const friendAvatarUri = item.avatar_url ? `${process.env.EXPO_PUBLIC_API_URL}${item.avatar_url}` : require('../../assets/images/icon.png');
    const friendMood = item.mood ? MOOD_OPTIONS.find(m => m.key === item.mood)?.emoji || item.mood : 'Not set';

    return (
      <View style={styles.friendCard}>
        <Image
          source={typeof friendAvatarUri === 'string' ? { uri: friendAvatarUri } : friendAvatarUri}
          style={styles.friendAvatar}
        />
        <View style={styles.friendInfo}>
          <Text style={styles.friendName}>{item.nickname || item.username}</Text>
          <Text style={styles.friendStatus}>
            {item.status === 'awake' ? '😴 Awake' : '🤫 Asleep'}
          </Text>
          {item.mood && <Text style={styles.friendMood}>Mood: {friendMood}</Text>}
        </View>
        {item.status === 'awake' && (
          <TouchableOpacity style={styles.pokeButton} onPress={() => handlePoke(item.id)}>
            <Text style={styles.pokeButtonText}>Poke</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
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

      <View style={styles.moodSection}>
        <Text style={styles.moodText}>Your Mood: {mood ? MOOD_OPTIONS.find(m => m.key === mood)?.emoji || mood : 'Not set'}</Text>
        <TouchableOpacity style={styles.setMoodButton} onPress={() => setShowMoodOptions(true)}>
          <Text style={styles.setMoodButtonText}>Set Mood</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>Friends</Text>
      <FlatList
        data={friends}
        renderItem={renderFriend}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={<Text style={styles.emptyText}>No friends yet. Add some!</Text>}
      />

      {/* Poke Options Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showPokeOptions}
        onRequestClose={() => setShowPokeOptions(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Choose a Poke</Text>
            {POKE_TYPES.map((type) => (
              <TouchableOpacity
                key={type.key}
                style={styles.modalButton}
                onPress={() => sendPoke(type.key)}
              >
                <Text style={styles.modalButtonText}>{type.emoji} {type.label}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.modalButton, styles.modalCancelButton]}
              onPress={() => setShowPokeOptions(false)}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Mood Options Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showMoodOptions}
        onRequestClose={() => setShowMoodOptions(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Set Your Mood</Text>
            {MOOD_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.key}
                style={styles.modalButton}
                onPress={() => handleSetMood(option.key)}
              >
                <Text style={styles.modalButtonText}>{option.emoji} {option.label}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.modalButton, styles.modalCancelButton]}
              onPress={() => setShowMoodOptions(false)}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    paddingHorizontal: 20,
    paddingVertical: 15,
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
  moodSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  moodText: {
    fontSize: 16,
    color: '#333',
  },
  setMoodButton: {
    backgroundColor: '#28a745',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  setMoodButtonText: {
    color: '#fff',
    fontWeight: 'bold',
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
  friendAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
    backgroundColor: '#ccc',
  },
  friendMood: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
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
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  modalButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 15,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalButtonText: {
    fontSize: 18,
    color: '#333',
  },
  modalCancelButton: {
    backgroundColor: '#e0e0e0',
  },
});

export default HomePage;
