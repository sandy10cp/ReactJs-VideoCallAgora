import React, { useRef, useState } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';
import useAgora from './hooks/useAgora';
import MediaPlayer from './components/MediaPlayer';
import './Call.css';

const client = AgoraRTC.createClient({ codec: 'h264', mode: 'rtc' });

function Call() {
  const [ appid, setAppid ] = useState('');
  const [ token, setToken ] = useState('');
  const [ channel, setChannel ] = useState('');
  const {
    localAudioTrack, localVideoTrack, leave, join, joinState, remoteUsers
  } = useAgora(client);

  const shareClient = useRef(null);
  const shareScreenStream = useRef(null);

  async function startScreenCall() {
    const screenClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
    await screenClient.join(appid, channel, token);
  
    const screenTrack = await AgoraRTC.createScreenVideoTrack({
      encoderConfig: {
        height: 720,
        width: 1280
      }
    }, "auto")
    await screenClient.publish(screenTrack);
  
    return screenClient;
  }
  
  async function startVideoCall() {
    const videoClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
    await videoClient.join(appid, channel, token);
  
    const videoTrack = await AgoraRTC.createScreenVideoTrack({
            encoderConfig: {
              height: 720,
              width: 1280
            }
          }, "auto")
    // await videoClient.publish(videoTrack);
    await videoClient.unpublish(videoTrack)
  
    return videoClient;
  }

  function shareScreen () {
    Promise.all([startScreenCall(), startVideoCall()]).then(() => { /** ... **/ });
  }

  return (
    <div className='call'>
      <form className='call-form'>
        <label>
          AppID:
          <input type='text' name='appid' onChange={(event) => { setAppid(event.target.value) }}/>
        </label>
        <label>
          Token(Optional):
          <input type='text' name='token' onChange={(event) => { setToken(event.target.value) }} />
        </label>
        <label>
          Channel:
          <input type='text' name='channel' onChange={(event) => { setChannel(event.target.value) }} />
        </label>
        <div className='button-group'>
          <button id='join' type='button' className='btn btn-primary btn-sm' disabled={joinState} onClick={() => {join(appid, channel, token)}}>Video Call</button>
          <button id='leave' type='button' className='btn btn-primary btn-sm' disabled={!joinState} onClick={() => {leave()}}>Leave Call</button>
          <button id='sharescreen' type='button' className='btn btn-primary btn-sm' onClick={() => {shareScreen()}}>Share Screen</button>
        </div>
      </form>
      <div className='player-container'>
        <div className='local-player-wrapper'>
          <p className='local-player-text'>{localVideoTrack && `localTrack`}{joinState && localVideoTrack ? `(${client.uid})` : ''}</p>
          <MediaPlayer videoTrack={localVideoTrack} audioTrack={undefined}></MediaPlayer>
        </div>
        {remoteUsers.map(user => (<div className='remote-player-wrapper' key={user.uid}>
            <p className='remote-player-text'>{`remoteVideo(${user.uid})`}</p>
            <MediaPlayer videoTrack={user.videoTrack} audioTrack={user.audioTrack}></MediaPlayer>
          </div>))}
      </div>
    </div>
  );
}

export default Call;
