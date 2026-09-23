export const uploadLogoToR2 = async (file, authUser) => {
  if (!authUser) {
    throw new Error("Not authenticated");
  }

  const token = await authUser.getIdToken();

  console.log("Uploading to:", process.env.REACT_APP_API_URL);
  console.log("File type:", file.type);
  console.log("File size:", file.size);

  const res = await fetch(process.env.REACT_APP_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": file.type,
      "Authorization": `Bearer ${token}`,
    },
    body: file,
  });

  console.log("Response status:", res.status);
  console.log("Response ok:", res.ok);

  if (!res.ok) {
    const text = await res.text();
    console.error("Error response:", text);
    throw new Error(text || "Upload failed");
  }

  const { publicUrl } = await res.json();
  return publicUrl;
};

export default uploadLogoToR2;



