import 'react-calendar/dist/Calendar.css';

import * as endpoints from '../../../constants/endpoints';

import { ChangeEvent, FC, useEffect, useState } from 'react';

import { CountryDropdown } from 'react-country-region-selector';
import Button from '../../../components/Button/Button';
import Calendar from 'react-calendar';
import classes from './UpdateUserDetailsForm.module.scss';
import httpRequest from '../../../utils/httpRequest';
import Input from '../../../components/Input/Input';
import IUserProfile from '../../../../../shared/interfaces/IUserProfile';
import IUserState from '../../../interfaces/IUserState';
import Radio from '../../../components/Radio/Radio';

interface IProps {
  userProfile: IUserProfile;
  userState: IUserState;
}

const UpdateUserDetailsForm: FC<IProps> = ({ userProfile, userState }) => {
  const [formInfo, setFormInfo] = useState({} as { [key: string]: string | number });

  /*
    date of birth
    Bio
    Profile options:
      display:
        location
        personal info
      Minimum films in common
  */

  useEffect(() => {
    console.log(userProfile);
    setFormInfo({
      ...formInfo,
      country: userProfile.country!,
      email: userProfile.email!,
      gender: userProfile.gender!,
      username: userProfile.username!
    });
  }, []);

  const inputChangedHandler = (value: string | number, inputName: string): void =>
    setFormInfo({ ...formInfo, [inputName]: value });

  const selectCountry = (country: string): void => setFormInfo({ ...formInfo, country });

  const updateUserProfile = async (): Promise<void> => {
    try {
      const result = await httpRequest(
        `${endpoints.UPDATE_USER_PROFILE}/${userState.username}`,
        'PUT',
        userState.accessToken,
        formInfo
      );
      console.log('🚀 ~ file: UpdateUserDetailsForm.tsx ~ line 50 ~ updateUserProfile ~ result', result);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <Input
        onChange={(event: ChangeEvent<HTMLInputElement>): void => inputChangedHandler(event.target.value, 'username')}
        placeholder={'Username'}
        type={'text'}
        value={formInfo.username as string}
      />

      <Input
        onChange={(event: ChangeEvent<HTMLInputElement>): void => inputChangedHandler(event.target.value, 'email')}
        placeholder={'Email'}
        type={'email'}
        value={formInfo.email as string}
      />

      <Input
        onChange={(event: ChangeEvent<HTMLInputElement>): void => inputChangedHandler(event.target.value, 'firstName')}
        placeholder={'First name'}
        type={'text'}
        value={formInfo.firstName as string}
      />

      <Input
        onChange={(event: ChangeEvent<HTMLInputElement>): void => inputChangedHandler(event.target.value, 'lastName')}
        placeholder={'Last name'}
        type={'text'}
        value={formInfo.lastName as string}
      />

      <p>Country:</p>
      <CountryDropdown
        classes={classes.CountrySelect}
        onChange={(country): void => selectCountry(country)}
        value={formInfo.country as string}
      />

      <p>Gender</p>
      <>
        <Radio
          name={'GenderRadio'}
          onChange={(event: { target: { value: string } }): void =>
            setFormInfo({ ...formInfo, gender: event.target.value })
          }
          value={'Female'}
        />
        <Radio
          name={'GenderRadio'}
          onChange={(event: { target: { value: string } }): void =>
            setFormInfo({ ...formInfo, gender: event.target.value })
          }
          value={'Male'}
        />
        <Radio
          name={'GenderRadio'}
          onChange={(event: { target: { value: string } }): void =>
            setFormInfo({ ...formInfo, gender: event.target.value })
          }
          value={'Other'}
        />
      </>

      <p>Date of birth:</p>
      <Calendar onChange={(value: Date): void => inputChangedHandler(value.getTime() / 1000, 'dob')} value={null} />
      <Button onClick={(): Promise<void> => updateUserProfile()} text={'Submit'} />
    </>
  );
};

export default UpdateUserDetailsForm;
