# Upload showcase video to Firebase and add to Firestore

$VideoPath = "./showcase-video.mov"
$ProjectID = "gardinary-30c14"
$Bucket = "gardinary-30c14.firebasestorage.app"
$ApiKey = "AIzaSyA2Gv6a7ICpzyNRw6X3GpLpSqJ-YNfXDZM"

if (-not (Test-Path $VideoPath)) {
    Write-Host "❌ Video file not found at $VideoPath" -ForegroundColor Red
    exit 1
}

Write-Host "📤 Installing Firebase packages..." -ForegroundColor Cyan
npm install firebase > $null 2>&1

Write-Host "📤 Uploading video to Firebase..." -ForegroundColor Cyan

$NodeScript = @"
import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { readFileSync } from 'fs';

const firebaseConfig = {
  apiKey: "$ApiKey",
  authDomain: "gardinary-30c14.firebaseapp.com",
  projectId: "$ProjectID",
  storageBucket: "$Bucket",
  messagingSenderId: "572997151790",
  appId: "1:572997151790:web:eb360b48391bba145d83bf"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const db = getFirestore(app);

async function uploadVideo() {
  try {
    console.log('📤 Reading video file...');
    const videoBuffer = readFileSync('$VideoPath');
    
    console.log('📤 Uploading to Firebase Storage...');
    const videoRef = ref(storage, `showcase/videos/\${Date.now()}-video.mov`);
    await uploadBytes(videoRef, videoBuffer);
    
    const downloadURL = await getDownloadURL(videoRef);
    console.log('✅ Video uploaded!');
    
    console.log('📝 Adding to Firestore...');
    await addDoc(collection(db, 'showcase'), {
      type: 'video',
      videoUrl: downloadURL,
      imageUrl: null,
      createdAt: new Date()
    });
    
    console.log('✅ Video added to showcase!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

uploadVideo();
"@

$NodeScript | Out-File -FilePath "upload-temp.js" -Encoding UTF8
node upload-temp.js
Remove-Item "upload-temp.js"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Video successfully added to showcase!" -ForegroundColor Green
} else {
    Write-Host "❌ Upload failed" -ForegroundColor Red
}
