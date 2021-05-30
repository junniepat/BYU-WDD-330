import { useState, useEffect } from 'react';
import AgoraRTC, {
  IAgoraRTCClient,
  IAgoraRTCRemoteUser,
  MicrophoneAudioTrackInitConfig,
  CameraVideoTrackInitConfig,
  IMicrophoneAudioTrack,
  ICameraVideoTrack,
  ILocalVideoTrack,
  ILocalAudioTrack,
} from 'agora-rtc-sdk-ng';

export default function useAgora(
  uid: string,
  username: string,
  client: IAgoraRTCClient | undefined,
  videoConfig?: CameraVideoTrackInitConfig
): {
  localAudioTrack: ILocalAudioTrack | undefined;
  localVideoTrack: ILocalVideoTrack | undefined;
  joinState: boolean;
  leave: Function;
  join: Function;
  remoteUsers: IAgoraRTCRemoteUser[];
} {
  const UID = parseInt(uid);
  const [localVideoTrack, setLocalVideoTrack] = useState<
    ILocalVideoTrack | undefined
  >(undefined);
  const [localAudioTrack, setLocalAudioTrack] = useState<
    ILocalAudioTrack | undefined
  >(undefined);

  const [joinState, setJoinState] = useState(false);

  const [remoteUsers, setRemoteUsers] = useState<IAgoraRTCRemoteUser[]>([]);

  async function createLocalTracks(
    audioConfig?: MicrophoneAudioTrackInitConfig,
    videoConfig?: CameraVideoTrackInitConfig
  ): Promise<[IMicrophoneAudioTrack, ICameraVideoTrack]> {
    const [
      microphoneTrack,
      cameraTrack,
    ] = await AgoraRTC.createMicrophoneAndCameraTracks(
      audioConfig,
      videoConfig
    );

    setLocalAudioTrack(microphoneTrack);
    setLocalVideoTrack(cameraTrack);
    return [microphoneTrack, cameraTrack];
  }

  async function startVideo(client: IAgoraRTCClient) {
    const [microphoneTrack, cameraTrack] = await createLocalTracks();
    await client.publish([microphoneTrack, cameraTrack]);
    client.enableDualStream();
    (window as any).client = client;
    (window as any).videoTrack = cameraTrack;
    setJoinState(true);
  }

  const exception = (evt: any) => {
    console.log('**************');
    console.log(evt);
    console.log('**************');
  };

  async function join(
    appid: string,
    channel: string,
    token: string,
    uid: string
  ) {
    if (!client) return;
    const [microphoneTrack, cameraTrack] = await createLocalTracks(
      undefined,
      videoConfig
    );
    const UID = parseInt(uid);
    client.setClientRole('host');
    //client.setProxyServer('UDP_PROXY(1)');
    client.startProxyServer(3);
    console.log('*****Joining as user:' + uid);
    var a = client.join(appid, channel, token || null, UID);
    console.log(a);
    a.then(function(response) {
      client.publish([microphoneTrack, cameraTrack]);

      (window as any).client = client;
      (window as any).videoTrack = cameraTrack;
      setJoinState(false);
    }).catch(err => {
      console.log('ERROR: ' + err);
      alert(err);
    });
  }

  function leave() {
    if (localAudioTrack) {
      localAudioTrack.stop();
      localAudioTrack.close();
    }
    if (localVideoTrack) {
      localVideoTrack.stop();
      localVideoTrack.close();
    }
    setRemoteUsers([]);
    setJoinState(false);
    //await client?.leave();
  }

  useEffect(() => {
    if (!client) return;
    setRemoteUsers(client.remoteUsers);

    const handleUserPublished = async (
      user: IAgoraRTCRemoteUser,
      mediaType: 'audio' | 'video'
    ) => {
      await client.subscribe(user, mediaType);
      // toggle rerender while state of remoteUsers changed.
      setRemoteUsers(remoteUsers => Array.from(client.remoteUsers));
    };
    const handleUserUnpublished = (user: IAgoraRTCRemoteUser) => {
      setRemoteUsers(remoteUsers => Array.from(client.remoteUsers));
    };
    const handleUserJoined = (user: IAgoraRTCRemoteUser) => {
      setRemoteUsers(remoteUsers => Array.from(client.remoteUsers));
    };
    const handleUserLeft = (user: IAgoraRTCRemoteUser) => {
      console.log(user + ' left the call!');
      var a = client.remoteUsers;
      if (a.length == 0) alert(username + ' left the call.');
      setRemoteUsers(remoteUsers => Array.from(client.remoteUsers));
      window.close();
    };

    client.on('user-published', handleUserPublished);
    client.on('user-unpublished', handleUserUnpublished);
    client.on('user-joined', handleUserJoined);
    client.on('user-left', handleUserLeft);
    client.on('exception', exception);
    return () => {
      client.off('user-published', handleUserPublished);
      client.off('user-unpublished', handleUserUnpublished);
      client.off('user-joined', handleUserJoined);
      client.off('user-left', handleUserLeft);
    };
  }, [client]);

  return {
    localAudioTrack,
    localVideoTrack,
    joinState,
    leave,
    join,
    remoteUsers,
  };
}
