import React, { useEffect, useState } from 'react';

const Dashboard = () => {
    const [userData, setUserData] = useState(null);
    const [cvList, setCvList] = useState([]);

    useEffect(() => {
        // Fetch user data
        const fetchUserData = async () => {
            try {
                const response = await fetch('/api/user'); // Assuming there's an API endpoint for user data
                const data = await response.json();
                setUserData(data);
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        // Fetch CV listings
        const fetchCVList = async () => {
            try {
                const response = await fetch('/api/cvs'); // Assuming there's an API endpoint for CV listing
                const data = await response.json();
                setCvList(data);
            } catch (error) {
                console.error('Error fetching CV list:', error);
            }
        };

        fetchUserData();
        fetchCVList();
    }, []);

    return (
        <div>
            <h1>Welcome {userData ? userData.name : 'User'}!</h1>
            <h2>Your CVs:</h2>
            <ul>
                {cvList.length > 0 ? (
                    cvList.map(cv => <li key={cv.id}>{cv.title}</li>)
                ) : (
                    <li>No CVs found.</li>
                )}
            </ul>
        </div>
    );
};

export default Dashboard;