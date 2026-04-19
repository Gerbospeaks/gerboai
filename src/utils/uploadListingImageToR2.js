export const uploadListingImageToR2 = async (file, authUser) => {
  console.log("=== LISTING IMAGE UPLOAD DEBUG START ===");

  if (!authUser) {
    console.error("❌ No authUser");
    throw new Error("Not authenticated");
  }
  console.log("✅ Auth user exists");

  const apiUrl = process.env.REACT_APP_API_URL;
  console.log("🔍 API URL from env:", apiUrl);

  if (!apiUrl) {
    throw new Error("REACT_APP_API_URL is not defined in .env file");
  }

  const baseUrl = apiUrl.replace(/\/(upload-logo\/?)?$/, "");
  const uploadUrl = `${baseUrl}/upload-listing-image`;

  console.log("📤 Uploading to:", uploadUrl);

  try {
    const token = await authUser.getIdToken();
    console.log("✅ Got Firebase token:", token.substring(0, 20) + "...");

    console.log("📤 File info:", {
      name: file.name,
      type: file.type,
      size: file.size,
    });

    const res = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        "Content-Type": file.type,
        "Authorization": `Bearer ${token}`,
      },
      body: file,
    });

    console.log("📥 Response:", {
      status: res.status,
      ok: res.ok,
      statusText: res.statusText,
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("❌ Error response:", text);
      throw new Error(text || `Upload failed: ${res.status}`);
    }

    const data = await res.json();
    console.log("✅ Success! Public URL:", data.publicUrl);
    return data.publicUrl;

  } catch (fetchError) {
    console.error("❌ FETCH ERROR:", fetchError.message);
    throw fetchError;
  }
};

export default uploadListingImageToR2;