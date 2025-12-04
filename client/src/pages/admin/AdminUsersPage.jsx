// src/pages/admin/AdminUsersPage.jsx
import React from 'react';
import AdminUserList from "../../../src/features/admin/AdminUserList";

export default function AdminUsersPage() {
  return (
    <main className="container py-3">
      <h1 className="mb-4">Users</h1>
      <AdminUserList />
    </main>
  );
}
