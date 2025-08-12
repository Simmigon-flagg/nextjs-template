export async function getUser(id) {
  const res = await fetch(`/api/users/${id}`);
  if (!res.ok) throw new Error("Failed to fetch user");
  return await res.json();
}

export async function updateUser(id, updatedData) {
  const res = await fetch(`/api/users/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedData),
  });
  if (!res.ok) throw new Error("Failed to update user");
  return await res.json();
}

export async function updateUserImage(id, file) {
  const formData = new FormData();
  formData.append("image", file);
  const res = await fetch(`/api/users/images/${id}`, {
    method: "PUT",
    body: formData,
  });
  if (!res.ok) throw new Error("Failed to update user image");
  return await res.json();
}
