'use client';

import { createContext, useState, useEffect } from 'react';
import {
  useSession,
  signIn,
  signOut as nextAuthSignOut,
} from 'next-auth/react';
import {
  getUser,
  updateUser,
  updateUserImage,
  fetchSessionAndSetRefreshCookie,
  forgotPassword as forgotPasswordService,
  resetPassword as resetPasswordService,
  signup as signupService,
} from '../../services/ui/users';

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
      console.error('Error updating user image:', error);
    }
  };

  const update = async (_id, updatedData) => {
    try {
      const data = await updateUser(_id, updatedData);
      return data;
    } catch (error) {
      console.error('Error updating user:', error);
      return null;
    }
  };

  const signOutUser = async () => {
    setUser(null);
    setLoading(true);
    await nextAuthSignOut({ callbackUrl: '/' });
  };

  const signup = async user => {
    try {
      return await signupService(user);
    } catch (error) {
      throw error;
    }
  };

  const resetPassword = async (token, newPassword) => {
    try {
      return await resetPasswordService(token, newPassword);
    } catch (error) {
      throw error;
    }
  };

  const login = async (email, password) => {
    const response = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (response.error) {
      throw new Error(response.error);
    }

    await fetchSessionAndSetRefreshCookie();

    return true;
  };

  const forgotPassword = async email => {
    try {
      await forgotPasswordService(email);
      return true;
    } catch (error) {
      throw error;
    }
  };

  return (
    <UsersContext.Provider
      value={{
        user,
        loading,
        update,
        setUser,
        updateImage,
        signOutUser,
        resetPassword,
        signup,
        login,
        forgotPassword,
      }}
    >
      {children}
    </UsersContext.Provider>
  );
};

export default UsersContextProvider;
