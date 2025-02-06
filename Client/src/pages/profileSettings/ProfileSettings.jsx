import { createContext, useState, useContext, useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { User, Settings, Users, LogOut } from "lucide-react";
import axios from "axios";
import {jwtDecode} from "jwt-decode";

// Create a context for user profile
const UserProfileContext = createContext({
  user: null,
  setUser: () => {},
  fetchUserDetails: () => Promise.resolve(null)
});

// Provider component
export const UserProfileProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const fetchUserDetails = async (userId) => {
    try {
      const response = await axios.get(
        `http://localhost:3000/user/details?id=${userId}`
      );
      const userData = response.data;
      setUser(userData);
      return userData;
    } catch (error) {
      console.error("Error fetching user details:", error);
      return null;
    }
  };

  return (
    <UserProfileContext.Provider value={{ user, setUser, fetchUserDetails }}>
      {children}
    </UserProfileContext.Provider>
  );
};

// Custom hook for using user profile context
export const useUserProfile = () => {
  const context = useContext(UserProfileContext);
  if (!context) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  return context;
};

const ProfileSettings = () => {
  const { user, fetchUserDetails } = useUserProfile();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        fetchUserDetails(decoded.id);
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, []);

  if (!user) return <div>Loading...</div>;

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/signout");
  };

  const sidebarLinkClasses = ({ isActive }) =>
    `block px-4 py-2 rounded-md hover:bg-gray-700 ${
      isActive ? "bg-purple-800 font-bold" : ""
    }`;

  return (
    <>
      {/* Profile Info */}
      <div className="flex gap-5 items-center pl-[10vw] h-72 bg-gradient-to-r from-purple-700 to-indigo-800 rounded-xl">
        <div className="w-32 h-32 rounded-full border-2 border-gray-700 overflow-hidden shadow-lg">
          {user.ProfilePicture ? (
            <img
              src={user.ProfilePicture}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="h-full w-full" />
          )}
        </div>
        <div>
          <h1 className="text-5xl font-bold">{`${user.FirstName} ${user.LastName}`}</h1>
          <p>
            <strong>User ID:</strong> {user._id}
          </p>
          {user.Bio && <p className="mt-2 text-gray-300">{user.Bio}</p>}
        </div>
      </div>

      <div className="flex h-1/2">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-800 shadow-md relative">
          <nav className="p-4 space-y-2">
            <NavLink to="" end className={sidebarLinkClasses}>
              <User className="inline-block mr-2" size={16} />
              Basic Info
            </NavLink>
            <NavLink to="account" className={sidebarLinkClasses}>
              <Settings className="inline-block mr-2" size={16} />
              Account
            </NavLink>
            <NavLink to="friends" className={sidebarLinkClasses}>
              <Users className="inline-block mr-2" size={16} />
              Friends
            </NavLink>
            <NavLink to="settings" className={sidebarLinkClasses}>
              <Settings className="inline-block mr-2" size={16} />
              Settings
            </NavLink>
          </nav>
          {/* Logout Button fixed at bottom */}
          <div className="absolute bottom-4 w-full px-4">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center px-4 py-2 text-red-600 hover:bg-red-100 rounded"
            >
              <LogOut className="inline-block mr-2" size={16} />
              Logout
            </button>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-8 bg-gray-900">
          <Outlet />
        </main>
      </div>
    </>
  );
};

export default ProfileSettings;