import { useSelector } from 'react-redux';

export const useNextSession = () => {
  const {
    sessions: { data: sessionsData = [] }
  } = useSelector((state) => state);

  return sessionsData.find(
    ({ status: sessionStatus }) => sessionStatus === 'next'
  );
};

export const useActiveSession = () => {
  const {
    sessions: { data: sessionsData = [] }
  } = useSelector((state) => state);

  return sessionsData?.find(
    ({ status: sessionStatus }) => sessionStatus === 'active'
  );
};
