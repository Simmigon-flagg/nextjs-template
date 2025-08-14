'use client';

import { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { TodoContext } from '@/app/context/TodoContext';

const CreateTodoPage = () => {
  const router = useRouter();
  const { createTodo } = useContext(TodoContext);

  const [formData, setFormData] = useState({
    title: '',
    notes: '',
    completed: false,
    fav: false,
    file: null,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [previewURL, setPreviewURL] = useState(null);

  useEffect(() => {
    return () => {
      if (previewURL) {
        URL.revokeObjectURL(previewURL);
      }
    };
  }, [previewURL]);

  const handleChange = ({ target: { name, value } }) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = event => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadedFile(file);
    setPreviewURL(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      return;
    }
    setIsSaving(true);

    try {
      const payload = new FormData();
      payload.append('title', formData.title);
      payload.append('notes', formData.notes);
      if (uploadedFile) {
        payload.append('file', uploadedFile);
      }

      await createTodo(payload);

      router.back();
    } catch (error) {
      console.error('Failed to create todo', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="min-h-screen bg-gradient-to-b from-white to-gray-100 py-20 px-6 text-black">
      <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="p-8 space-y-6">
          <div className="flex justify-between items-center border-b pb-2">
            <h3 className="text-xl font-semibold text-gray-800">Create Todo</h3>
          </div>

          <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="title"
                className="block text-gray-600 text-sm mb-1"
              >
                Title <span className="text-red-600">*</span>
              </label>
              <input
                id="title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Enter title"
              />
            </div>

            <div>
              <label
                htmlFor="notes"
                className="block text-gray-600 text-sm mb-1"
              >
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Additional notes"
              />
            </div>
          </form>

          <div className="pt-6 flex justify-between items-center flex-wrap gap-2">
            {/* Left side: Back */}
            <div className="flex gap-2">
              <button
                onClick={() => router.back()}
                className="px-4 py-1.5 text-sm bg-gray-200 text-gray-800 rounded shadow hover:bg-gray-300 transition"
              >
                Back
              </button>
            </div>

            {/* Right side: Upload */}
            <div>
              <button
                onClick={() => document.getElementById('file-upload').click()}
                className="px-4 py-1.5 text-sm bg-green-600 text-white rounded shadow hover:bg-green-700 transition"
              >
                Upload File
              </button>
              <input
                id="file-upload"
                type="file"
                accept="image/*,.pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />
            </div>
          </div>

          {previewURL && uploadedFile && (
            <div className="mt-4 space-y-2">
              <p className="text-sm font-medium text-gray-800">
                Selected File:{' '}
                <span className="text-gray-600">{uploadedFile.name}</span>
              </p>

              {uploadedFile.type.startsWith('image/') ? (
                <Image
                  width={200}
                  height={200}
                  src={previewURL}
                  alt="Preview"
                  className="max-w-xs rounded shadow border-2 border-green-700"
                />
              ) : uploadedFile.type === 'application/pdf' ? (
                <iframe
                  src={previewURL}
                  className="w-full h-96 border-2 border-green-700 rounded"
                />
              ) : (
                <a
                  href={previewURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  {uploadedFile.name}
                </a>
              )}
            </div>
          )}

          <div className="flex justify-end pt-6">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
            >
              {isSaving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CreateTodoPage;
