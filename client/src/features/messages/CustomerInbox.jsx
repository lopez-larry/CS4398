/**
 * @file CustomerInbox.jsx
 */

import React, { useEffect, useState } from "react";
import axios from "@/axiosInstance";
import { toast } from "react-toastify";
import { useAuth } from "@/context/AuthContext";

const CustomerInbox = ({ refreshUnread }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const res = await axios.get("/messages/conversations");
      setConversations(res.data || []);
    } catch (err) {
      console.error("Error loading conversations:", err);
      toast.error("Failed to load conversations.");
    }
  };

  const selectConversation = async (convo) => {
    setSelected(convo);

    try {
      const res = await axios.get(`/messages/conversation/${convo._id}`);
      setMessages(res.data);

      // ✅ mark messages read
      await axios.post(`/messages/conversation/${convo._id}/read`);
      if (refreshUnread) refreshUnread();
    } catch (err) {
      console.error("Error selecting conversation:", err);
    }
  };

  // ✅ Conversation delete handler
  const handleDeleteConversation = async (convoId) => {
    const confirmDelete = window.confirm("Delete this conversation?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`/messages/conversation/${convoId}`);
      toast.success("Conversation deleted.");

      // Remove from UI
      setConversations((prev) =>
        prev.filter((c) => c._id !== convoId)
      );

      // Close details if the deleted convo was open
      if (selected && selected._id === convoId) {
        setSelected(null);
        setMessages([]);
      }

      // ✅ Force unread refresh (in case unread inside deleted convo)
      if (refreshUnread) refreshUnread();
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Could not delete conversation.");
    }
  };

  const sendReply = async (messageId) => {
    if (!replyText.trim()) return toast.error("Cannot send empty message.");

    try {
      await axios.post(`/messages/${messageId}/reply`, { message: replyText });
      setReplyText("");
      await selectConversation(selected);
      toast.success("Message sent.");
    } catch (err) {
      console.error("Reply failed:", err);
      toast.error("Failed to send.");
    }
  };

  return (
    <div>
      {conversations.length === 0 && <p>No messages found.</p>}

      {conversations.length > 0 && (
        <table className="table table-bordered text-sm">
          <thead className="table-light">
            <tr>
              <th>Breeder</th>
              <th>Dog</th>
              <th>Preview</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {conversations.map((c) => {
              const other = c.participants.find((p) => p._id !== user._id);
              const last = c.lastMessage || {};
              return (
                <tr key={c._id}>
                  <td>{other?.username || other?.email}</td>
                  <td>{c.dog?.name}</td>
                  <td>{last.message?.slice(0, 40)}...</td>
                  <td className="d-flex gap-2">
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => selectConversation(c)}
                    >
                      View
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDeleteConversation(c._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {selected && (
        <div className="mt-3 bg-light p-3 border rounded">
          <h4>
            Chat with{" "}
            {selected.participants.find((p) => p._id !== user._id)?.username}
          </h4>

          <div style={{ maxHeight: "250px", overflowY: "auto" }}>
            {messages.map((m) => (
              <div
                key={m._id}
                className={`message-bubble ${m.fromUser._id === user._id ? "sent" : "received"}`}
              >
                <small>
                  <strong>{m.fromUser.username || m.fromUser.email}</strong>{" "}
                  {new Date(m.createdAt).toLocaleString()}
                </small>
                <p className="mb-0">{m.message}</p>
              </div>
            ))}
          </div>

          <textarea
            className="form-control mt-2"
            rows="2"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Type a reply"
          />

          <div className="d-flex mt-2 gap-2">
            <button
              className="btn btn-primary"
              onClick={() => sendReply(messages[messages.length - 1]?._id)}
            >
              Send
            </button>
            <button className="btn btn-secondary" onClick={() => setSelected(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerInbox;
