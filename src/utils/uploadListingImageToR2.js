export const uploadListingImageToR2 = async (file, authUser) => {
  if (!authUser) throw new Error("Not authenticated");

  const apiUrl = process.env.REACT_APP_API_URL;
  if (!apiUrl) throw new Error("REACT_APP_API_URL is not defined");

  // ✅ Use URL parser — always gets the clean base regardless of
  // what path REACT_APP_API_URL has (/, /upload-logo, nothing, etc.)
  const baseUrl = new URL(apiUrl).origin;
  const uploadUrl = `${baseUrl}/upload-listing-image`;

  console.log("📤 Listing image uploading to:", uploadUrl);

  try {
    const token = await authUser.getIdToken();

    const res = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        "Content-Type": file.type,
        "Authorization": `Bearer ${token}`,
      },
      body: file,
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("❌ Error:", text);
      throw new Error(text || `Upload failed: ${res.status}`);
    }

    const { publicUrl } = await res.json();
    console.log("✅ Listing image URL:", publicUrl);
    return publicUrl;

  } catch (err) {
    console.error("❌ Upload error:", err.message);
    throw err;
  }
};

export default uploadListingImageToR2;