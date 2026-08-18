/**
 * Canvas Landmark & Face Mesh Renderer
 */

export function renderLandmarksOnCanvas(canvas, landmarks) {
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;

  // Clear previous drawings
  ctx.clearRect(0, 0, width, height);

  if (!landmarks) return;

  const { leftEye, rightEye, noseTip, mouthLeft, mouthRight, mouthCenter, chin, leftCheek, rightCheek, faceBox } = landmarks;

  // 1. Draw Face Bounding Box with rounded corners and glowing border
  ctx.strokeStyle = '#E056FD';
  ctx.lineWidth = 3;
  ctx.setLineDash([8, 6]);
  ctx.strokeRect(faceBox.x, faceBox.y, faceBox.width, faceBox.height);
  ctx.setLineDash([]); // Reset dash

  // 2. Draw Central Vertical Symmetry Axis Line
  const centerX = faceBox.x + faceBox.width / 2;
  ctx.strokeStyle = 'rgba(34, 211, 238, 0.6)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(centerX, faceBox.y);
  ctx.lineTo(centerX, faceBox.y + faceBox.height);
  ctx.stroke();

  // 3. Draw Eye Alignment Horizontal Axis Line
  ctx.strokeStyle = 'rgba(104, 109, 224, 0.6)';
  ctx.beginPath();
  ctx.moveTo(leftEye.x - 20, leftEye.y);
  ctx.lineTo(rightEye.x + 20, rightEye.y);
  ctx.stroke();

  // 4. Draw Facial Mesh Triangles / Lines
  ctx.strokeStyle = 'rgba(224, 86, 253, 0.4)';
  ctx.lineWidth = 1;

  // Left eye to nose & cheek
  ctx.beginPath();
  ctx.moveTo(leftEye.x, leftEye.y);
  ctx.lineTo(noseTip.x, noseTip.y);
  ctx.lineTo(leftCheek.x, leftCheek.y);
  ctx.closePath();
  ctx.stroke();

  // Right eye to nose & cheek
  ctx.beginPath();
  ctx.moveTo(rightEye.x, rightEye.y);
  ctx.lineTo(noseTip.x, noseTip.y);
  ctx.lineTo(rightCheek.x, rightCheek.y);
  ctx.closePath();
  ctx.stroke();

  // Nose to mouth & chin
  ctx.beginPath();
  ctx.moveTo(noseTip.x, noseTip.y);
  ctx.lineTo(mouthLeft.x, mouthLeft.y);
  ctx.lineTo(chin.x, chin.y);
  ctx.lineTo(mouthRight.x, mouthRight.y);
  ctx.closePath();
  ctx.stroke();

  // 5. Draw Landmark Points (Glowing Circles)
  const points = [
    { pt: leftEye, color: '#22D3EE', r: 5 },
    { pt: rightEye, color: '#22D3EE', r: 5 },
    { pt: noseTip, color: '#E056FD', r: 6 },
    { pt: mouthLeft, color: '#10B981', r: 4 },
    { pt: mouthRight, color: '#10B981', r: 4 },
    { pt: mouthCenter, color: '#10B981', r: 4 },
    { pt: chin, color: '#F59E0B', r: 4 },
    { pt: leftCheek, color: '#686DE0', r: 4 },
    { pt: rightCheek, color: '#686DE0', r: 4 }
  ];

  points.forEach(({ pt, color, r }) => {
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0; // reset shadow
  });
}
