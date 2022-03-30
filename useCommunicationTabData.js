import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { uniqBy } from "lodash";
import { useUserIsCurrentEventSpeaker } from "hooks/useUserRole";
import { useActiveSession, useNextSession } from "hooks/useSessionStatus";
import { useIsExpectedPage } from "hooks/usePageLocation";
import CreateTickerMessages from "components/CreateTickerMessages";
import { Chat, Participants, Poll, Questions } from "components";
import ROUTES from "constants/routes";

export const useCommunicationTabData = () => {
  const {
    auth: {
      user: { id: userId },
    },
    communicationModules: { activeTab },
    events: { currentEvent: { is_host = false } = {} },
    app: {
      virtual_room: {
        show_poll = false,
        show_qa = false,
        show_chat = false,
        show_participants = false,
        show_anonymous_questions = false,
      } = {},
    },
    poll: { data: pollsData = [] },
    participants: { data: participantsData = {}, visibleParticipants = {} },
  } = useSelector((state) => state);

  const publishedPolls = pollsData.filter(
    ({ poll_status }) => poll_status === "published"
  );

  const filteredPolls = useMemo(() => {
    return (
      pollsData?.filter((poll) => {
        return (
          poll.poll_status === "published" &&
          !poll?.archivedParticipants?.includes(userId)
        );
      }) || []
    );
    //  eslint-disable-next-line
  }, [pollsData]);

  const filteredPollsLength = filteredPolls?.length;

  const activeSession = useActiveSession();
  const nextSession = useNextSession();
  const isSpeaker = useUserIsCurrentEventSpeaker();
  const { speakers: currentSessionSpeakers } =
    activeSession || nextSession || {};

  const visibleParticipantsLength = Object.keys(visibleParticipants).length;
  const participantsArr = uniqBy(Object.values(participantsData), "email");
  const participantsArrLength = participantsArr.length;
  const findSpeakersByParticipantsEmail = (
    currentSpeakers,
    participantEmail
  ) => {
    return currentSpeakers?.find(
      ({ email: speakerEmail }) => speakerEmail === participantEmail
    );
  };

  const speakersByParticipantEmail = participantsArr?.filter(
    ({ email: participantEmail }) => {
      findSpeakersByParticipantsEmail(currentSessionSpeakers, participantEmail);
    }
  );
  const speakersByParticipantEmailLength = speakersByParticipantEmail.length;
  const participantsCount =
    !isSpeaker && !is_host
      ? participantsArrLength - speakersByParticipantEmailLength
      : participantsArrLength;

  const isReceptionOrStagePage = useIsExpectedPage([
    ROUTES.STAGE,
    ROUTES.RECEPTION,
  ]);

  const showTickerMessages = isReceptionOrStagePage && is_host;

  return useMemo(() => {
    return [
      {
        title: "Chat",
        show: show_chat,
        component: <Chat />,
      },
      {
        title: "Q & A",
        show: show_qa,
        component: <Questions anonymous={Boolean(show_anonymous_questions)} />,
      },
      {
        title: `Participants (${participantsCount})`,
        show: show_participants,
        component: (
          <Participants
            className="h-100"
            allParticipants={participantsArr}
            visibleParticipants={visibleParticipants}
            isHost={is_host}
          />
        ),
      },
      {
        title: `Poll (${
          is_host ? publishedPolls.length : filteredPollsLength
        })`,
        show: show_poll,
        component: <Poll />,
      },
      {
        title: "Ticker Messages",
        show: showTickerMessages,
        component: <CreateTickerMessages />,
      },
    ];
    //  eslint-disable-next-line
  }, [
    show_chat,
    show_qa,
    show_anonymous_questions,
    participantsData,
    is_host,
    show_participants,
    show_poll,
    filteredPollsLength,
    activeTab,
    visibleParticipantsLength,
  ]);;
};
