import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-app text-primary relative overflow-hidden">
      <div className="cosmos-background">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
      </div>
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="macos-glass max-w-xl w-full p-10 text-center">
          <p className="text-accent text-sm uppercase tracking-[0.2em] mb-3">Navigation Error</p>
          <h1 className="text-display font-black mb-3">404</h1>
          <p className="text-secondary text-lg mb-6">You have wandered into the void. This route does not exist.</p>
          <Link to="/" className="btn-primary inline-block px-6">
            Return to Safety
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;

