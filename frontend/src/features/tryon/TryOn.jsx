// import { useEffect, useRef, useState, useCallback } from "react";
// import { useSearchParams, useNavigate } from "react-router-dom";

// const AI_URL = "http://localhost:5001";
// const LANDMARK_INTERVAL = 100;   // ms between landmark fetches
// const CAPTURE_WIDTH = 320;       // send a smaller frame to the backend — plenty for landmarks

// export default function TryOn() {
//   const [searchParams] = useSearchParams();
//   const navigate = useNavigate();

//   const productImage = searchParams.get("image");
//   const productName = searchParams.get("name");

//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);

//   // Offscreen canvas used ONLY for capturing frames to send to the backend
//   // We draw the raw (un-mirrored) video here so landmark coords are in camera space
//   const captureCanvasRef = useRef(document.createElement("canvas"));

//   const glassesImgRef = useRef(null);
//   const streamRef = useRef(null);
//   const rafRef = useRef(null);          // requestAnimationFrame handle
//   const landmarkTimerRef = useRef(null);
//   const processingRef = useRef(false);

//   // Last known landmarks — persisted across frames so glasses never disappear
//   const lastLandmarksRef = useRef(null);

//   const [status, setStatus] = useState("Starting camera...");
//   const [faceDetected, setFaceDetected] = useState(false);
//   const [glassesLoaded, setGlassesLoaded] = useState(false);
//   const [cameraReady, setCameraReady] = useState(false);

//   // ── Load glasses image ──────────────────────────────────────────────────────
//   useEffect(() => {
//     if (!productImage) return;
//     const img = new Image();
//     img.crossOrigin = "anonymous";
//     img.src = productImage.startsWith("http")
//       ? productImage
//       : `http://localhost:3000${productImage}`;
//     img.onload = () => { glassesImgRef.current = img; setGlassesLoaded(true); };
//     img.onerror = () => setGlassesLoaded(true);
//   }, [productImage]);

//   // ── Start camera ────────────────────────────────────────────────────────────
//   useEffect(() => {
//     startCamera();
//     return () => stopAll();
//   }, []);

//   async function startCamera() {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({
//         video: { width: 640, height: 480, facingMode: "user" },
//       });
//       streamRef.current = stream;
//       if (videoRef.current) {
//         videoRef.current.srcObject = stream;
//         await videoRef.current.play();
//         setCameraReady(true);
//         setStatus("Face the camera");
//       }
//     } catch (err) {
//       console.error("Camera error:", err);
//       setStatus("Camera access denied — please allow camera access in browser settings");
//     }
//   }

//   function stopAll() {
//     cancelAnimationFrame(rafRef.current);
//     clearInterval(landmarkTimerRef.current);
//     if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
//   }

//   // ── Draw glasses overlay onto the display canvas ────────────────────────────
//   // landmarks are in camera (un-mirrored) space.
//   // The display canvas IS mirrored (CSS or ctx transform), so we mirror the X coords here.
//   const drawOverlay = useCallback((ctx, landmarks, canvasW, canvasH) => {
//     const { left_eye, right_eye, image_width, image_height } = landmarks;
//     if (!image_width || !image_height) return;

//     const scaleX = canvasW / image_width;
//     const scaleY = canvasH / image_height;

//     // Camera gives us left_eye = person's left (appears on the right of a mirror).
//     // The canvas is already drawn mirrored, so mirror the X coords:
//     //   mirroredX = canvasW - (originalX * scaleX)
//     const leftX  = canvasW - left_eye.x  * scaleX;  // person's left eye → appears right in mirror
//     const rightX = canvasW - right_eye.x * scaleX;  // person's right eye → appears left in mirror
//     const leftY  = left_eye.y  * scaleY;
//     const rightY = right_eye.y * scaleY;

//     // rightX < leftX after mirroring, so swap for width calc
//     const eyeCenterX = (leftX + rightX) / 2;
//     const eyeCenterY = (leftY + rightY) / 2;
//     const eyeDistance = Math.abs(leftX - rightX);

