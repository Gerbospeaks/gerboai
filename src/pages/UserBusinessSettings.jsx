// UserBusinessSettings.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Upload } from "lucide-react";

const UserBusinessSettings = () => {
  const { user } = useAuth();
  const [businessInfo, setBusinessInfo] = useState({
    businessName: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    postalCode: "",
    primaryPhone: "",
    secondaryPhone: "",
    logoUrl: "", // Add logo URL
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user?.uid) {
      loadBusinessInfo();
    }
  }, [user]);

  const loadBusinessInfo = async () => {
    try {
      const db = getFirestore();
      const docRef = doc(db, "users", user.uid, "settings", "businessInfo");
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setBusinessInfo(docSnap.data());
      }
    } catch (error) {
      console.error("Error loading business info:", error);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !user?.uid) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      const storage = getStorage();
      const storageRef = ref(storage, `users/${user.uid}/logo/${file.name}`);
      
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      
      setBusinessInfo({...businessInfo, logoUrl: downloadURL});
      alert('Logo uploaded successfully!');
    } catch (error) {
      console.error("Error uploading logo:", error);
      alert("Failed to upload logo");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user?.uid) return;
    
    setLoading(true);
    try {
      const db = getFirestore();
      const docRef = doc(db, "users", user.uid, "settings", "businessInfo");
      await setDoc(docRef, businessInfo);
      alert("Business information saved successfully!");
    } catch (error) {
      console.error("Error saving business info:", error);
      alert("Failed to save business information");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Business Information</h2>
      
      <div className="space-y-4">
        {/* Logo Upload Section */}
        <div>
          <label className="block text-sm font-medium mb-2">Business Logo</label>
          <div className="flex items-center gap-4">
            {businessInfo.logoUrl ? (
              <img 
                src={businessInfo.logoUrl} 
                alt="Business Logo" 
                className="w-24 h-24 object-contain border rounded-lg"
              />
            ) : (
              <div className="w-24 h-24 border-2 border-dashed rounded-lg flex items-center justify-center bg-gray-50">
                <Upload className="w-8 h-8 text-gray-400" />
              </div>
            )}
            
            <div className="flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                disabled={uploading}
                className="hidden"
                id="logo-upload"
              />
              <label
                htmlFor="logo-upload"
                className="inline-block px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 cursor-pointer disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : businessInfo.logoUrl ? 'Change Logo' : 'Upload Logo'}
              </label>
              <p className="text-xs text-gray-500 mt-2">
                Recommended: Square image, max 5MB
              </p>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Business Name</label>
          <input
            type="text"
            value={businessInfo.businessName}
            onChange={(e) => setBusinessInfo({...businessInfo, businessName: e.target.value})}
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="V8 Powered Auto Service"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Address Line 1</label>
          <input
            type="text"
            value={businessInfo.addressLine1}
            onChange={(e) => setBusinessInfo({...businessInfo, addressLine1: e.target.value})}
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="9-10 CNR THIRD & ARKWRIGHT AVENUE"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Address Line 2</label>
          <input
            type="text"
            value={businessInfo.addressLine2}
            onChange={(e) => setBusinessInfo({...businessInfo, addressLine2: e.target.value})}
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="WYNBERG"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">City</label>
            <input
              type="text"
              value={businessInfo.city}
              onChange={(e) => setBusinessInfo({...businessInfo, city: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="SANDTON"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Postal Code</label>
            <input
              type="text"
              value={businessInfo.postalCode}
              onChange={(e) => setBusinessInfo({...businessInfo, postalCode: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="2090"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Primary Phone *</label>
          <input
            type="tel"
            value={businessInfo.primaryPhone}
            onChange={(e) => setBusinessInfo({...businessInfo, primaryPhone: e.target.value})}
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="082 514 4509"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Secondary Phone (Optional)</label>
          <input
            type="tel"
            value={businessInfo.secondaryPhone}
            onChange={(e) => setBusinessInfo({...businessInfo, secondaryPhone: e.target.value})}
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="084 583 9929"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Business Information"}
        </button>
      </div>
    </div>
  );
};

export default UserBusinessSettings;