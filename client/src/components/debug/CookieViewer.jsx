import React from 'react';

const CookieViewer = () => {
  const cookies = Object.keys(localStorage)
    .filter(k => k.startsWith('cookie_'))
    .map(k => ({
      name: k.replace('cookie_', ''),
      value: localStorage.getItem(k),
    }));

  if (cookies.length === 0) {
    return <p>No tracking cookies stored.</p>;
  }

  return (
    <div >
      <ul>
        {cookies.map(({ name, value }) => (
          <li key={name}><strong>{name}</strong>: {value}</li>
        ))}
      </ul>
    </div>
  );
};

export default CookieViewer;
