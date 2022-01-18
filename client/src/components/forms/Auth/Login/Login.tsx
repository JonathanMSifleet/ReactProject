import CryptoES from 'crypto-es';
import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import Button from '../../../../elements/Button/Button';
import Input from '../../../../elements/Input/Input';
import { modalState, userInfoState } from '../../../../recoilStore/store';
import { LOGIN } from '../../../../shared/constants/endpoints';
import HTTPRequest from '../../../../shared/functions/HTTPRequest';
import ThirdPartyLogin from '../ThirdPartyLogin/ThirdPartyLogin';
import classes from './Login.module.scss';

interface IState {
  email?: string;
  password?: string;
}

const Login: React.FC = () => {
  const [formInfo, setFormInfo] = useState<IState>({});
  const [shouldPost, setShouldPost] = useState(false);
  // @ts-expect-error
  const [showModal, setShowModal] = useRecoilState(modalState);
  const [submitDisabled, setSubmitDisabled] = useState(true);
  // @ts-expect-error
  const [userInfo, setUserInfo] = useRecoilState(userInfoState);

  // see signup.tsx comment for why this is here
  useEffect(() => {
    if (!formInfo.email || !formInfo.password) {
      setSubmitDisabled(true);
    } else {
      setSubmitDisabled(false);
    }
  }, [formInfo]);

  useEffect(() => {
    const postData = async (): Promise<void> => {
      try {
        const response = (await HTTPRequest(LOGIN, 'POST', formInfo)) as { username: string; UID: string };

        setUserInfo({
          username: response.username,
          loggedIn: true,
          UID: response.UID,
          expiryDate: new Date().getTime() + 4 * 60 * 60
        });

        setShowModal(false);
      } catch (error) {
        console.error(error);
      }
    };

    if (shouldPost) postData();
  }, [shouldPost]);

  const inputChangedHandler = (eventValue: string, inputName: string): void => {
    setFormInfo({ ...formInfo, [inputName]: eventValue });
  };

  const login = async (): Promise<void> => {
    const hashedPassword = CryptoES.SHA512(formInfo.password).toString();

    setFormInfo({ ...formInfo, password: hashedPassword });
    setShouldPost(true);
  };

  const handlePlaceholderText = (type: string): string => {
    // @ts-expect-error type not required
    if (formInfo[type]) {
      return '';
    } else if (type === 'email') {
      return 'Email';
    } else {
      return 'Password';
    }
  };

  return (
    <form
      onSubmit={(event): void => {
        event.preventDefault();
      }}
    >
      <ThirdPartyLogin />

      {/* Email input */}
      <div className={`${classes.InputWrapper} form-outline mb-4`}>
        <Input
          autoComplete="new-password"
          onChange={(event): void => inputChangedHandler(event.target.value!, 'email')}
          placeholder={handlePlaceholderText('email')}
          type={'email'}
        />
        <Input
          autoComplete="new-password"
          onChange={(event): void => inputChangedHandler(event.target.value!, 'password')}
          placeholder={handlePlaceholderText('password')}
          type={'password'}
        />
      </div>

      {/* 2 column grid layout */}
      <div className={`${classes.PasswordOptions}`}>
        {/* Simple link */}
        <a href="#!">Forgot password?</a>
      </div>

      {/* Submit button */}
      <div className={classes.SubmitButtonWrapper}>
        <Button
          className={`${classes.SubmitButton} btn btn-primary btn-block mb-4`}
          disabled={submitDisabled}
          onClick={(): Promise<void> => login()}
          text={'Sign in'}
        />
      </div>
    </form>
  );
};

export default Login;
