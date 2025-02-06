import { Routes, Route } from 'react-router-dom';
import { UserProfileProvider } from './ProfileSettings';
import ProfileSettings from './ProfileSettings';
import BasicInfo from './BasicInfo';
import Account from './Account';
import Friends from './Friends';
import Settings from './Settings';

const ProfileRoutes = () => {
  return (
    <UserProfileProvider>
      <Routes>
        <Route path="/" element={<ProfileSettings />}>
          <Route index element={<BasicInfo />} />
          <Route path="account" element={<Account />} />
          <Route path="friends" element={<Friends />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </UserProfileProvider>
  );
};

export default ProfileRoutes;
