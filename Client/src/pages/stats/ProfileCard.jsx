import React,{ useState, useEffect } from 'react';
import { User, MessageCircle, ThumbsUp, Edit } from "lucide-react";
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const ProfileCard = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = React.createRef();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const decoded = jwtDecode(token);
        const response = await axios.get(
          `http://localhost:3000/user/details?id=${decoded.id}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        setUser(response.data);
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleEditProfilePicture = async (event) => {
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append('profilePicture', file);

    setIsLoading(true);
    setIsEditing(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:3000/user/upload-profile-picture`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          }
        }
      );
      const updatedUser = await axios.get(
        `http://localhost:3000/user/details?id=${response.data._id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      setUser(updatedUser.data);
    } catch (error) {
      console.error('Error updating profile picture:', error);
    } finally {
      setIsLoading(false);
      setIsEditing(false);
    }
  };

  const handleClickEditIcon = () => {
    fileInputRef.current.click();
  };

  if (isLoading || !user) {
    return (
      <div className="bg-gradient-to-br from-purple-800 to-indigo-900 rounded-3xl shadow-2xl p-6 w-full animate-pulse">
        <div className="flex flex-col items-center">
          <div className="w-32 h-32 bg-gray-700 rounded-full mb-4"></div>
          <div className="h-6 bg-gray-700 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-purple-800 to-indigo-900 rounded-3xl shadow-2xl p-6 w-full relative overflow-hidden">
      {/* Decorative Gradient Overlay */}
      <div className="absolute top-0 left-0 right-0 bottom-0 opacity-20 bg-gradient-to-br from-white to-transparent pointer-events-none"></div>
      
      {/* Profile Picture */}
      <div className="relative flex justify-center mb-4">
        <div className="w-36 h-36 rounded-full border-4 border-white/30 shadow-lg overflow-hidden">
          {user.ProfilePicture ? (
            <img 
              src={user.ProfilePicture} 
              alt="Profile" 
              className="w-full h-full object-cover" 
            />
          ) : (
            <div className="w-full h-full bg-indigo-600/50 flex items-center justify-center">
              <User className="w-16 h-16 text-white/70" />
            </div>
          )}
        </div>
        <div className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-2 shadow-lg cursor-pointer" onClick={handleClickEditIcon}>
          <Edit className="w-4 h-4 text-white" />
        </div>
        <input 
          type="file"
          accept="image/*"
          ref={fileInputRef}
          className="hidden"
          onChange={handleEditProfilePicture} 
        />
        {isEditing && (
          <div className="absolute top-0 left-0 right-0 bottom-0 bg-black/50 flex items-center justify-center">
            <div className="animate-spin rounded-full border-b-2 border-white h-6 w-6"></div>
          </div>
        )}
      </div>

      {/* User Info */}
      <div className="text-center text-white">
        <h2 className="text-3xl font-bold mb-2">
          {user.FirstName} {user.LastName}
        </h2>
        <p className="text-white/80 mb-4 max-w-xs mx-auto">
          {user?.Bio || 'No bio available'}
        </p>
        
        {/* Stats */}
        <div className="flex justify-center space-x-4 mb-4">
          <div className="text-center">
            <span className="block text-xl font-bold">342</span>
            <span className="text-sm text-white/70">Kudos</span>
          </div>
          <div className="text-center">
            <span className="block text-xl font-bold">56</span>
            <span className="text-sm text-white/70">Friends</span>
          </div>
          <div className="text-center">
            <span className="block text-xl font-bold">#343</span>
            <span className="text-sm text-white/70">Rank</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4 mb-4">
          <button className="bg-white/20 hover:bg-white/30 transition-colors text-white px-6 py-2 rounded-full flex items-center space-x-2">
            <ThumbsUp className="w-5 h-5" />
            <span>Kudos</span>
          </button>
          <button className="bg-white/20 hover:bg-white/30 transition-colors text-white px-6 py-2 rounded-full flex items-center space-x-2">
            <MessageCircle className="w-5 h-5" />
            <span>Message</span>
          </button>
        </div>

        {/* Additional Details */}
        <div className="bg-white/10 rounded-2xl p-4 space-y-2">
          <div className="flex justify-between text-white/80">
            <span>University</span>
            <span>{user.University || 'Not specified'}</span>
          </div>
          <div className="flex justify-between text-white/80">
            <span>Country</span>
            <span>{user.Country || 'Not specified'}</span>
          </div>
          <div className="flex justify-between text-white/80">
            <span>Field of Study</span>
            <span>{user.FieldOfStudy || 'Not specified'}</span>
          </div>
          <div className="flex justify-between text-white/80">
            <span>Member Since</span>
            <span>{new Date(user.createdAt).getFullYear()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
