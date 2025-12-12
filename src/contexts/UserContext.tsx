import { createContext, useState, useContext, type ReactNode } from 'react';
import { ObjectId } from 'bson';
import { db } from '../db'; // 1. Import the DB
import type { User } from '../types/models';

interface UserContextType {
  userId: string | null;
  username: string | null;
  createLocalProfile: (name: string) => Promise<void>; // Made async
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [userId, setUserId] = useState<string | null>(() => {
    return localStorage.getItem('userId');
  });

  const [username, setUsername] = useState<string | null>(() => {
    return localStorage.getItem('username');
  });

  const createLocalProfile = async (name: string) => {
    const newId = new ObjectId().toString();
    
    // Save to LocalStorage
    localStorage.setItem('userId', newId);
    localStorage.setItem('username', name);

    // Update React
    setUserId(newId);
    setUsername(name);

    // Backup to DB
    const userBackup: User = {
      _id: "local-user-id",
      username: name,
      email: "",
      avatarUrl: "",
    };

    try {
      // Clear any old backups and save the new one
      await db.profile.clear();
      await db.profile.add(userBackup);
      console.log("Local profile backed up to db");
    } catch (error) {
      console.error("Failed to backup profile:", error);
    }
  };

  return (
    <UserContext.Provider value={{ userId, username, createLocalProfile }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within a UserProvider');
  return context;
};