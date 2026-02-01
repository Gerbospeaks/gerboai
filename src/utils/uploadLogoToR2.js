export const uploadLogoToR2 = async (file, authUser) => {
  if (!authUser) {
    throw new Error("Not authenticated");
  }

  const token = await authUser.getIdToken();

  const res = await fetch(process.env.REACT_APP_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": file.type,
      "Authorization": `Bearer ${token}`,
    },
    body: file,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Upload failed");
  }

  const { publicUrl } = await res.json();
  return publicUrl;
};

export default uploadLogoToR2;



