import React, { useState } from 'react';

const Profile = () => {
    // State for profile information
    const [profile, setProfile] = useState({
        bio: '',
        contact: '',
        education: [],
        experience: [],
        skills: [],
    });

    // State for handling edit mode and messages
    const [isEditing, setIsEditing] = useState(false);
    const [message, setMessage] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfile({ ...profile, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Add form validation and submission logic here
        setMessage('Profile updated successfully!');
        setIsEditing(false);
    };

    return (
        <div className="profile-container">
            <h1>Profile Management</h1>
            {message && <div className="alert">{message}</div>}
            <form onSubmit={handleSubmit}>
                {/* Bio */}
                <textarea 
                    name="bio" 
                    value={profile.bio} 
                    onChange={handleInputChange} 
                    placeholder="Your Bio"
                    disabled={!isEditing}
                />
                
                {/* Contact Information */}
                <input 
                    type="text" 
                    name="contact" 
                    value={profile.contact} 
                    onChange={handleInputChange} 
                    placeholder="Contact Information"
                    disabled={!isEditing}
                />
                
                {/* Other fields like Education, Experience, Skills can be added similarly */}
                
                <button type="button" onClick={() => setIsEditing(!isEditing)}>
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                </button>
                <button type="submit" disabled={!isEditing}>Save Changes</button>
            </form>
        </div>
    );
};

export default Profile;
