export const uploadLogoToR2 = async (file, authUser) => {
  console.log("=== UPLOAD DEBUG START ===");
  
  if (!authUser) {
    console.error("❌ No authUser");
    throw new Error("Not authenticated");
  }
  console.log("✅ Auth user exists");

  const apiUrl = process.env.REACT_APP_API_URL;
  console.log("🔍 API URL from env:", apiUrl);
  console.log("🔍 All env vars:", process.env);
  
  if (!apiUrl) {
    throw new Error("REACT_APP_API_URL is not defined in .env file");
  }

  try {
    const token = await authUser.getIdToken();
    console.log("✅ Got Firebase token (first 20 chars):", token.substring(0, 20) + "...");
    
    console.log("📤 File info:", {
      name: file.name,
      type: file.type,
      size: file.size
    });

    console.log("📤 Sending POST to:", apiUrl);

    const res = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": file.type,
        "Authorization": `Bearer ${token}`,
      },
      body: file,
    });

    console.log("📥 Response received:", {
      status: res.status,
      ok: res.ok,
      statusText: res.statusText
    });
    
    if (!res.ok) {
      const text = await res.text();
      console.error("❌ Error response body:", text);
      throw new Error(text || "Upload failed");
    }

    const data = await res.json();
    console.log("✅ Success! Public URL:", data.publicUrl);
    return data.publicUrl;
    
  } catch (fetchError) {
    console.error("❌ FETCH ERROR:", fetchError);
    console.error("Error name:", fetchError.name);
    console.error("Error message:", fetchError.message);
    throw fetchError;
  }
};

export default uploadLogoToR2;



