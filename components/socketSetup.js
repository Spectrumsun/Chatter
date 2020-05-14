import io from 'socket.io-client';

const SocketServer = 'http://50e40371.ngrok.io';

const connectionConfig = {
  transports: ['websocket'],
};

const socket = io(SocketServer, connectionConfig);

socket.on('connect', () => {
  console.log('connect');
});

const login = loginUser => {
  socket.emit('login', loginUser);
};

// socket.on('userLoginAlready', data => {
//   console.log(data);
// });

// socket.on('roommessage', message => {
//   console.log(message, 'roommessage');
//   const data = message;
//   switch (data.type) {
//     case 'login':
//       console.log('New user : ' + data.username);
//       updateUser([...data.users]);
//       break;
//     case 'disconnect':
//       console.log('User disconnected : ' + data.username);
//       // updateUser([...data.users]);
//       break;
//     default:
//       break;
//   }
// });

// socket.on('updateUserList', users => {
//   console.log(users, 'users');
//   // const addUser = users.filter(user => user.roomId !== loginUser.roomId);
//   updateUser([...users]);
// });

// socket.on('disconnected', data => {
//   // const removeUser = data.filter(user => user.roomId !== loginUser.roomId);
//   console.log('removing user');
//   updateUser([...data]);
// });



// const startCall = async item => {
//   const mediaStream = await openUserMedia(item);
//   setLocalStream(mediaStream);
//   pc.addStream(mediaStream);
//   const offer = await pc.createOffer();
//   await pc.setLocalDescription(new RTCSessionDescription(offer));
//   socket.emit('call_user', {
//     type: 'call_user',
//     name: item.name,
//     callername: item,
//     roomId: item.roomId,
//     offer,
//   });
// };

// const joinCall = async data => {
//   const mediaStream = await openUserMedia(data);
//   setLocalStream(mediaStream);
//   await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
//   let answer = await pc.createAnswer();
//   await pc.setLocalDescription(new RTCSessionDescription(answer));

//   socket.emit('call_accepted', {
//     type: 'call_accepted',
//     callername: data.name,
//     from: data.name,
//     answer,
//   });
//   pc.onaddstream = e => {
//     setRemoteStream(e.stream);
//     console.log('Got remote track:', e.streams);
//   };


//   setCachedLocalPC(pc);
// };


// socket.on('answer', async data => {
//   if (busy) {
//     socket.emit('call_busy', {
//       type: 'call_busy',
//       callername: data.name,
//       from: data.name,
//     });
//   } else {
//     AsyncAlert(data);
//   }
// });

// const AsyncAlert = data =>
//   Alert.alert(
//     'Calling',
//     `${data.name} is calling you`,
//     [
//       {
//         text: 'Cancel',
//         onPress: () => acceptCaller(false, data),
//         style: 'Yes',
//       },
//       {
//         text: 'Yes',
//         onPress: () => acceptCaller(true, data),
//         style: 'Yes',
//       },
//     ],
//     {cancelable: false},
//   );

// const acceptCaller = (value, data) => {
//   if (value) {
//     console.log('call accepted');
//     joinCall(data);
//     isBusy(true);
//   } else {
//     console.log('call rejected');
//     socket.emit('call_rejected', {
//       type: 'call_rejected',
//       callername: data.name,
//       from: data.name,
//     });
//     isBusy(false);
//   }
// };

// socket.on('call_response', async data => {
//   switch (data.response) {
//     case 'accepted':
//       console.log('Call accepted by :' + data.responsefrom);
//       console.log(data.answer, 'anwser');
//       updateCalling(true);
//       pc.setRemoteDescription(new RTCSessionDescription(data.answer));
//       await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
//       pc.onaddstream = e => {
//         setRemoteStream(e.stream[0]);
//       };
//       isBusy(true);
//       break;
//     case 'rejected':
//       console.log('Call rejected by :' + data.responsefrom);
//       handleAlert('Sorry', 'rejected your call', data.responsefrom);
//       break;
//     case 'busy':
//       console.log(data.responsefrom + ' call busy');
//       handleAlert('Sorry', 'is busy at the monent', data.responsefrom);
//       break;
//     default:
//       console.log(data.name + ' is offline');
//       // handleAlert('Offline', 'is offline', data.name);
//       handleToast(data.name, 'is Offline');
//   }
// });


export {socket, login};
