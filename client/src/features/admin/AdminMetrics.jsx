/**
 * @file AdminMetrics.jsx
 * @description Displays admin metrics like total users, and new users this month.
 */

import React from 'react';

const AdminMetrics = ({ metrics }) => {
  if (!metrics) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div className="p-4 border rounded shadow">
        <h2 className="text-lg font-semibold">Total Users</h2>
        <p className="text-2xl">{metrics.totalUsers}</p>
      </div>
      <div className="p-4 border rounded shadow">
        <h2 className="text-lg font-semibold">New Users This Month</h2>
        <p className="text-2xl">{metrics.usersCreatedThisMonth}</p>
      </div>
    </div>
  );
};

export default AdminMetrics;
