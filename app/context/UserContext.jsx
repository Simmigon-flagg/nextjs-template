'use client';

import { createContext, useState, useEffect } from 'react';
import { useSession, signOut as nextAuthSignOut } from 'next-auth/react';
import { getUser, updateUser, updateUserImage } from '../../services/ui/users';

export const UsersContext = createContext({});

const UsersContextProvider = ({ children }) => {
  const { data: session } = useSession();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) {
      setUser(null);
    }
  }, [session]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!session?.user?._id) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const data = await getUser(session.user._id);

        let imageUrl = null;
        if (data?.image?.buffer?.data) {
          const buffer = data.image.buffer.data;
          const base64 = Buffer.from(buffer).toString('base64');
          imageUrl = `data:${data.image.contentType};base64,${base64}`;
        }

        setUser({
          ...data,
          _id: session.user._id,
          image: imageUrl || '/profile-placeholder.jpg',
          name: data.name || 'Unknown User',
        });
      } catch (err) {
        console.error('Error fetching user:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [session?.user]);

  const updateImage = async (_id, updatedData) => {
    try {
      if (updatedData.image instanceof File) {
        const data = await updateUserImage(_id, updatedData.image);
        if (data?.user && data?.imagefileUrl) {
          setUser({
            ...data.user,
            imagefileUrl: data.imagefileUrl,
          });
        }
      }
    } catch (error) {
      console.error("Error updating user image:", error);
    }
  };

  const update = async (_id, updatedData) => {
    try {
      const data = await updateUser(_id, updatedData);
      return data;
    } catch (error) {
      console.error("Error updating user:", error);
      return null;
    }
  };

  const signOutUser = async () => {
    setUser(null);
    setLoading(true);
    await nextAuthSignOut({ callbackUrl: '/' });
  };

  return (
    <UsersContext.Provider value={{ user, loading, update, setUser, updateImage, signOutUser }}>
      {children}
    </UsersContext.Provider>
  );
};

export default UsersContextProvider;
