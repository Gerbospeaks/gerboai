import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// Initialize R2 client
const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.REACT_APP_CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.REACT_APP_CLOUDFLARE_ACCESS_KEY_ID,
    secretAccessKey: process.env.REACT_APP_CLOUDFLARE_SECRET_ACCESS_KEY,
  },
});

export const uploadLogoToR2 = async (file, userId) => {
  try {
    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `logos/${userId}/${timestamp}.${fileExtension}`;

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to R2
    const command = new PutObjectCommand({
      Bucket: process.env.REACT_APP_CLOUDFLARE_R2_BUCKET_NAME,
      Key: fileName,
      Body: buffer,
      ContentType: file.type,
    });

    await r2Client.send(command);

    // Return public URL
    const publicUrl = `https://${process.env.REACT_APP_CLOUDFLARE_R2_PUBLIC_DOMAIN}/${fileName}`;
    return publicUrl;
  } catch (error) {
    console.error('Error uploading to R2:', error);
    throw error;
  }
};