//     const glassesW = eyeDistance * 2.4;
//     const glassesH = glassesW * 0.38;

//     // Tilt angle — atan2 expects (dy, dx) from left point to right point in display space
//     // After mirroring, rightX is to the LEFT visually, so use leftX→rightX direction
//     const angle = Math.atan2(rightY - leftY, rightX - leftX);

//     ctx.save();
//     ctx.translate(eyeCenterX, eyeCenterY - glassesH * 0.1);
//     ctx.rotate(angle);

//     if (glassesImgRef.current) {
//       // The display canvas is drawn with ctx.scale(-1,1) for the mirror effect.
//       // That flips X but also inverts the coordinate system for our overlay,
//       // causing the glasses image to render upside-down. Flip Y here to correct it.
//       ctx.scale(1, -1);
//       ctx.drawImage(
//         glassesImgRef.current,
//         -glassesW / 2,
//         -glassesH / 2,
//         glassesW,
//         glassesH
//       );
//       ctx.scale(1, -1); // restore
//     } else {
//       // Fallback wireframe glasses
//       const lensR = eyeDistance * 0.5;
//       ctx.strokeStyle = "rgba(0,0,0,0.85)";
//       ctx.lineWidth = 3;
//       ctx.beginPath();
//       ctx.ellipse(-eyeDistance * 0.5, 0, lensR, lensR * 0.65, 0, 0, Math.PI * 2);
//       ctx.stroke();
//       ctx.beginPath();
//       ctx.ellipse(eyeDistance * 0.5, 0, lensR, lensR * 0.65, 0, 0, Math.PI * 2);
//       ctx.stroke();
//       ctx.beginPath();
//       ctx.moveTo(-eyeDistance * 0.5 + lensR, 0);
//       ctx.lineTo(eyeDistance * 0.5 - lensR, 0);
//       ctx.stroke();
//     }
//     ctx.restore();
//   }, []);

//   // ── Render loop — runs every animation frame, never waits for the network ──
//   const renderLoop = useCallback(() => {
//     const video = videoRef.current;
//     const canvas = canvasRef.current;
//     if (!video || !canvas) { rafRef.current = requestAnimationFrame(renderLoop); return; }

//     const ctx = canvas.getContext("2d");
//     if (!ctx) { rafRef.current = requestAnimationFrame(renderLoop); return; }

//     if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
//       canvas.width = video.videoWidth;
//       canvas.height = video.videoHeight;
//     }

//     // Draw mirrored video
//     ctx.save();
//     ctx.scale(-1, 1);
//     ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
//     ctx.restore();

//     // Always overlay the last known landmarks — no flickering
//     if (lastLandmarksRef.current) {
//       drawOverlay(ctx, lastLandmarksRef.current, canvas.width, canvas.height);
//     }

//     rafRef.current = requestAnimationFrame(renderLoop);
//   }, [drawOverlay]);

//   // ── Landmark fetch — runs every LANDMARK_INTERVAL ms independently ──────────
//   const fetchLandmarks = useCallback(async () => {
//     if (processingRef.current) return;
//     const video = videoRef.current;
//     if (!video || video.readyState < 2) return;

//     processingRef.current = true;

//     try {
//       // Capture a downscaled un-mirrored frame — smaller = faster network + backend
//       const cap = captureCanvasRef.current;
//       const scale = CAPTURE_WIDTH / video.videoWidth;
//       cap.width = CAPTURE_WIDTH;
//       cap.height = Math.round(video.videoHeight * scale);
//       const capCtx = cap.getContext("2d");
//       capCtx.drawImage(video, 0, 0, cap.width, cap.height); // no mirroring

//       const blob = await new Promise((resolve) => cap.toBlob(resolve, "image/jpeg", 0.6));
//       if (!blob) { processingRef.current = false; return; }

//       const form = new FormData();
//       form.append("file", blob, "frame.jpg");

//       const res = await fetch(`${AI_URL}/landmarks`, { method: "POST", body: form });
//       const data = await res.json();

