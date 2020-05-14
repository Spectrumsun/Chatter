import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StatusBar,
  FlatList,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
  Platform,
  Alert,
  YellowBox,
  ToastAndroid,
} from 'react-native';
import {
  RTCPeerConnection,
  mediaDevices,
  RTCSessionDescription,
  RTCIceCandidate,
} from 'react-native-webrtc';
import faker from 'faker';

import io from 'socket.io-client';

import {PERMISSIONS, request} from 'react-native-permissions';
import CallerScreen from './CallerScreen';
import Profile from './Profile';

YellowBox.ignoreWarnings([
  'Setting a timer',
  'Unrecognized WebSocket connection',
  'ListView is deprecated and will be removed',
]);

const screenWidth = Dimensions.get('window').width;

const configuration = {iceServers: [{url: 'stun:stun.l.google.com:19302'}]};

const pc = new RTCPeerConnection(configuration);

const styles = {
  container: {
    flex: 1,
  },
  headerStyle: {
    fontSize: 25,
    fontWeight: '100',
    alignSelf: 'stretch',
    padding: 20,
    backgroundColor: '#1b1b25',
    color: 'white',
  },
  subContainer: {
    flexDirection: 'row',
    backgroundColor: '#1b1b25',
    justifyContent: 'flex-start',
  },
  subStyle: {
    fontSize: 15,
    padding: 20,
    color: 'white',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#dcdcdc',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  pic: {
    width: 50,
    height: 50,
  },
  nameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 250,
  },
  nameTxt: {
    marginLeft: 15,
    fontWeight: '600',
    color: '#222',
    fontSize: 15,
  },
  mblTxt: {
    fontWeight: '200',
    color: '#777',
    fontSize: 13,
  },
  end: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    height: 28,
    width: 28,
  },
  time: {
    fontSize: 15,
  },
};

