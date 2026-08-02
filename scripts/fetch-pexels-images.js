// One-off script to grab the landing page hero photos from Pexels — not run by the app itself
// needs PEXELS_API_KEY in .env, get a free key at https://www.pexels.com/api/
// usage: node scripts/fetch-pexels-images.js

require("dotenv").config();
const fs = require("fs");
const path = require("path");

const KEY = process.env.PEXELS_API_KEY;
if (!KEY) {
  console.error("Missing PEXELS_API_KEY in .env — get a free key at https://www.pexels.com/api/");
  process.exit(1);
}

// picked from a Pexels search for students studying/collaborating in a library
const IMAGES = [
  {
    id: 16420473,
    crop: "w=1920&h=1080",
    out: "hero-students-library.jpg",
  },
  {
    id: 35362880,
    crop: "w=900&h=600",
    out: "hero-students-collaborating.jpg",
  },
];

const outDir = path.join(__dirname, "..", "public", "images");

(async () => {
  fs.mkdirSync(outDir, { recursive: true });

  for (const img of IMAGES) {
    const url = `https://images.pexels.com/photos/${img.id}/pexels-photo-${img.id}.jpeg?auto=compress&cs=tinysrgb&fit=crop&${img.crop}`;
    const res = await fetch(url, { headers: { Authorization: KEY } });
    if (!res.ok) {
      console.error(`Failed to fetch photo ${img.id}: ${res.status} ${res.statusText}`);
      continue;
    }
    const buffer = Buffer.from(await res.arrayBuffer());
    const outPath = path.join(outDir, img.out);
    fs.writeFileSync(outPath, buffer);
    console.log(`Saved ${img.out} (${buffer.length} bytes)`);
  }
})();