//       if (data.detected && data.landmarks) {
//         lastLandmarksRef.current = data.landmarks;
//         setFaceDetected(true);
//         setStatus("Face detected");
//       } else {
//         lastLandmarksRef.current = null;
//         setFaceDetected(false);
//         setStatus("No face detected — look straight at the camera");
//       }
//     } catch (err) {
//       console.error("Landmark fetch error:", err);
//       setStatus("AI service error — is it running on port 5001?");
//     }

//     processingRef.current = false;
//   }, []);

//   // ── Kick off render loop + landmark polling once camera is ready ────────────
//   useEffect(() => {
//     if (!cameraReady) return;
//     rafRef.current = requestAnimationFrame(renderLoop);
//     landmarkTimerRef.current = setInterval(fetchLandmarks, LANDMARK_INTERVAL);
//     return () => {
//       cancelAnimationFrame(rafRef.current);
//       clearInterval(landmarkTimerRef.current);
//     };
//   }, [cameraReady, renderLoop, fetchLandmarks]);

//   return (
//     <div
//       style={{
//         minHeight: "100vh",
//         background: "#0a0a0a",
//         display: "flex",
//         flexDirection: "column",
//         alignItems: "center",
//         justifyContent: "center",
//         padding: "24px",
//         fontFamily: "sans-serif",
//       }}
//     >
//       <div style={{ width: "100%", maxWidth: "720px" }}>
//         <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
//           <button
//             onClick={() => { stopAll(); navigate(-1); }}
//             style={{
//               background: "#1a1a1a", border: "1px solid #333", color: "#fff",
//               padding: "8px 18px", borderRadius: "8px", cursor: "pointer", fontSize: "14px",
//             }}
//           >
//             ← Back
//           </button>
//           <div>
//             <h1 style={{ color: "#fff", margin: 0, fontSize: "20px", fontWeight: 700 }}>
//               Virtual Try-On
//             </h1>
//             {productName && (
//               <p style={{ color: "#888", margin: "2px 0 0", fontSize: "13px" }}>
//                 {decodeURIComponent(productName)}
//               </p>
//             )}
//           </div>
//         </div>

//         <div
//           style={{
//             background: faceDetected ? "#0d7f3f" : "#7a3f00",
//             color: "#fff", padding: "8px 16px", borderRadius: "8px",
//             marginBottom: "14px", fontSize: "13px", fontWeight: 600,
//             display: "flex", alignItems: "center", gap: "8px",
//           }}
//         >
//           <span style={{
//             width: 8, height: 8, borderRadius: "50%",
//             background: faceDetected ? "#4ade80" : "#fb923c",
//             display: "inline-block",
//           }} />
//           {status}
//         </div>

//         <div style={{
//           position: "relative", borderRadius: "16px", overflow: "hidden",
//           background: "#111", border: "1px solid #222",
//         }}>
//           <video ref={videoRef} style={{ display: "none" }} muted playsInline />
//           <canvas ref={canvasRef} style={{ width: "100%", display: "block", borderRadius: "16px" }} />
//           {!glassesLoaded && productImage && (
//             <div style={{
//               position: "absolute", top: 12, right: 12,
//               background: "rgba(0,0,0,0.6)", color: "#fff",
//               padding: "4px 10px", borderRadius: "6px", fontSize: "12px",
//             }}>
//               Loading glasses...
//             </div>
//           )}
//         </div>

//         <div style={{ marginTop: "16px", display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
//           {["Face the camera directly", "Good lighting helps", "Keep your face centered"].map((tip) => (
//             <span key={tip} style={{
//               color: "#555", fontSize: "12px", background: "#111",
//               padding: "4px 12px", borderRadius: "20px", border: "1px solid #222",
//             }}>
//               {tip}
//             </span>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }

