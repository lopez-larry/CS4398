/**
 * @file AdminUserList.jsx
 * @description Admin: manage users (verify, role, lock, delete) with per-row Save/Cancel.
 */

import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {
  adminGetUsers,
  adminUpdateUser,
  adminToggleLock,
  adminDeleteUser
} from '../../../src/services/userApi';

const AdminUserList = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  const [originalById, setOriginalById] = useState({});
  const [draftById, setDraftById] = useState({});
  const [savingById, setSavingById] = useState({});

  const load = async () => {
    setLoading(true);
    setFetchError('');
    try {
      const data = await adminGetUsers({ page, limit, search, sortField, sortOrder });
      const list = data.users || [];
      setRows(list);
      setTotalPages(data.totalPages || 1);

      const snap = {};
      list.forEach(u => { snap[u._id] = u; });
      setOriginalById(snap);

      setDraftById(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(id => {
          if (!snap[id]) delete next[id];
        });
        return next;
      });
    } catch (e) {
      console.error(e);
      setFetchError(e?.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, search, sortField, sortOrder]);

  const setDraft = (id, patch) => {
    setDraftById(prev => ({ ...prev, [id]: { ...(prev[id] || {}), ...patch } }));
  };

  const getEffective = (u) => ({ ...u, ...(draftById[u._id] || {}) });

  const pendingChangesFor = (u) => {
    const orig = originalById[u._id] || {};
    const draft = draftById[u._id] || {};
    const patch = {};
    ['isVerified', 'role'].forEach(k => {
      if (k in draft && draft[k] !== orig[k]) patch[k] = draft[k];
    });
    return patch;
  };

  const hasChanges = (u) => Object.keys(pendingChangesFor(u)).length > 0;

  const handleSave = async (u) => {
    const patch = pendingChangesFor(u);

    if (!Object.keys(patch).length) {
      toast.info('No changes to save.');
      return;
    }

    const validRoles = ['admin', 'breeder', 'customer'];
    if (patch.role && !validRoles.includes(patch.role)) {
      toast.error('Invalid role selection.');
      return;
    }

    setSavingById(prev => ({ ...prev, [u._id]: true }));

    try {
      const res = await adminUpdateUser(u._id, patch);
      const updated = res.user || u;

      setRows(prev => prev.map(r => (r._id === u._id ? updated : r)));
      setOriginalById(prev => ({ ...prev, [u._id]: updated }));
      setDraftById(prev => {
        const next = { ...prev };
        delete next[u._id];
        return next;
      });

      toast.success('User updated.');
    } catch (e) {
      console.error(e);
      toast.error(e?.response?.data?.message || 'Update failed.');
    } finally {
      setSavingById(prev => ({ ...prev, [u._id]: false }));
    }
  };

  const handleCancel = (u) => {
    setDraftById(prev => {
      const next = { ...prev };
      delete next[u._id];
      return next;
    });
  };

  const handleToggleLock = async (u) => {
    setSavingById(prev => ({ ...prev, [u._id]: true }));
    try {
      const res = await adminToggleLock(u._id);
      const updated = { ...u, isLocked: res.isLocked };
      setRows(prev => prev.map(r => (r._id === u._id ? updated : r)));
      setOriginalById(prev => ({ ...prev, [u._id]: updated }));
      toast.success(res.message);
    } catch (e) {
      console.error(e);
      toast.error(e?.response?.data?.message || 'Toggle lock failed.');
    } finally {
      setSavingById(prev => ({ ...prev, [u._id]: false }));
    }
  };

  const handleDelete = async (u) => {
    if (!window.confirm(`Are you sure you want to delete ${u.email}? This cannot be undone.`)) {
      return;
    }
    setSavingById(prev => ({ ...prev, [u._id]: true }));
    try {
      await adminDeleteUser(u._id);
      setRows(prev => prev.filter(r => r._id !== u._id));
      setOriginalById(prev => {
        const next = { ...prev };
        delete next[u._id];
        return next;
      });
      toast.success('User deleted.');
    } catch (e) {
      console.error(e);
      toast.error(e?.response?.data?.message || 'Delete failed.');
    } finally {
      setSavingById(prev => ({ ...prev, [u._id]: false }));
    }
  };

  const onSort = (field) => {
    if (sortField === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const headerSortIcon = (field) =>
    sortField === field ? (sortOrder === 'asc' ? '↑' : '↓') : '';

  const empty = !loading && rows.length === 0;

  return (
    <div className="container py-3">
      <div className="d-flex justify-content-between align-items-center">
        <h2 className="mb-3">Users</h2>
        <div className="d-flex align-items-center gap-2">
          <input
            type="text"
            className="form-control"
            style={{ maxWidth: 260 }}
            placeholder="Search email or username…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
          <select
            className="form-select"
            style={{ width: 100 }}
            value={limit}
            onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {fetchError && <div className="alert alert-danger">{fetchError}</div>}
      {loading && <div className="alert alert-info">Loading…</div>}
      {empty && <div className="alert alert-secondary">No users found.</div>}

      {!empty && (
        <div className="table-responsive">
          <table className="table table-striped align-middle">
            <thead>
              <tr>
                <th onClick={() => onSort('email')} style={{ cursor: 'pointer' }}>
                  Email {headerSortIcon('email')}
                </th>
                <th onClick={() => onSort('username')} style={{ cursor: 'pointer' }}>
                  Username {headerSortIcon('username')}
                </th>
                <th onClick={() => onSort('role')} style={{ cursor: 'pointer' }}>
                  Role {headerSortIcon('role')}
                </th>
                <th>Verified</th>
                <th>Locked</th>
                <th style={{ width: 260 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => {
                const eff = getEffective(u);
                const changed = hasChanges(u);
                const saving = !!savingById[u._id];

                return (
                  <tr key={u._id}>
                    <td>{eff.email}</td>
                    <td>{eff.username}</td>

                    <td>
                      <select
                        className="form-select form-select-sm"
                        value={eff.role || 'customer'}
                        onChange={(e) => setDraft(u._id, { role: e.target.value })}
                      >
                        <option value="customer">customer</option>
                        <option value="breeder">breeder</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>

                    <td>
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={!!eff.isVerified}
                        onChange={() => setDraft(u._id, { isVerified: !eff.isVerified })}
                      />
                    </td>

                    <td>
                      <button
                        className={`btn btn-sm ${eff.isLocked ? 'btn-danger' : 'btn-outline-success'}`}
                        disabled={saving}
                        onClick={() => handleToggleLock(u)}
                      >
                        {saving ? '...' : eff.isLocked ? 'Locked' : 'Unlocked'}
                      </button>
                    </td>

                    <td>
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-sm btn-primary"
                          disabled={!changed || saving}
                          onClick={() => handleSave(u)}
                        >
                          {saving ? 'Saving…' : 'Save'}
                        </button>
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          disabled={!changed || saving}
                          onClick={() => handleCancel(u)}
                        >
                          Cancel
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          disabled={saving}
                          onClick={() => handleDelete(u)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="d-flex justify-content-between align-items-center mt-3">
        <button
          className="btn btn-secondary"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1}
        >
          Previous
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          className="btn btn-secondary"
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page >= totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default AdminUserList;
