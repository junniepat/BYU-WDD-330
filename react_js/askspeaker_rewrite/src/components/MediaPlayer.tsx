import {
  ILocalVideoTrack,
  IRemoteVideoTrack,
  ILocalAudioTrack,
  IRemoteAudioTrack,
  VideoPlayerConfig,
} from 'agora-rtc-sdk-ng';
import React, { useRef, useEffect } from 'react';

export interface VideoPlayerProps {
  videoTrack: ILocalVideoTrack | IRemoteVideoTrack | undefined;
  audioTrack: ILocalAudioTrack | IRemoteAudioTrack | undefined;
}

const MediaPlayer = (props: VideoPlayerProps) => {
  const container = useRef<HTMLDivElement>(null);
  const videoConfig: VideoPlayerConfig = { fit: 'contain' };

  useEffect(() => {
    if (!container.current) {
      return;
    }
    if (props.videoTrack) {
      props.videoTrack.play(container.current, videoConfig);
    }

    return () => {
      if (props.videoTrack) props.videoTrack.stop();
    };
  }, [container, props.videoTrack]);
  useEffect(() => {
    if (props.audioTrack) props.audioTrack.play();
    return () => {
      if (props.audioTrack) props.audioTrack.stop();
    };
  }, [props.audioTrack]);
  return (
    // <div ref={container}  className="video-player" style={{ width: "320px", height: "240px"}}></div>
    <div
      ref={container}
      className="video-player"
      style={{
        width: '600px',
        height: '500px',
        top: '25%',
        position: 'absolute',
        background: 'black',
      }}
    ></div>
  );
};

export default MediaPlayer;
