import React, { useEffect, useState } from 'react';
import axiosInstance from '../../../src/axiosInstance';

const AdminSubmissionList = () => {
  const [submissions, setSubmissions] = useState([]);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('submittedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetchSubmissions();
  }, [search, sortField, sortOrder]);

  const fetchSubmissions = async () => {
    const res = await axiosInstance.get('/admin/submissions', {
      params: { search, sortField, sortOrder },
    });
    setSubmissions(res.data);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this submission?')) {
      await axiosInstance.delete(`/admin/submissions/${id}`);
      fetchSubmissions();
      if (selected?._id === id) setSelected(null);
    }
  };

  return (
    <div className="mt-6">
      <h2 className="text-xl font-bold mb-4 mt-5">Public - Form Submissions</h2>

      <div className="flex gap-2 mb-4">
        <input
          placeholder="Search messages"
          className="form-control"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <table className="table table-bordered w-full text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 cursor-pointer" onClick={() => handleSort('name')}>
              Name {sortField === 'name' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
            </th>
            <th className="p-2 cursor-pointer" onClick={() => handleSort('message')}>
              Message {sortField === 'message' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
            </th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {submissions.map((s) => (
            <tr key={s._id}>
              <td className="p-2">{s.name}</td>
              <td className="p-2">{s.message.slice(0, 50)}...</td>
              <td className="p-2 flex gap-2">
                <button className="btn btn-sm btn-outline btn-warning mx-2" onClick={() => setSelected(s)}>View</button>
                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(s._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selected && (
        <div className="mt-6 bg-gray-50 border p-4 rounded shadow-sm mb-5">
          <h3 className="text-lg font-bold mb-1">Submission from {selected.name}</h3>
          <p>{selected.message}</p>
        </div>
      )}
    </div>
  );
};

export default AdminSubmissionList;
