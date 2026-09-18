// src/utils/uploadLogoToR2.js
//
// Ported from web: utils/uploadLogoToR2.js
//
// Key differences from the web version:
// 1. There's no browser `File` object in RN. The caller (see
//    BusinessSettingsModal.js) passes { uri, mimeType, name } from
//    expo-image-picker instead. We turn that local `uri` into a Blob via
//    fetch(), which Expo's fetch polyfill supports for local file:// / ph://
//    / content:// URIs, then POST it as raw binary — same as the web
//    version's `body: file`.
// 2. CRA's `process.env.REACT_APP_*` doesn't exist in Expo. Expo inlines
//    `process.env.EXPO_PUBLIC_*` vars at build time instead, so the API URL
//    should live in your project's .env as `EXPO_PUBLIC_API_URL=...`.
// 3. Swapped console.log debug spam for a single DEBUG flag so you can dial
//    verbosity up/down without deleting log lines.

const DEBUG = typeof __DEV__ !== "undefined" && __DEV__;

const log = (...args) => {
  if (DEBUG) console.log(...args);
};

export const uploadLogoToR2 = async (file, authUser) => {
  log("=== UPLOAD DEBUG START ===");

  if (!authUser) {
    console.error("❌ No authUser");
    throw new Error("Not authenticated");
  }
  log("✅ Auth user exists");

  const apiUrl = process.env.EXPO_PUBLIC_API_URL;
  log("🔍 API URL from env:", apiUrl);

  if (!apiUrl) {
    throw new Error("EXPO_PUBLIC_API_URL is not defined in .env file");
  }

  if (!file?.uri) {
    console.error("❌ No file.uri provided");
    throw new Error("No file to upload");
  }

  const mimeType = file.mimeType || file.type || "application/octet-stream";
  const name = file.name || file.fileName || `logo-${Date.now()}.jpg`;

  try {
    const token = await authUser.getIdToken();
    log("✅ Got Firebase token (first 20 chars):", token.substring(0, 20) + "...");

    log("📤 File info:", { uri: file.uri, name, type: mimeType });

    // Turn the local file uri into a Blob so we can send raw binary,
    // matching the web version's `body: file`.
    const fileResponse = await fetch(file.uri);
    const blob = await fileResponse.blob();

    log("📤 Sending POST to:", apiUrl);

    const res = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": mimeType,
        Authorization: `Bearer ${token}`,
      },
      body: blob,
    });

    log("📥 Response received:", {
      status: res.status,
      ok: res.ok,
      statusText: res.statusText,
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("❌ Error response body:", text);
      throw new Error(text || "Upload failed");
    }

    const data = await res.json();
    log("✅ Success! Public URL:", data.publicUrl);
    return data.publicUrl;
  } catch (fetchError) {
    console.error("❌ FETCH ERROR:", fetchError);
    console.error("Error name:", fetchError.name);
    console.error("Error message:", fetchError.message);
    throw fetchError;
  }
};

export default uploadLogoToR2;



