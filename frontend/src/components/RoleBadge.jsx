import React from 'react';

const RoleBadge = ({ role }) => {
  if (role === 'admin') {
    return (
      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 uppercase tracking-wide border border-purple-200 shadow-sm">
        ADMIN
      </span>
    );
  }
  return (
    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 uppercase tracking-wide border border-orange-200 shadow-sm">
      CUSTOMER
    </span>
  );
};

export default RoleBadge;
