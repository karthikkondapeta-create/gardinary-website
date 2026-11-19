import fs from 'fs';
import path from 'path';
import https from 'https';

const PROJECT_ID = 'gardinary-30c14';
const BUCKET = 'gardinary-30c14';
const API_KEY = 'AIzaSyA2Gv6a7ICpzyNRw6X3GpLpSqJ-YNfXDZM';

function uploadToStorage(videoBuffer) {
  return new Promise((resolve, reject) => {
    const timestamp = Date.now();
    const storagePath = `showcase/videos/${timestamp}-video.mov`;
    
    const options = {
      hostname: 'storage.googleapis.com',
      path: `/upload/storage/v1/b/${BUCKET}/o?uploadType=media&name=${encodeURIComponent(storagePath)}&key=${API_KEY}`,
      method: 'POST',
      headers: {
        'Content-Type': 'video/quicktime',
        'Content-Length': videoBuffer.length
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.name) {
            const downloadUrl = `https://firebasestorage.googleapis.com/v0/b/${BUCKET}.appspot.com/o/${encodeURIComponent(storagePath)}?alt=media`;
            resolve({ url: downloadUrl, storagePath });
          } else {
            reject(new Error(`Upload failed: ${JSON.stringify(json)}`));
          }
        } catch (e) {
          reject(new Error(`Parse error: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(videoBuffer);
    req.end();
  });
}

function addToFirestore(videoUrl) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      fields: {
        type: { stringValue: 'video' },
        videoUrl: { stringValue: videoUrl },
        imageUrl: { nullValue: true },
        createdAt: { timestampValue: new Date().toISOString() }
      }
    });

    const options = {
      hostname: 'firestore.googleapis.com',
      path: `/v1/projects/${PROJECT_ID}/databases/(default)/documents/showcase?key=${API_KEY}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve();
        } else {
          reject(new Error(`Firestore error: ${responseData}`));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function uploadVideo() {
  try {
    const videoPath = path.join(process.cwd(), 'showcase-video.mov');
    
    if (!fs.existsSync(videoPath)) {
      console.error('❌ Video file not found');
      process.exit(1);
    }

    console.log('📤 Reading video file...');
    const videoBuffer = fs.readFileSync(videoPath);
    console.log(`✓ Video size: ${(videoBuffer.length / 1024 / 1024).toFixed(2)}MB`);
    
    console.log('📤 Uploading to Firebase Storage...');
    const { url } = await uploadToStorage(videoBuffer);
    console.log('✅ Video uploaded!');
    
    console.log('📝 Adding to Firestore...');
    await addToFirestore(url);
    console.log('✅ Video added to showcase!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

uploadVideo();
