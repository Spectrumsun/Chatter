import React, {useState, useEffect} from 'react';
import ContactScreen from './components/ContactScreen';
import SplashScreen from './components/SplashScreen';

const calls = [
  {
    id: 1,
    name: 'Mark Doe',
    date: '12 jan',
    time: '11:14 am',
    video: false,
    image: 'https://bootdey.com/img/Content/avatar/avatar7.png',
  },
  {
    id: 2,
    name: 'Clark Man',
    date: '12 jul',
    time: '15:58 am',
    video: false,
    image: 'https://bootdey.com/img/Content/avatar/avatar6.png',
  },
  {
    id: 3,
    name: 'Jaden Boor',
    date: '12 aug',
    time: '12:45 am',
    video: true,
    image: 'https://bootdey.com/img/Content/avatar/avatar5.png',
  },
  {
    id: 4,
    name: 'Srick Tree',
    date: '12 feb',
    time: '08:32 am',
    video: false,
    image: 'https://bootdey.com/img/Content/avatar/avatar4.png',
  },
  {
    id: 5,
    name: 'John Doe',
    date: '12 oct',
    time: '07:45 am',
    video: true,
    image: 'https://bootdey.com/img/Content/avatar/avatar3.png',
  },
  {
    id: 6,
    name: 'John Doe',
    date: '12 jan',
    time: '09:54 am',
    video: false,
    image: 'https://bootdey.com/img/Content/avatar/avatar2.png',
  },
  {
    id: 8,
    name: 'John Doe',
    date: '12 jul',
    time: '11:22 am',
    video: true,
    image: 'https://bootdey.com/img/Content/avatar/avatar1.png',
  },
  {
    id: 9,
    name: 'John Doe',
    date: '12 aug',
    time: '13:33 am',
    video: false,
    image: 'https://bootdey.com/img/Content/avatar/avatar4.png',
  },
  {
    id: 10,
    name: 'John Doe',
    date: '12 oct',
    time: '11:58 am',
    video: true,
    image: 'https://bootdey.com/img/Content/avatar/avatar7.png',
  },
  {
    id: 11,
    name: 'John Doe',
    date: '12 jan',
    time: '09:28 am',
    video: false,
    image: 'https://bootdey.com/img/Content/avatar/avatar1.png',
  },
];

export default (App = () => {
  const [isLoading, updatedLoading] = useState(true);

  useEffect(() => {
    setTimeout(async () => updatedLoading(false), 1000);
  });

  const appStatus = isLoading ? (
    <SplashScreen />
  ) : (
    <ContactScreen calls={calls} />
  );

  return appStatus;
});
