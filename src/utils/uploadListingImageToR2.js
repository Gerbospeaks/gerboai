import { getAuth } from "firebase/auth";

const WORKER_URL = import.meta.env.VITE_WORKER_URL; // same worker, new route

export async function uploadListingImageToR2(file, authUser) {
  if (!authUser) throw new Error("Not authenticated");

  const idToken = await authUser.getIdToken();

  const response = await fetch(`${WORKER_URL}/upload-listing-image`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${idToken}`,
      "Content-Type": file.type,
    },
    body: file,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Upload failed: ${response.status}`);
  }

  const { publicUrl } = await response.json();
  return publicUrl;
}