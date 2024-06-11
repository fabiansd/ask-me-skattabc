'use client'
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { users } from '@prisma/client'; // Import the User type from Prisma

interface UserContextType {
  user: users | null;
  setUser: (user: users | null) => void;
  createUser: (username: string) => Promise<void>;
  getUser: (id: number) => Promise<void>;
}

const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
  createUser: async () => {},
  getUser: async () => {},
});

interface UserProviderProps {
    children: ReactNode;
  }

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<users | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const saveUser = (user: users | null) => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
    setUser(user);
  };

  const createUser = async (username: string) => {
    try {
      const response = await fetch('/api/postgres/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const user = await response.json();
      saveUser(user);
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  };

  const getUser = async (id: number) => {
    try {
      const response = await fetch(`/api/postgres/user?id=${id}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const user = await response.json();
      saveUser(user);
    } catch (error) {
      console.error('Error retrieving user:', error);
      throw error;
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser: saveUser, createUser, getUser }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;
