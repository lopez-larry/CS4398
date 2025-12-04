/**
 * @file BreederInbox.jsx
 * @description Inbox for breeders to manage customer conversations (threaded).
 */

import React, { useEffect, useState } from 'react';
import axios from '@/axiosInstance';
import { toast } from 'react-toastify';
import { useAuth } from "@/context/AuthContext";

const BreederInbox = () => {
  const [conversations, setConversations] = useState([]);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [messages, setMessages] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    fetchConversations();
    fetchBlocked();
  }, []);

  const fetchConversations = async () => {
    try {
      const res = await axios.get('/messages/conversations');
      setConversations(res.data || []);
    } catch (err) {
      console.error('Error fetching conversations:', err);
      toast.error('Failed to load conversations.');
    }
  };

  const fetchBlocked = async () => {
    try {
      const res = await axios.get('/messages/blocked');
      setBlockedUsers(res.data.map((b) => b.blocked._id));
    } catch (err) {
      console.error('Error fetching blocked users:', err);
    }
  };

  const handleReply = async (id) => {
    if (!replyText.trim()) {
      toast.error('Reply cannot be empty.');
      return;
    }
    try {
      await axios.post(`/messages/${id}/reply`, { message: replyText });
      toast.success('Reply sent.');
      setReplyText('');
      if (selected) {
        await handleSelectConversation(selected); // refresh thread
      }
      fetchConversations();
    } catch (err) {
      console.error('Reply failed:', err);
      toast.error('Failed to send reply.');
    }
  };

  const handleDeleteConversation = async (convoId) => {
    if (!window.confirm('Delete this entire conversation?')) return;
    try {
      await axios.delete(`/messages/conversation/${convoId}`);
      toast.success('Conversation deleted.');
      setSelected(null);
      fetchConversations();
    } catch (err) {
      console.error('Delete conversation failed:', err);
      toast.error('Could not delete conversation.');
    }
  };

  const handleBlockToggle = async (userId, isBlocked) => {
    try {
      if (isBlocked) {
        await axios.post('/messages/unblock', { userId });
        toast.success('User unblocked.');
      } else {
        await axios.post('/messages/block', { userId });
        toast.success('User blocked.');
      }
      await fetchBlocked();
      await fetchConversations();
    } catch (err) {
      console.error('Block/unblock failed:', err);
      toast.error('Action failed.');
    }
  };

  const handleSelectConversation = async (convo) => {
    setSelected(convo);

    try {
      // Fetch messages
      const res = await axios.get(`/messages/conversation/${convo._id}`);
      const msgs = res.data || [];
      setMessages(msgs);

      // Mark unread messages to breeder as read
      if (msgs.some(m => !m.read && m.toUser._id === user._id)) {
        await axios.post(`/messages/conversation/${convo._id}/read`);
      }

      // Refresh unread count in navbar
      if (typeof window.refreshUnreadCount === "function") {
        window.refreshUnreadCount();
      }

      // Refresh previews in conversation list
      fetchConversations();

    } catch (err) {
      console.error('Failed to load conversation:', err);
    }
  };

  return (
    <div className="p-4">

      {conversations.length === 0 && <p>No conversations yet.</p>}

      {conversations.length > 0 && (
        <table className="table table-bordered w-full text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th>With</th>
              <th>Dog</th>
              <th>Subject</th>
              <th>Preview</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {conversations.map((c) => {
              const other = c.participants.find((p) => p._id !== user._id);
              const last = c.lastMessage || {};
              const isBlocked = other && blockedUsers.includes(other._id);

              const hasUnread = !last.read && last.toUser === user._id;

              return (
                <tr key={c._id} className={hasUnread ? "fw-bold" : ""}>
                  <td>{other?.username || other?.email}</td>
                  <td>{c.dog?.name}</td>
                  <td>
                    {hasUnread && (
                      <span className="badge bg-danger me-1">New</span>
                    )}
                    {last.subject}
                  </td>
                  <td>{last.message?.slice(0, 40)}...</td>
                  <td className="flex gap-2">
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => handleSelectConversation(c)}
                    >
                      View
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDeleteConversation(c._id)}
                    >
                      Delete
                    </button>
                    <button
                      className={`btn btn-sm ${isBlocked ? 'btn-secondary' : 'btn-warning'}`}
                      onClick={() => handleBlockToggle(other._id, isBlocked)}
                    >
                      {isBlocked ? 'Unblock' : 'Block'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {selected && (
        <div className="mt-6 bg-gray-50 border p-4 rounded shadow-sm">
          <h3 className="text-lg font-bold mb-2">
            Conversation with{" "}
            {selected.participants.find((p) => p._id !== user._id)?.username}
          </h3>

          <div style={{ maxHeight: "250px", overflowY: "auto" }}>
            {messages.map((msg) => {
              const isSent = msg.fromUser._id === user._id;
              return (
                <div
                  key={msg._id}
                  className={`message-bubble ${isSent ? "sent" : "received"}`}
                >
                  <small>
                    <strong>{msg.fromUser.username || msg.fromUser.email}</strong> •{" "}
                    {new Date(msg.createdAt).toLocaleString()}
                  </small>
                  <p className="mt-1 mb-0">{msg.message}</p>
                </div>
              );
            })}
          </div>

          <textarea
            className="form-control mb-2"
            rows="3"
            placeholder="Type your reply..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
          />

          <div className="flex gap-2">
            <button
              className="btn btn-primary"
              onClick={() =>
                handleReply(messages[messages.length - 1]?._id)
              }
            >
              Send Reply
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => setSelected(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BreederInbox;
