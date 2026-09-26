import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../lib/api.js';

export default function UserMenu({ onSignInClick }) {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [orders, setOrders] = useState([]);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (open && user) {
      api.getOrders().then(setOrders).catch(() => {});
    }
  }, [open, user]);

  if (!user) {
    return (
      <button className="auth-button" onClick={onSignInClick}>
        Sign in
      </button>
    );
  }

  return (
    <div className="user-menu" ref={menuRef}>
      <button className="user-menu__trigger" onClick={() => setOpen(!open)}>
        {user.email?.[0]?.toUpperCase() || 'U'}
      </button>
      {open && (
        <div className="user-menu__dropdown">
          <div className="user-menu__header">
            <strong>{user.user_metadata?.full_name || 'User'}</strong>
            <span>{user.email}</span>
          </div>
          <div className="user-menu__divider" />
          <div className="user-menu__section">
            <span className="user-menu__label">Recent orders</span>
            {orders.length === 0 ? (
              <span className="user-menu__empty">No orders yet</span>
            ) : (
              orders.slice(0, 5).map((order) => (
                <div key={order.id} className="user-menu__order">
                  <span>{order.rug_title}</span>
                  <em className={`order-status order-status--${order.status}`}>
                    {order.status}
                  </em>
                </div>
              ))
            )}
          </div>
          <div className="user-menu__divider" />
          <button className="user-menu__signout" onClick={signOut}>Sign out</button>
        </div>
      )}
    </div>
  );
}
