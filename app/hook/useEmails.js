import { useEffect, useState } from 'react';

const API_URL = `http://localhost:3000/emails`;

export default function useEmails() {
  const [emails, setEmails] = useState([]);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    const fetchEmails = async () => {
      try {
        const response = await fetch(API_URL);
        if (!response.ok) throw Error('Error Retrieving data');
        const data = await response.json();
        setEmails(data);
        setFetchError(null);
      } catch (err) {
        setFetchError(err.message);
      }
    };
    fetchEmails();
  }, []);

  const updateEmail = async (id, updatedEmail) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedEmail),
      });

      if (!response.ok) throw new Error('Failed to update Favorite');
      const updated = await response.json();

      setEmails(prev =>
        prev.map(email =>
          email.id === id ? { ...email, fav: updated.fav } : email
        )
      );
      setFetchError(null);
    } catch (err) {
      setFetchError(err.message);
    }
  };

  return { emails, setEmails, fetchError, updateEmail };
}
