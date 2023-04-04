import React, {useEffect} from 'react';
import {
  createNativeClipboardService,
  createNativeFileService,
  createNativeMediaService,
  createNativeNotificationService,
} from '@sendbird/uikit-react-native';

import Clipboard from '@react-native-clipboard/clipboard';
import {CameraRoll} from '@react-native-camera-roll/camera-roll';
import RNFBMessaging from '@react-native-firebase/messaging';
import Video from 'react-native-video';
import * as DocumentPicker from 'react-native-document-picker';
import * as FileAccess from 'react-native-file-access';
import * as ImagePicker from 'react-native-image-picker';
import * as Permissions from 'react-native-permissions';
import * as CreateThumbnail from 'react-native-create-thumbnail';
import * as ImageResizer from '@bam.tech/react-native-image-resizer';
import {SendbirdUIKitContainer} from '@sendbird/uikit-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useNavigation, useRoute} from '@react-navigation/native';
import {
  useSendbirdChat,
  createGroupChannelListFragment,
  createGroupChannelCreateFragment,
  createGroupChannelFragment,
} from '@sendbird/uikit-react-native';
import {useGroupChannel} from '@sendbird/uikit-chat-hooks';
import {Pressable, Text, View} from 'react-native';
import {useConnection} from '@sendbird/uikit-react-native';

function App() {
  const ClipboardService = createNativeClipboardService(Clipboard);
  const NotificationService = createNativeNotificationService({
    messagingModule: RNFBMessaging,
    permissionModule: Permissions,
  });
  const FileService = createNativeFileService({
    fsModule: FileAccess,
    permissionModule: Permissions,
    imagePickerModule: ImagePicker,
    mediaLibraryModule: CameraRoll,
    documentPickerModule: DocumentPicker,
  });
  const MediaService = createNativeMediaService({
    VideoComponent: Video,
    thumbnailModule: CreateThumbnail,
    imageResizerModule: ImageResizer,
  });

  const RootStack = createNativeStackNavigator();

  const GroupChannelListFragment = createGroupChannelListFragment();
  const GroupChannelCreateFragment = createGroupChannelCreateFragment();
  const GroupChannelFragment = createGroupChannelFragment();

  const SignInScreen = () => {
    const {connect} = useConnection();

    return (
      <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
        <Pressable
          style={{
            width: 120,
            height: 30,
            backgroundColor: '#742DDD',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onPress={() => connect('097094', {nickname: 'Yuvraj'})}>
          <Text>{'Sign in'}</Text>
        </Pressable>
      </View>
    );
  };

  const GroupChannelListScreen = () => {
    const navigation = useNavigation();
    return (
      <GroupChannelListFragment
        onPressCreateChannel={channelType => {
          // Navigate to GroupChannelCreate function.
          navigation.navigate('GroupChannelCreate', {channelType});
        }}
        onPressChannel={channel => {
          // Navigate to GroupChannel function.
          navigation.navigate('GroupChannel', {channelUrl: channel.url});
        }}
      />
    );
  };

  const GroupChannelCreateScreen = () => {
    const navigation = useNavigation();

    return (
      <GroupChannelCreateFragment
        onCreateChannel={async channel => {
          // Navigate to GroupChannel function.
          navigation.replace('GroupChannel', {channelUrl: channel.url});
        }}
        onPressHeaderLeft={() => {
          // Go back to the previous screen.
          navigation.goBack();
        }}
      />
    );
  };

  const GroupChannelScreen = () => {
    const navigation = useNavigation();
    const {params} = useRoute();

    const {sdk} = useSendbirdChat();
    const {channel} = useGroupChannel(sdk, params.channelUrl);
    if (!channel) return null;

    return (
      <GroupChannelFragment
        channel={channel}
        onChannelDeleted={() => {
          // Navigate to GroupChannelList function.
          navigation.navigate('GroupChannelList');
        }}
        onPressHeaderLeft={() => {
          // Go back to the previous screen.
          navigation.goBack();
        }}
        onPressHeaderRight={() => {
          // Navigate to GroupChannelSettings function.
          navigation.navigate('GroupChannelSettings', {
            channelUrl: params.channelUrl,
          });
        }}
      />
    );
  };

  const Navigation = () => {
    console.log('before chat');
    const {currentUser} = useSendbirdChat();
    useEffect(() => {
      console.log('running');
    }, []);

    return (
      <NavigationContainer>
        <RootStack.Navigator screenOptions={{headerShown: false}}>
          {!currentUser ? (
            <RootStack.Screen name={'SignIn'} component={SignInScreen} />
          ) : (
            <>
              <RootStack.Screen
                name={'GroupChannelList'}
                component={GroupChannelListScreen}
              />
              <RootStack.Screen
                name={'GroupChannelCreate'}
                component={GroupChannelCreateScreen}
              />
              <RootStack.Screen
                name={'GroupChannel'}
                component={GroupChannelScreen}
              />
            </>
          )}
        </RootStack.Navigator>
      </NavigationContainer>
    );
  };

  return (
    // <SafeAreaView>
    <SendbirdUIKitContainer
      appId="F53DF97C-E104-4603-A396-8FC7DB7BB37A"
      chatOptions={{localCacheStorage: AsyncStorage}}
      platformServices={{
        file: FileService,
        notification: NotificationService,
        clipboard: ClipboardService,
        media: MediaService,
      }}>
      <Navigation />
      <Text>Heloo</Text>
    </SendbirdUIKitContainer>
    // </SafeAreaView>
  );
}

export default App;
