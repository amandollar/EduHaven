import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { jwtDecode } from 'jwt-decode';
import { useUserProfile } from './ProfileSettings';

export default function BasicInfo() {
  const { user, setUser, fetchUserDetails } = useUserProfile();
  const [profileData, setProfileData] = useState({
    FirstName: '',
    LastName: '',
    ProfilePicture: null,
    Bio: '',
    University: '',
    Country: '',
    FieldOfStudy: '',
    GraduationYear: '',
    Gender: '',
    OtherDetails: {}
  });
  const [profilePic, setProfilePic] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isProfilePicLoading, setIsProfilePicLoading] = useState(false);
  const [isProfileUpdateLoading, setIsProfileUpdateLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserId(decoded.id);

        // If user is not loaded, fetch details
        if (!user) {
          fetchUserDetails(decoded.id);
        } else {
          // Update profile data from user context
          setProfileData({
            FirstName: user.FirstName || '',
            LastName: user.LastName || '',
            ProfilePicture: user.ProfilePicture || null,
            Bio: user.Bio || '',
            University: user.University || '',
            Country: user.Country || '',
            FieldOfStudy: user.FieldOfStudy || '',
            GraduationYear: user.GraduationYear || '',
            Gender: user.Gender || '',
            OtherDetails: user.OtherDetails || {}
          });
        }
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleOtherDetailsChange = (key, value) => {
    setProfileData(prev => ({
      ...prev,
      OtherDetails: {
        ...prev.OtherDetails,
        [key]: value
      }
    }));
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    setProfilePic(file);
    
    // Create a preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileData(prev => ({
        ...prev,
        ProfilePicture: reader.result
      }));
    };
    reader.readAsDataURL(file);
  };

  const uploadProfilePicture = async () => {
    if (!profilePic) {
      toast.error('No image selected');
      return null;
    }

    setIsProfilePicLoading(true);
    const formData = new FormData();
    formData.append('profilePicture', profilePic);

    try {
      const response = await axios.post(
        'http://localhost:3000/user/upload-profile-picture', 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      // Update profile picture URL
      return response.data.profilePictureUrl;
    } catch (error) {
      console.error('Profile picture upload error:', error);
      toast.error(error.response?.data?.error || 'Failed to upload profile picture');
      return null;
    } finally {
      setIsProfilePicLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!userId) {
      toast.error('User not authenticated');
      return;
    }

    setIsProfileUpdateLoading(true);
    try {
      // First, upload profile picture if a new one is selected
      let profilePictureUrl = profileData.ProfilePicture;
      if (profilePic) {
        const uploadedUrl = await uploadProfilePicture();
        if (uploadedUrl) {
          profilePictureUrl = uploadedUrl;
        } else {
          return; // Stop if upload fails
        }
      }

      // Prepare data to send (excluding undefined/empty values)
      const updateData = {
        ...Object.fromEntries(
          Object.entries(profileData).filter(([_, v]) => v !== '' && v !== null)
        ),
        ProfilePicture: profilePictureUrl
      };

      const response = await axios.put(
        'http://localhost:3000/user/profile', 
        updateData,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      toast.success('Profile updated successfully');
      
      // Update both local and context state
      setProfileData(response.data);
      setUser(response.data);
      setProfilePic(null);
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setIsProfileUpdateLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Basic Information</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Profile Picture */}
        <div>
          <label className="block mb-1">Profile Picture</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleProfilePicChange}
            className="w-full"
            disabled={isProfilePicLoading || isProfileUpdateLoading}
          />
          {profileData.ProfilePicture && (
            <img 
              src={profileData.ProfilePicture} 
              alt="Profile" 
              className="mt-2 w-36 h-36 rounded-md object-cover"
            />
          )}
          {isProfilePicLoading && (
            <div className="text-blue-500 mt-2">Uploading profile picture...</div>
          )}
        </div>

        {/* Name */}
        <div className="flex gap-4">
          <div className="w-1/2">
            <label className="block mb-1">First Name</label>
            <input
              type="text"
              name="FirstName"
              value={profileData.FirstName}
              onChange={handleInputChange}
              placeholder="First name"
              className="w-full border rounded px-3 py-2 !text-[var(--primary)]"
              required
              disabled={isProfileUpdateLoading}
            />
          </div>
          <div className="w-1/2">
            <label className="block mb-1">Last Name</label>
            <input
              type="text"
              name="LastName"
              value={profileData.LastName}
              onChange={handleInputChange}
              placeholder="Last name"
              className="w-full border rounded px-3 py-2 !text-[var(--primary)]"
              required
              disabled={isProfileUpdateLoading}
            />
          </div>
        </div>

        {/* Bio */}
        <div>
          <label className="block mb-1">Bio</label>
          <textarea
            name="Bio"
            value={profileData.Bio}
            onChange={handleInputChange}
            placeholder="Tell us about yourself (max 500 characters)"
            className="w-full bg-gray-700 text-white rounded px-3 py-2 border-0"
            rows="4"
            maxLength="500"
            disabled={isProfileUpdateLoading}
          ></textarea>
        </div>

        {/* University (Optional) */}
        <div>
          <label className="block mb-1">
            University <span className="text-sm text-gray-500">(Optional)</span>
          </label>
          <input
            type="text"
            name="University"
            value={profileData.University}
            onChange={handleInputChange}
            placeholder="Your university"
            className="w-full border rounded px-3 py-2 !text-[var(--primary)]"
            disabled={isProfileUpdateLoading}
          />
        </div>

        {/* Country (Optional) */}
        <div>
          <label className="block mb-1">
            Country <span className="text-sm text-gray-500">(Optional)</span>
          </label>
          <input
            type="text"
            name="Country"
            value={profileData.Country}
            onChange={handleInputChange}
            placeholder="Your country"
            className="w-full border rounded px-3 py-2 !text-[var(--primary)]"
            disabled={isProfileUpdateLoading}
          />
        </div>

        {/* Field of Study (Optional) */}
        <div>
          <label className="block mb-1">
            Field of Study <span className="text-sm text-gray-500">(Optional)</span>
          </label>
          <input
            type="text"
            name="FieldOfStudy"
            value={profileData.FieldOfStudy}
            onChange={handleInputChange}
            placeholder="Your field of study"
            className="w-full border rounded px-3 py-2 !text-[var(--primary)]"
            disabled={isProfileUpdateLoading}
          />
        </div>

        {/* Graduation Year (Optional) */}
        <div>
          <label className="block mb-1">
            Graduation Year <span className="text-sm text-gray-500">(Optional)</span>
          </label>
          <input
            type="number"
            name="GraduationYear"
            value={profileData.GraduationYear}
            onChange={handleInputChange}
            placeholder="e.g. 2026"
            min="1900"
            max="2100"
            className="w-full border rounded px-3 py-2 !text-[var(--primary)]"
            disabled={isProfileUpdateLoading}
          />
        </div>

        {/* Gender (Optional) */}
        <div>
          <label className="block mb-1">
            Gender <span className="text-sm text-gray-500">(Optional)</span>
          </label>
          <select
            name="Gender"
            value={profileData.Gender}
            onChange={handleInputChange}
            className="w-full border rounded px-3 py-2 !text-[var(--primary)]"
            disabled={isProfileUpdateLoading}
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>

        {/* OtherDetails Section */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Additional Details</h3>
          <div className="space-y-4">
            <div>
              <label className="block mb-1">Interests</label>
              <input
                type="text"
                value={profileData.OtherDetails.interests || ''}
                onChange={(e) => handleOtherDetailsChange('interests', e.target.value)}
                placeholder="Enter your interests"
                className="w-full border rounded px-3 py-2 !text-[var(--primary)]"
                disabled={isProfileUpdateLoading}
              />
            </div>
            <div>
              <label className="block mb-1">Skills</label>
              <input
                type="text"
                value={profileData.OtherDetails.skills || ''}
                onChange={(e) => handleOtherDetailsChange('skills', e.target.value)}
                placeholder="Enter your skills"
                className="w-full border rounded px-3 py-2 !text-[var(--primary)]"
                disabled={isProfileUpdateLoading}
              />
            </div>
            <div>
              <label className="block mb-1">Additional Notes</label>
              <textarea
                value={profileData.OtherDetails.additionalNotes || ''}
                onChange={(e) => handleOtherDetailsChange('additionalNotes', e.target.value)}
                placeholder="Any additional information you'd like to share"
                className="w-full bg-gray-700 text-white rounded px-3 py-2 border-0"
                rows="4"
                disabled={isProfileUpdateLoading}
              ></textarea>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button 
          type="submit" 
          className={`w-full py-2 rounded ${
            isProfileUpdateLoading 
              ? 'bg-gray-500 cursor-not-allowed' 
              : 'bg-blue-500 hover:bg-blue-600'
          }`}
          disabled={isProfileUpdateLoading}
        >
          {isProfileUpdateLoading ? 'Updating...' : 'Update Profile'}
        </button>
      </form>
    </div>
  );
};