const UUID = () => {
  return 'xxxxxxxx'.replace(/[xy]/g, function(c) {
    let r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const SocketServer = 'http://8fd7ac0a.ngrok.io';

const connectionConfig = {
  transports: ['websocket'],
};

const loginUser = {
  id: 11,
  name: faker.fake('{{name.lastName}}, {{name.firstName}}'),
  roomId: UUID(),
  image: 'https://bootdey.com/img/Content/avatar/avatar1.png',
  type: 'Login',
};
const socket = io(SocketServer, connectionConfig);

const ContactScreen = ({calls}) => {
  const [isCall, updateCalling] = useState(false);
  const [user, getUser] = useState('');
  const [isCaller, caller] = useState(false);
  const [acceptCall, onAcceptCall] = useState();
  const [localStream, setLocalStream] = useState();
  const [remoteStream, setRemoteStream] = useState();
  const [cachedLocalPC, setCachedLocalPC] = useState();
  const [cachedRemotePC, setCachedRemotePC] = useState();
  const [callRoomId, setCallRoomId] = useState();
  const [value, onChangeText] = useState('');
  const [busy, isBusy] = useState(false);
  // const [loginUser] = useState();
  const [userList, updateUser] = useState([]);

  useEffect(() => {
    request(
      Platform.select({
        android: PERMISSIONS.ANDROID.MICROPHONE,
        ios: PERMISSIONS.IOS.MICROPHONE,
      }),
    );
    // socket.on('connect', () => {
    //   console.log('connect');
    // });
  });

  useEffect(() => {
    socket.on('update-user-list', userlist => {
      console.log(userlist);
      updateUser(userlist);
    });
  }, []);

  socket.on('remove-user', ({socketId}) => {
    const elToRemove = document.getElementById(socketId);

    if (elToRemove) {
      elToRemove.remove();
    }
  });

  socket.emit('login', loginUser);

  socket.on('roommessage', function(message) {
    var data = message;

    switch (data.type) {
      case 'login':
        console.log('New user : ' + data);
        updateUser([...userList, data.data]);
        break;
      case 'disconnect':
        console.log('User disconnected : ' + data.username);
        break;
      default:
        break;
    }
  });

  socket.on('updateUserList', users => {
    const addUser = users.filter(user => user.roomId !== loginUser.roomId);
    updateUser([...userList, ...addUser]);
  });

  socket.on('removeUser', data => {
    const removeUser = data.filter(user => user.roomId !== loginUser.roomId);
    updateUser([...removeUser]);
  });

  socket.on('roommessage', function(message) {
    console.log(message, 'roommessage');
    const data = message;
    switch (data.type) {
      case 'login':
        console.log('New user : ' + data.username);
        updateUser([...data.users]);
        break;
      case 'disconnect':
        console.log('User disconnected : ' + data.username);
        // updateUser([...data.users]);
        break;
      default:
        break;
    }
  });

  const openUserMedia = async item => {
    getUser(item);
    updateCalling(true);
    try {
      const stream = await mediaDevices.getUserMedia({audio: true});
      caller(true);
      return stream;
    } catch (error) {
      updateCalling(false);
      caller(true);
      return error;
    }
  };

  const startCall = async item => {
    const mediaStream = await openUserMedia(item);
    setLocalStream(mediaStream);
    pc.addStream(mediaStream);
    const offer = await pc.createOffer();
    await pc.setLocalDescription(new RTCSessionDescription(offer));
    socket.emit('call_user', {
      type: 'call_user',
      name: item.name,
      callername: item,
      roomId: item.roomId,
      offer,
    });
  };

  const joinCall = async data => {
    const mediaStream = await openUserMedia(data);
    setLocalStream(mediaStream);
    await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
    let answer = await pc.createAnswer();
    await pc.setLocalDescription(new RTCSessionDescription(answer));

    socket.emit('call_accepted', {
      type: 'call_accepted',
      callername: data.name,
      from: data.name,
      answer,
    });
    pc.onaddstream = e => {
      setRemoteStream(e.stream);
      console.log('Got remote track:', e.streams);
    };
    setCachedLocalPC(pc);
  };

  socket.on('answer', async data => {
    if (busy) {
      socket.emit('call_busy', {
        type: 'call_busy',
        callername: data.name,
        from: data.name,
      });
    } else {
      AsyncAlert(data);
    }
  });

  const AsyncAlert = data =>
    Alert.alert(
      'Calling',
      `${data.name} is calling you`,
      [
        {
          text: 'Cancel',
          onPress: () => acceptCaller(false, data),
          style: 'Yes',
        },
        {
          text: 'Yes',
          onPress: () => acceptCaller(true, data),
          style: 'Yes',
        },
      ],
      {cancelable: false},
    );

  const acceptCaller = (value, data) => {
    if (value) {
      console.log('call accepted');
      joinCall(data);
      isBusy(true);
    } else {
      console.log('call rejected');
      socket.emit('call_rejected', {
        type: 'call_rejected',
        callername: data.name,
        from: data.name,
      });
      isBusy(false);
    }
  };

  socket.on('call_response', async data => {
    switch (data.response) {
      case 'accepted':
        console.log('Call accepted by :' + data.responsefrom);
        console.log(data.answer, 'anwser');
        updateCalling(true);
        pc.setRemoteDescription(new RTCSessionDescription(data.answer));
        await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
        pc.onaddstream = e => {
          setRemoteStream(e.stream[0]);
        };
        isBusy(true);
        break;
      case 'rejected':
        console.log('Call rejected by :' + data.responsefrom);
        handleAlert('Sorry', 'rejected your call', data.responsefrom);
        break;
      case 'busy':
        console.log(data.responsefrom + ' call busy');
        handleAlert('Sorry', 'is busy at the monent', data.responsefrom);
        break;
      default:
        console.log(data.name + ' is offline');
        // handleAlert('Offline', 'is offline', data.name);
        handleToast(data.name, 'is Offline');
    }
  });

  const handleAlert = (title, message, data) => {
    isBusy(false);
    Alert.alert(
      `${title}`,
      `${data} ${message}`,
      [{text: 'Ok', onPress: () => updateCalling(false)}],
      {cancelable: true},
    );
  };

  const handleToast = (data, message) => {
    ToastAndroid.showWithGravity(
      `${data} ${message}`,
      ToastAndroid.SHORT,
      ToastAndroid.CENTER,
    );
    updateCalling(false);
  };

  const renderContact = ({item}) => {
    let callIcon = 'https://img.icons8.com/color/48/000000/phone.png';
    if (calls.video == true) {
      callIcon = 'https://img.icons8.com/color/48/000000/video-call.png';
    }
    return (
      <TouchableOpacity>
        <View style={styles.row}>
          <Image source={{uri: item.image}} style={styles.pic} />
          <View>
            <View style={styles.nameContainer}>
              <Text style={styles.nameTxt}>{item.name}</Text>
            </View>
            <View style={styles.end}>
              <Image
                style={[
                  styles.icon,
                  {marginLeft: 15, marginRight: 5, width: 14, height: 14},
                ]}
                source={{
                  uri: 'https://img.icons8.com/small/14/000000/double-tick.png',
                }}
              />
              <Text style={styles.time}>
                {item.date} {item.time}
              </Text>
            </View>
          </View>
          <Image
            style={[styles.icon, {marginRight: 50}]}
            source={{uri: callIcon}}
            onStartShouldSetResponder={() => startCall(item)}
          />
        </View>
      </TouchableOpacity>
    );
  };

  const headerContent = () => (
    <>
      <View>
        <Text style={styles.headerStyle}>Chatter</Text>
      </View>
      <View style={styles.subContainer}>
        <TouchableOpacity>
          <Text
            style={styles.subStyle}
            onPress={() => {
              scroll.scrollTo({x: 0});
            }}>
            Contact
          </Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text
            style={styles.subStyle}
            onPress={() => {
              scroll.scrollTo({x: screenWidth});
            }}>
            Profile
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );

  const contactHeader = () => {
    return (
      <>
        <StatusBar barStyle="light-content" backgroundColor="#22222e" />
        <View style={styles.container}>
          {headerContent()}
          <ScrollView
            horizontal={true}
            pagingEnabled={true}
            showsHorizontalScrollIndicator={false}
            ref={node => (scroll = node)}>
            <FlatList
              data={calls}
              keyExtractor={item => item.id.toString()}
              renderItem={renderContact}
            />
            <Profile user={loginUser} />
          </ScrollView>
        </View>
      </>
    );
  };

  return (
    <>
      {!isCall ? (
        contactHeader()
      ) : (
        <CallerScreen
          updateCalling={updateCalling}
          item={user}
          localStream={localStream}
          setLocalStream={setLocalStream}
          remoteStream={remoteStream}
          setRemoteStream={setRemoteStream}
          isCaller={isCaller}
          callRoomId={callRoomId}
        />
      )}
    </>
  );
};

export default ContactScreen;

// const startSocket = () => {

// };
socket.on('connect', () => {
  console.log('connect');
});

socket.emit('login', loginUser);
