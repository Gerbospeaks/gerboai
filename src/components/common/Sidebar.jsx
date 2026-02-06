import React from 'react';
import { Link } from 'react-router-dom';

function Sidebar({ title, navItems, color = 'blue' }) {
  const colorClasses = {
    blue: 'bg-blue-500',
    orange: 'bg-orange-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200">
      <div className="p-4 md:p-6">
        <div className="flex items-center space-x-2 mb-8">
          <div className={`w-10 h-10 ${colorClasses[color]} rounded-lg flex items-center justify-center text-gray-800 text-xl font-bold`}>
            {title[0]}
          </div>
          <span className="font-semibold text-lg">{title}</span>
        </div>

        <nav className="space-y-2">
          <Link to="/" className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
            <span>🏠</span>
            <span>Home</span>
          </Link>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <span>{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}

export default Sidebar;