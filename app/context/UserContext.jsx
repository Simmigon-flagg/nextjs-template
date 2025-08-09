'use client';

import { createContext, useState, useEffect } from 'react';
import { useSession, signOut as nextAuthSignOut } from 'next-auth/react';

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
    const fetchUser = async () => {
      if (!session?.user?._id) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/users/${session.user._id}`);
        const data = await res.json();

        let imageUrl = null;
        if (data?.image?.buffer?.data) {
          const buffer = data.image.buffer.data;
          const base64 = Buffer.from(buffer).toString('base64');
          imageUrl = `data:${data.image.contentType};base64,${base64}`;
        }

        setUser({
          ...data,
          _id: session.user._id,
          image: imageUrl || '/avatar.png',
          name: data.name || 'Unknown User',
        });
      } catch (err) {
        console.error('Error fetching user:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [session?.user]);

  const updateImage = async (_id, updatedData) => {
    const formData = new FormData();
    if (updatedData.image instanceof File) formData.append("image", updatedData.image);

    try {
      const response = await fetch(`/api/users/images/${_id}`, {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) throw new Error("User update failed");

      const data = await response.json();
     
      if (data?.user && data?.imagefileUrl) {
        setUser({
          ...data.user,
          imagefileUrl: data.imagefileUrl,
        });
      }
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const update = async (_id, updatedData) => {

    try {
      const response = await fetch(`/api/users/${_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        throw new Error("Failed to update user");
      }

      const data = await response.json();
     
      return data; // expected to contain { user: {...} }
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
