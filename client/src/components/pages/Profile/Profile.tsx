import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import * as endpoints from '../../../constants/endpoints';
import { userInfoState } from '../../../store';
import httpRequest from '../../../utils/httpRequest';
import Spinner from '../../elements/Spinner/Spinner';
import PageView from '../../hoc/PageView/PageView';
import Avatar from './Avatar/Avatar';
import classes from './Profile.module.scss';

const Profile: React.FC = (): JSX.Element => {
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [shouldLoadAvatar, setShouldLoadAvatar] = useState(false);
  // todo
  const [userProfile, setUserProfile] = useState(null as unknown as any);
  const userState = useRecoilValue(userInfoState);

  const { username } = useParams<{ username: string }>();

  useEffect(
    () => console.log('🚀 ~ file: Profile.tsx ~ line 15 ~ shouldLoadAvatar', shouldLoadAvatar),
    [shouldLoadAvatar]
  );

  useEffect(() => {
    const loadUserProfile = async (username: string): Promise<void> => {
      setIsLoadingProfile(true);

      try {
        setUserProfile(
          await httpRequest(`${endpoints.GET_PROFILE_BY_USERNAME}/${username}`, 'GET')
        );
        setShouldLoadAvatar(true);
      } catch (error) {
        console.error(error);
      }

      setIsLoadingProfile(false);
    };

    if (username) {
      loadUserProfile(username);
    } else if (userState.username !== '') {
      loadUserProfile(userState.username);
    }
  }, [username]);

  const epochToDate = (epoch: number): string => new Date(epoch).toLocaleDateString('en-GB');

  const getRatingRank = (numRatings: number): string => {
    switch (true) {
      case numRatings < 10:
        return 'newbie';
      case numRatings < 100:
        return 'flick fan';
      case numRatings < 500:
        return 'movie buff';
      case numRatings < 1000:
        return 'film freak';
      case numRatings < 2500:
        return 'cinema addict';
      case numRatings < 5000:
        return 'celluloid junkie';
      case numRatings >= 5000:
        return 'criticker zealot';
      default:
        return 'Error determining rank';
    }
  };

  return (
    <PageView>
      {!isLoadingProfile ? (
        <>
          <Avatar
            loggedIn={userState.loggedIn}
            setShouldLoadAvatar={setShouldLoadAvatar}
            shouldLoadAvatar={shouldLoadAvatar}
            UID={userState.UID}
            username={userState.username}
          />

          {userProfile ? (
            <div className={classes.UserDetails}>
              <h1 className={classes.UsernameHeader}>
                {userProfile.username}
                <span className={classes.UserRank}> {getRatingRank(userProfile.numRatings)}</span>
              </h1>
              <p className={classes.UserProfileText}>{userProfile.numRatings} Film Ratings</p>
              <p className={classes.UserProfileText}>
                <b>Member since:</b> {epochToDate(userProfile.memberSince)}
              </p>
              <p className={classes.UserProfileText}>View your profile as it appears to others</p>
              <p className={classes.UserProfileText}>Update Personal Information</p>
              <p className={classes.UserProfileText}>Update Password</p>
            </div>
          ) : (
            'User not found'
          )}
        </>
      ) : (
        <Spinner />
      )}
    </PageView>
  );
};

export default Profile;