import { useEffect, useRef, useState, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

const AI_URL = "http://localhost:5001";
const LANDMARK_INTERVAL = 100;   // ms between landmark fetches
const CAPTURE_WIDTH = 320;       // send a smaller frame to the backend — plenty for landmarks

export default function TryOn() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const productImage = searchParams.get("image");
  const productName = searchParams.get("name");

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Offscreen canvas used ONLY for capturing frames to send to the backend
  // We draw the raw (un-mirrored) video here so landmark coords are in camera space
  const captureCanvasRef = useRef(document.createElement("canvas"));

  // Three separate image refs — arms drawn behind front frame
  const imgFrontRef    = useRef(null);
  const imgArmLeftRef  = useRef(null);
  const imgArmRightRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(null);          // requestAnimationFrame handle
  const landmarkTimerRef = useRef(null);
  const processingRef = useRef(false);

  // Last known landmarks — persisted across frames so glasses never disappear
  const lastLandmarksRef = useRef(null);

  const [status, setStatus] = useState("Starting camera...");
  const [faceDetected, setFaceDetected] = useState(false);
  const [loadedCount, setLoadedCount] = useState(0); // increments per loaded image (max 3)
  const glassesLoaded = loadedCount >= 3;
  const [cameraReady, setCameraReady] = useState(false);

  // ── Load glasses images (front + left arm + right arm) ─────────────────────
  useEffect(() => {
    if (!productImage) return;

    const base = productImage.startsWith("http")
      ? productImage.substring(0, productImage.lastIndexOf("/"))
      : `http://localhost:3000${productImage.substring(0, productImage.lastIndexOf("/"))}`;

    // Convention: front.png, left.png, right.png sit in the same folder as the product image.
    // The productImage URL itself is expected to be the front image (front.png).
    const parts = [
      { ref: imgFrontRef,   src: productImage.startsWith("http") ? productImage : `http://localhost:3000${productImage}` },
      { ref: imgArmLeftRef,  src: `${base}/left.png`  },
      { ref: imgArmRightRef, src: `${base}/right.png` },
    ];

    parts.forEach(({ ref, src }) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = src;
      img.onload  = () => { ref.current = img; setLoadedCount((c) => c + 1); };
      img.onerror = () => { setLoadedCount((c) => c + 1); }; // still increment so we don't block
    });
  }, [productImage]);

  // ── Start camera ────────────────────────────────────────────────────────────
  useEffect(() => {
    startCamera();
    return () => stopAll();
  }, []);

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraReady(true);
        setStatus("Face the camera");
      }
    } catch (err) {
      console.error("Camera error:", err);
      setStatus("Camera access denied — please allow camera access in browser settings");
    }
  }

  function stopAll() {
    cancelAnimationFrame(rafRef.current);
    clearInterval(landmarkTimerRef.current);
    if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
  }

  // ── Draw glasses overlay onto the display canvas ────────────────────────────
  // landmarks are in camera (un-mirrored) space.
  // The display canvas IS mirrored, so we mirror X coords before drawing.
  const drawOverlay = useCallback((ctx, landmarks, canvasW, canvasH) => {
    const { left_eye, right_eye, left_temple, right_temple, image_width, image_height } = landmarks;
    if (!image_width || !image_height) return;

    const scaleX = canvasW / image_width;
    const scaleY = canvasH / image_height;

    // Mirror X — camera space → display (mirrored) space
    const mirror = (x) => canvasW - x * scaleX;
    const scaleY_ = (y) => y * scaleY;

    // Eye positions in display space
    // After mirroring: person's LEFT eye appears on the RIGHT of screen
    const eyeL = { x: mirror(left_eye.x),  y: scaleY_(left_eye.y)  }; // appears RIGHT
    const eyeR = { x: mirror(right_eye.x), y: scaleY_(right_eye.y) }; // appears LEFT

    // Temple (hinge anchor) positions in display space
    const templeL = { x: mirror(left_temple.x),  y: scaleY_(left_temple.y)  }; // appears RIGHT side
    const templeR = { x: mirror(right_temple.x), y: scaleY_(right_temple.y) }; // appears LEFT side

    const eyeCenterX   = (eyeL.x + eyeR.x) / 2;
    const eyeCenterY   = (eyeL.y + eyeR.y) / 2;
    const eyeDistance  = Math.abs(eyeL.x - eyeR.x);

    // Front frame dimensions
    const frontW = eyeDistance * 2.4;
    const frontH = frontW * 0.38;

    // Tilt angle of the eye line
    const angle = Math.atan2(eyeR.y - eyeL.y, eyeR.x - eyeL.x);

    // Vertical offset so frame sits on eyes (not above them)
    const frameOffsetY = frontH * 0.15;

    // Frame center in display space
    const frameCX = eyeCenterX;
    const frameCY = eyeCenterY + frameOffsetY;

    // ── Helper: draw one image centered and rotated ──────────────────────────
    const drawImg = (img, cx, cy, w, h, rot) => {
      if (!img) return;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rot);
      ctx.scale(1, -1); // correct the canvas mirror flip
      ctx.drawImage(img, -w / 2, -h / 2, w, h);
      ctx.restore();
    };

    // ── Arm dimensions ───────────────────────────────────────────────────────
    // Arms are long and thin. Width = distance from hinge to temple landmark.
    // The arm images have the hinge end touching the frame edge.

    // Right arm (appears on LEFT side of screen after mirroring)
    // Hinge is at the left edge of the front frame; tip points toward right temple landmark
    const hingeR = {
      x: frameCX + Math.cos(angle) * (-frontW / 2),
      y: frameCY + Math.sin(angle) * (-frontW / 2),
    };
    const armRLen  = Math.hypot(templeR.x - hingeR.x, templeR.y - hingeR.y) * 1.15;
    const armRAngle = Math.atan2(templeR.y - hingeR.y, templeR.x - hingeR.x);
    const armH     = frontH * 0.28;
    // Center of arm image = midpoint between hinge and tip
    const armRCX   = hingeR.x + Math.cos(armRAngle) * armRLen / 2;
    const armRCY   = hingeR.y + Math.sin(armRAngle) * armRLen / 2;

    // Left arm (appears on RIGHT side of screen after mirroring)
    const hingeL = {
      x: frameCX + Math.cos(angle) * (frontW / 2),
      y: frameCY + Math.sin(angle) * (frontW / 2),
    };
    const armLLen   = Math.hypot(templeL.x - hingeL.x, templeL.y - hingeL.y) * 1.15;
    const armLAngle = Math.atan2(templeL.y - hingeL.y, templeL.x - hingeL.x);
    const armLCX    = hingeL.x + Math.cos(armLAngle) * armLLen / 2;
    const armLCY    = hingeL.y + Math.sin(armLAngle) * armLLen / 2;

    // ── Draw order: arms behind, front frame on top ──────────────────────────

    // Right arm — uses right.png (hinge on LEFT of image, tip to RIGHT)
    drawImg(imgArmRightRef.current, armRCX, armRCY, armRLen, armH, armRAngle);

    // Left arm — uses left.png (hinge on RIGHT of image, tip to LEFT)
    drawImg(imgArmLeftRef.current,  armLCX, armLCY, armLLen, armH, armLAngle);

    // Front frame — centered on eye midpoint
    drawImg(imgFrontRef.current, frameCX, frameCY, frontW, frontH, angle);

  }, []);

  // ── Render loop — runs every animation frame, never waits for the network ──
  const renderLoop = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) { rafRef.current = requestAnimationFrame(renderLoop); return; }

    const ctx = canvas.getContext("2d");
    if (!ctx) { rafRef.current = requestAnimationFrame(renderLoop); return; }

    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    // Draw mirrored video
    ctx.save();
    ctx.scale(-1, 1);
    ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
    ctx.restore();

    // Always overlay the last known landmarks — no flickering
    if (lastLandmarksRef.current) {
      drawOverlay(ctx, lastLandmarksRef.current, canvas.width, canvas.height);
    }

    rafRef.current = requestAnimationFrame(renderLoop);
  }, [drawOverlay]);

  // ── Landmark fetch — runs every LANDMARK_INTERVAL ms independently ──────────
  const fetchLandmarks = useCallback(async () => {
    if (processingRef.current) return;
    const video = videoRef.current;
    if (!video || video.readyState < 2) return;

    processingRef.current = true;

    try {
      // Capture a downscaled un-mirrored frame — smaller = faster network + backend
      const cap = captureCanvasRef.current;
      const scale = CAPTURE_WIDTH / video.videoWidth;
      cap.width = CAPTURE_WIDTH;
      cap.height = Math.round(video.videoHeight * scale);
      const capCtx = cap.getContext("2d");
      capCtx.drawImage(video, 0, 0, cap.width, cap.height); // no mirroring

      const blob = await new Promise((resolve) => cap.toBlob(resolve, "image/jpeg", 0.6));
      if (!blob) { processingRef.current = false; return; }

      const form = new FormData();
      form.append("file", blob, "frame.jpg");

      const res = await fetch(`${AI_URL}/landmarks`, { method: "POST", body: form });
      const data = await res.json();

      if (data.detected && data.landmarks) {
        lastLandmarksRef.current = data.landmarks;
        setFaceDetected(true);
        setStatus("Face detected");
      } else {
        lastLandmarksRef.current = null;
        setFaceDetected(false);
        setStatus("No face detected — look straight at the camera");
      }
    } catch (err) {
      console.error("Landmark fetch error:", err);
      setStatus("AI service error — is it running on port 5001?");
    }

    processingRef.current = false;
  }, []);

  // ── Kick off render loop + landmark polling once camera is ready ────────────
  useEffect(() => {
    if (!cameraReady) return;
    rafRef.current = requestAnimationFrame(renderLoop);
    landmarkTimerRef.current = setInterval(fetchLandmarks, LANDMARK_INTERVAL);
    return () => {
      cancelAnimationFrame(rafRef.current);
      clearInterval(landmarkTimerRef.current);
    };
  }, [cameraReady, renderLoop, fetchLandmarks]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a0a",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ width: "100%", maxWidth: "720px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
          <button
            onClick={() => { stopAll(); navigate(-1); }}
            style={{
              background: "#1a1a1a", border: "1px solid #333", color: "#fff",
              padding: "8px 18px", borderRadius: "8px", cursor: "pointer", fontSize: "14px",
            }}
          >
            ← Back
          </button>
          <div>
            <h1 style={{ color: "#fff", margin: 0, fontSize: "20px", fontWeight: 700 }}>
              Virtual Try-On
            </h1>
            {productName && (
              <p style={{ color: "#888", margin: "2px 0 0", fontSize: "13px" }}>
                {decodeURIComponent(productName)}
              </p>
            )}
          </div>
        </div>

        <div
          style={{
            background: faceDetected ? "#0d7f3f" : "#7a3f00",
            color: "#fff", padding: "8px 16px", borderRadius: "8px",
            marginBottom: "14px", fontSize: "13px", fontWeight: 600,
            display: "flex", alignItems: "center", gap: "8px",
          }}
        >
          <span style={{
            width: 8, height: 8, borderRadius: "50%",
            background: faceDetected ? "#4ade80" : "#fb923c",
            display: "inline-block",
          }} />
          {status}
        </div>

        <div style={{
          position: "relative", borderRadius: "16px", overflow: "hidden",
          background: "#111", border: "1px solid #222",
        }}>
          <video ref={videoRef} style={{ display: "none" }} muted playsInline />
          <canvas ref={canvasRef} style={{ width: "100%", display: "block", borderRadius: "16px" }} />
          {!glassesLoaded && productImage && (
            <div style={{
              position: "absolute", top: 12, right: 12,
              background: "rgba(0,0,0,0.6)", color: "#fff",
              padding: "4px 10px", borderRadius: "6px", fontSize: "12px",
            }}>
              Loading glasses...
            </div>
          )}
        </div>

        <div style={{ marginTop: "16px", display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          {["Face the camera directly", "Good lighting helps", "Keep your face centered"].map((tip) => (
            <span key={tip} style={{
              color: "#555", fontSize: "12px", background: "#111",
              padding: "4px 12px", borderRadius: "20px", border: "1px solid #222",
            }}>
              {tip}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}