import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchMessages, sendMessage, deleteMessage, searchUsers } from '../actions/messageActions';

const Messages = () => {
    const dispatch = useDispatch();
    const messages = useSelector(state => state.messages);
    const users = useSelector(state => state.users);
    const [newMessage, setNewMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        dispatch(fetchMessages());
    }, [dispatch]);

    const handleSendMessage = () => {
        dispatch(sendMessage(newMessage));
        setNewMessage('');
    };

    const handleDeleteMessage = (id) => {
        dispatch(deleteMessage(id));
    };

    const handleSearchUsers = () => {
        dispatch(searchUsers(searchTerm));
    };

    return (
        <div>
            <h2>Messages</h2>
            <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onBlur={handleSearchUsers}
            />
            <ul>
                {messages.map(message => (
                    <li key={message.id}>
                        <span>{message.sender}: {message.text}</span>
                        <span>Status: {message.status}</span>
                        <button onClick={() => handleDeleteMessage(message.id)}>Delete</button>
                    </li>
                ))}
            </ul>
            <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
            ></textarea>
            <button onClick={handleSendMessage}>Send Message</button>
        </div>
    );
};

export default Messages;
