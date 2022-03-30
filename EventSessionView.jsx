import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { EventCountdownCard } from 'react-banzai';
import InitVonage from 'meeting/vonage/InitVonage';
import { useIsHost, useUserIsSessionSpeaker } from 'hooks/useUserRole';
import { useActiveSession, useNextSession } from 'hooks/useSessionStatus';
import PlayStreaming from 'components/PlayStreaming/PlayStreaming';

const EventSessionView = () => {
  const {
    auth: {
      user: { id: userId },
    },
    sessions: { data: sessionsData = [] },
    participants: { data: participants },
  } = useSelector((state) => state);

  const [view, setView] = useState(null);
  const [title, setTitle] = useState<string>('');

  const activeSession = useActiveSession();
  const nextSession = useNextSession();
  const userIsSessionSpeaker = useUserIsSessionSpeaker();
  const isHost = useIsHost();
  const currentSession = activeSession || nextSession;
  const participantData = Object.entries(participants)?.find(
    (partPair) => partPair[1]?.partId === userId
  );

  const participantsLength = Object.keys(participants).length;

  const {
    virtual_room_session: {
      rtmp = null,
      ondemand = null,
      simulive = null,
      type: sessionType = '',
    } = {},
    name = '',
  } = activeSession || {};

  const live_stream_url = rtmp ? rtmp?.live_stream_url : '';
  const { live_url = '' } = ondemand || simulive || {};
  const sessionsLastItem = sessionsData[sessionsData.length - 1];

  const playerStreamingGenertor = () => {
    return ondemand.file_type === 'image' ? (
      <img className="w-100 max-h-100 object-fit-contain" src={live_url} alt="on demand" />
    ) : (
      <PlayStreaming url={live_url} />
    );
  };

  const simuliveOptions =
    sessionType === 'simulive'
      ? {
          customProps: {
            isControls: false,
            controls: false,
          },
        }
      : {};

  const playerOptions = {
    isMuted: false,
    muted: false,
    ...simuliveOptions,
  };

  const handleRtmpSimuliveSession = () => {
    setView(
      <PlayStreaming
        url={sessionType === 'rtmp' ? live_stream_url : live_url}
        session={currentSession}
        options={playerOptions}
        setRenderCount={setRenderCount}
      />
    );
  };

  const handleLiveOpenSession = () => {
    participantData &&
      setView(
        <InitVonage
          participantData={participantData}
          is_speaker={userIsSessionSpeaker}
          isHost={isHost}
        />
      );
  };

  const handleOndemand = () => {
    return (
      ondemand &&
      setView(
        ondemand.type === 'youtube' ? (
          <PlayStreaming session={currentSession} url={live_url} />
        ) : (
          playerStreamingGenertor()
        )
      )
    );
  };

  const sessionStrategies = {
    rtmp: handleRtmpSimuliveSession,
    live: handleLiveOpenSession,
    simulive: handleRtmpSimuliveSession,
    on_demand: handleOndemand,
  };

  const sessionTypeHandler = (type) => {
    return type && sessionStrategies[type]();
  };

  const titleBasedOnStatus =
    sessionsLastItem?.status === 'previous'
      ? 'Thank you for your participation. We look forward to seeing you at another event soon!'
      : title;

  useEffect(() => {
    if (sessionsData && participantsLength) {
      if (activeSession) {
        setTitle(name);
        sessionTypeHandler(sessionType);
      } else if (nextSession) {
        setTitle('');
        setView(<EventCountdownCard data={nextSession} />);
      } else {
        setTitle('');
        setView(null);
      }
    }
    // eslint-disable-next-line
  }, [sessionsData, renderCount, participantsLength]);

  return (
    <div className="flex-1 overflow-auto h-0">
      <div className="d-flex flex-column h-100">
        <h1>{titleBasedOnStatus}</h1>
        {view && <div className="flex-1 h-0">{view}</div>}
      </div>
    </div>
  );
};

export default EventSessionView;
