import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera, RefreshCw, Image as ImageIcon, Download, Send, X, Check,
  Palette, Sparkles, Settings, Lock, ArrowLeft, RotateCcw, Heart,
  ExternalLink, ChevronRight, Grid3x3, Wand2
} from 'lucide-react';
import confetti from 'canvas-confetti';

const DRIVE_UPLOAD_ENDPOINT = 'https://script.google.com/macros/s/AKfycbzMyg-2mWoSxy68qhPBtOA7wkytB12wb41IOZ8XhmaLR8b5Y0A-R-drOU9aIHTrrbcyGg/exec';
const DRIVE_FOLDER_LINK = 'https://drive.google.com/drive/folders/1f2JbKJivjlm01d89xu8A6DIrlOPIpJa3';
const ADMIN_PASSWORD = 'icomics2026';

const DEFAULT_CONFIG = {
  coupleNames: 'Sri ❤️ Sri',
  eventDate: '29.08.2026',
  eventName: 'Mehendi',
  hashtag: '#sri_weds_Sri'
};

const ASPECTS = [
  { id: '4:5', label: '4:5', sub: 'Instagram Portrait', w: 1080, h: 1350 },
  { id: '9:16', label: '9:16', sub: 'Story / Reel', w: 1080, h: 1920 },
  { id: '16:9', label: '16:9', sub: 'Landscape', w: 1920, h: 1080 }
];

const INK_SWATCHES = [
  { name: 'Black', hex: '#000000' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Crimson', hex: '#DC143C' },
  { name: 'Gold', hex: '#D4AF37' },
  { name: 'Teal', hex: '#0D9488' },
  { name: 'Royal Purple', hex: '#7E22CE' }
];

const DOODLE_STYLES = [
  { id: 'romantic', label: 'Romantic', desc: 'Hearts, stars & floral vines' },
  { id: 'kolam', label: 'Pulli Kolam', desc: 'South Indian dot-grid art' },
  { id: 'alpona', label: 'Bengali Alpona', desc: 'Kalka, topor & conch motifs' }
];

function loadConfig() {
  try {
    const saved = localStorage.getItem('icomics_config');
    return saved ? { ...DEFAULT_CONFIG, ...JSON.parse(saved) } : DEFAULT_CONFIG;
  } catch { return DEFAULT_CONFIG; }
}

function loadPhotos() {
  try {
    const saved = localStorage.getItem('icomics_photos');
    return saved ? JSON.parse(saved) : [];
  } catch { return []; }
}

// ---------- Doodle drawing helpers ----------
function heart(ctx, x, y, size) {
  ctx.beginPath();
  ctx.moveTo(x, y + size / 4);
  ctx.bezierCurveTo(x, y, x - size / 2, y, x - size / 2, y + size / 4);
  ctx.bezierCurveTo(x - size / 2, y + size / 1.6, x, y + size, x, y + size * 1.2);
  ctx.bezierCurveTo(x, y + size, x + size / 2, y + size / 1.6, x + size / 2, y + size / 4);
  ctx.bezierCurveTo(x + size / 2, y, x, y, x, y + size / 4);
  ctx.stroke();
}

function star(ctx, x, y, r) {
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const a1 = (Math.PI / 2.5) * i - Math.PI / 2;
    const a2 = a1 + Math.PI / 5;
    const p1 = [x + r * Math.cos(a1), y + r * Math.sin(a1)];
    const p2 = [x + (r / 2.4) * Math.cos(a2), y + (r / 2.4) * Math.sin(a2)];
    if (i === 0) ctx.moveTo(...p1); else ctx.lineTo(...p1);
    ctx.lineTo(...p2);
  }
  ctx.closePath();
  ctx.stroke();
}

function wave(ctx, x, y, w, amp) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  for (let i = 0; i <= w; i += 10) {
    ctx.lineTo(x + i, y + Math.sin(i / 12) * amp);
  }
  ctx.stroke();
}

function vine(ctx, x, y, len, dir) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  let cx = x, cy = y;
  for (let i = 0; i < len; i += 22) {
    const nx = cx + dir * 16;
    const ny = cy - 18;
    ctx.quadraticCurveTo(cx + dir * 10, cy - 10, nx, ny);
    if (i % 44 === 0) {
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(nx + dir * 6, ny - 4, 6, 3, dir * 0.6, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    cx = nx; cy = ny;
  }
}

function romanticDoodles(ctx, w, h, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(2, w * 0.0022);
  ctx.lineCap = 'round';
  const pad = w * 0.06;
  heart(ctx, pad + 10, pad, w * 0.05);
  heart(ctx, w - pad - 10, pad, w * 0.04);
  star(ctx, pad, h * 0.22, w * 0.02);
  star(ctx, w - pad, h * 0.3, w * 0.018);
  star(ctx, pad * 1.4, h * 0.42, w * 0.015);
  wave(ctx, pad, h * 0.12, w * 0.18, 6);
  wave(ctx, w - pad - w * 0.18, h * 0.55, w * 0.18, 6);
  vine(ctx, pad, h * 0.65, h * 0.22, 1);
  vine(ctx, w - pad, h * 0.55, h * 0.22, -1);
  heart(ctx, w / 2, pad * 0.6, w * 0.035);
}

function dot(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function kolamLotus(ctx, cx, cy, r, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  for (let i = 0; i < 8; i++) {
    const a = (Math.PI / 4) * i;
    ctx.beginPath();
    ctx.ellipse(cx + Math.cos(a) * r * 0.55, cy + Math.sin(a) * r * 0.55, r * 0.45, r * 0.2, a, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.22, 0, Math.PI * 2);
  ctx.stroke();
}

function diya(ctx, x, y, s, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - s, y);
  ctx.quadraticCurveTo(x, y + s * 0.8, x + s, y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, y - s * 0.2);
  ctx.quadraticCurveTo(x + s * 0.25, y - s * 0.9, x, y - s * 1.3);
  ctx.quadraticCurveTo(x - s * 0.25, y - s * 0.9, x, y - s * 0.2);
  ctx.stroke();
}

function kolamDoodles(ctx, w, h, color) {
  const pad = w * 0.07;
  const spacing = w * 0.045;
  // dot grid corners
  [[pad, pad], [w - pad, pad], [pad, h - pad], [w - pad, h - pad]].forEach(([bx, by], idx) => {
    const dir = idx % 2 === 0 ? 1 : -1;
    for (let row = 0; row < 4; row++) {
      for (let colI = 0; colI < 4 - row; colI++) {
        dot(ctx, bx + dir * (colI * spacing + row * spacing / 2) * (bx > w / 2 ? -1 : 1), by + row * spacing * (by > h / 2 ? -1 : 1), 2.4, color);
      }
    }
  });
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(2, w * 0.002);
  // interlocking loops top center
  ctx.beginPath();
  for (let i = -2; i <= 2; i++) {
    ctx.moveTo(w / 2 + i * spacing, pad * 0.7);
    ctx.arc(w / 2 + i * spacing + spacing / 2, pad * 0.7, spacing / 2, Math.PI, 0, false);
  }
  ctx.stroke();
  kolamLotus(ctx, pad * 1.6, h * 0.5, w * 0.045, color);
  kolamLotus(ctx, w - pad * 1.6, h * 0.5, w * 0.045, color);
  diya(ctx, w / 2, h - pad * 0.6, w * 0.03, color);
  diya(ctx, w / 2 - w * 0.1, h - pad * 0.55, w * 0.022, color);
  diya(ctx, w / 2 + w * 0.1, h - pad * 0.55, w * 0.022, color);
}

function paisley(ctx, x, y, s, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.bezierCurveTo(x + s, y - s, x + s * 1.4, y + s * 0.6, x + s * 0.3, y + s * 1.2);
  ctx.bezierCurveTo(x - s * 0.3, y + s * 0.6, x - s * 0.1, y + s * 0.1, x, y);
  ctx.stroke();
  dot(ctx, x + s * 0.4, y + s * 0.3, 2, color);
}

function topor(ctx, x, y, s, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - s, y);
  for (let i = 0; i <= 6; i++) {
    const px = x - s + (i * (2 * s)) / 6;
    const py = y - (i % 2 === 0 ? s * 0.9 : s * 0.3);
    ctx.lineTo(px, py);
  }
  ctx.lineTo(x + s, y);
  ctx.closePath();
  ctx.stroke();
}

function conch(ctx, x, y, s, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, y - s);
  ctx.quadraticCurveTo(x + s * 0.9, y - s * 0.4, x + s * 0.2, y + s);
  ctx.quadraticCurveTo(x - s * 0.6, y + s * 0.3, x, y - s);
  ctx.stroke();
  for (let i = 1; i <= 3; i++) {
    ctx.beginPath();
    ctx.arc(x + s * 0.1, y - s * 0.2, (s / 4) * i * 0.4, 0, Math.PI * 1.2);
    ctx.stroke();
  }
}

function alponaDoodles(ctx, w, h, color) {
  const pad = w * 0.06;
  paisley(ctx, pad, pad * 1.4, w * 0.06, color);
  paisley(ctx, w - pad - w * 0.06, pad * 1.4, w * 0.06, color);
  paisley(ctx, pad, h - pad * 1.6, w * 0.05, color);
  paisley(ctx, w - pad - w * 0.05, h - pad * 1.6, w * 0.05, color);
  topor(ctx, w / 2, pad * 1.1, w * 0.045, color);
  conch(ctx, pad * 1.3, h * 0.5, w * 0.035, color);
  conch(ctx, w - pad * 1.3, h * 0.5, w * 0.035, color);
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(2, w * 0.002);
  wave(ctx, pad, h * 0.3, w * 0.15, 8);
  wave(ctx, w - pad - w * 0.15, h * 0.7, w * 0.15, 8);
}

function drawDoodles(ctx, style, w, h, color) {
  if (style === 'romantic') romanticDoodles(ctx, w, h, color);
  else if (style === 'kolam') kolamDoodles(ctx, w, h, color);
  else if (style === 'alpona') alponaDoodles(ctx, w, h, color);
}

// ---------- Main App ----------
export default function App() {
  const [screen, setScreen] = useState('welcome'); // welcome | camera | edit | gallery | admin
  const [config, setConfig] = useState(loadConfig());
  const [photos, setPhotos] = useState(loadPhotos());
  const [facingMode, setFacingMode] = useState('user');
  const [streamActive, setStreamActive] = useState(false);
  const [aspect, setAspect] = useState(ASPECTS[0]);
  const [rawImage, setRawImage] = useState(null); // captured/uploaded source image data URL
  const [doodleStyle, setDoodleStyle] = useState('romantic');
  const [inkColor, setInkColor] = useState('#000000');
  const [customColorOpen, setCustomColorOpen] = useState(false);
  const [finalImage, setFinalImage] = useState(null);
  const [flashing, setFlashing] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('idle'); // idle|sending|sent|error
  const [adminAuthed, setAdminAuthed] = useState(false);
  const [pwInput, setPwInput] = useState('');
  const [pwError, setPwError] = useState(false);
  const [configDraft, setConfigDraft] = useState(config);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('icomics_config', JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem('icomics_photos', JSON.stringify(photos.slice(0, 40)));
  }, [photos]);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setStreamActive(false);
  }, []);

  const startStream = useCallback(async (mode = facingMode) => {
    stopStream();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode, width: { ideal: 1280 }, height: { ideal: 1280 } },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setStreamActive(true);
    } catch (err) {
      console.error('Camera error', err);
      setStreamActive(false);
    }
  }, [facingMode, stopStream]);

  useEffect(() => {
    if (screen === 'camera') startStream(facingMode);
    else stopStream();
    return () => stopStream();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen]);

  const flipCamera = () => {
    const next = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(next);
    startStream(next);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const c = document.createElement('canvas');
    c.width = video.videoWidth;
    c.height = video.videoHeight;
    const ctx = c.getContext('2d');
    if (facingMode === 'user') {
      ctx.translate(c.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, c.width, c.height);
    setFlashing(true);
    setTimeout(() => setFlashing(false), 350);
    setRawImage(c.toDataURL('image/png'));
    stopStream();
    setScreen('edit');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setRawImage(ev.target.result);
      setScreen('edit');
    };
    reader.readAsDataURL(file);
  };

  // ---------- Render final composed canvas whenever inputs change ----------
  useEffect(() => {
    if (!rawImage || screen !== 'edit') return;
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const W = aspect.w, H = aspect.h;
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext('2d');

      ctx.fillStyle = '#FAF0D9';
      ctx.fillRect(0, 0, W, H);

      const bannerH = H * 0.14;
      const photoAreaH = H - bannerH;
      const frameMargin = W * 0.035;
      const pw = W - frameMargin * 2;
      const ph = photoAreaH - frameMargin * 2;

      const imgRatio = img.width / img.height;
      const boxRatio = pw / ph;
      let sx, sy, sw, sh;
      if (imgRatio > boxRatio) {
        sh = img.height;
        sw = sh * boxRatio;
        sx = (img.width - sw) / 2;
        sy = 0;
      } else {
        sw = img.width;
        sh = sw / boxRatio;
        sx = 0;
        sy = (img.height - sh) / 2;
      }

      ctx.save();
      ctx.beginPath();
      const r = W * 0.02;
      const rx = frameMargin, ry = frameMargin, rw = pw, rh = ph;
      ctx.moveTo(rx + r, ry);
      ctx.arcTo(rx + rw, ry, rx + rw, ry + rh, r);
      ctx.arcTo(rx + rw, ry + rh, rx, ry + rh, r);
      ctx.arcTo(rx, ry + rh, rx, ry, r);
      ctx.arcTo(rx, ry, rx + rw, ry, r);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(img, sx, sy, sw, sh, rx, ry, rw, rh);
      ctx.restore();

      ctx.strokeStyle = inkColor;
      ctx.lineWidth = Math.max(3, W * 0.004);
      ctx.beginPath();
      ctx.moveTo(rx + r, ry);
      ctx.arcTo(rx + rw, ry, rx + rw, ry + rh, r);
      ctx.arcTo(rx + rw, ry + rh, rx, ry + rh, r);
      ctx.arcTo(rx, ry + rh, rx, ry, r);
      ctx.arcTo(rx, ry, rx + rw, ry, r);
      ctx.closePath();
      ctx.stroke();

      drawDoodles(ctx, doodleStyle, W, photoAreaH, inkColor);

      const bannerY = photoAreaH;
      ctx.fillStyle = '#7E22CE';
      ctx.fillRect(0, bannerY, W, bannerH);

      const textColor = inkColor.toUpperCase() === '#FFFFFF' ? '#000000' : '#FFFFFF';
      ctx.fillStyle = textColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      ctx.font = `700 ${bannerH * 0.34}px "Playfair Display", serif`;
      ctx.fillText(config.coupleNames, W / 2, bannerY + bannerH * 0.32);

      ctx.font = `500 ${bannerH * 0.16}px "Poppins", sans-serif`;
      ctx.fillText(`${config.eventName}  •  ${config.eventDate}`, W / 2, bannerY + bannerH * 0.62);

      ctx.font = `600 ${bannerH * 0.15}px "Poppins", sans-serif`;
      ctx.fillText(config.hashtag, W / 2, bannerY + bannerH * 0.85);

      setFinalImage(canvas.toDataURL('image/png'));
    };
    img.src = rawImage;
  }, [rawImage, aspect, doodleStyle, inkColor, config, screen]);

  const uploadToDrive = useCallback(async (dataUrl) => {
    setUploadStatus('sending');
    try {
      await fetch(DRIVE_UPLOAD_ENDPOINT, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: dataUrl,
          coupleNames: config.coupleNames,
          eventName: config.eventName,
          eventDate: config.eventDate,
          timestamp: new Date().toISOString()
        })
      });
      setUploadStatus('sent');
    } catch (err) {
      console.error('Drive upload failed', err);
      setUploadStatus('error');
    }
  }, [config]);

  useEffect(() => {
    if (finalImage) {
      uploadToDrive(finalImage);
      setPhotos(prev => [{ id: Date.now(), src: finalImage, ts: new Date().toISOString() }, ...prev]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finalImage]);

  const downloadImage = () => {
    if (!finalImage) return;
    const a = document.createElement('a');
    a.href = finalImage;
    a.download = `${config.coupleNames.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.png`;
    a.click();
    confetti({ particleCount: 120, spread: 80, colors: ['#7E22CE', '#D4AF37', '#DC143C'] });
    uploadToDrive(finalImage);
  };

  const resetToWelcome = () => {
    setRawImage(null);
    setFinalImage(null);
    setUploadStatus('idle');
    setScreen('welcome');
  };

  const tryAdminLogin = () => {
    if (pwInput === ADMIN_PASSWORD) {
      setAdminAuthed(true);
      setPwError(false);
      setConfigDraft(config);
    } else {
      setPwError(true);
    }
  };

  const saveAdminConfig = () => {
    setConfig(configDraft);
    confetti({ particleCount: 60, spread: 60, colors: ['#7E22CE', '#D4AF37'] });
  };

  return (
    <div className="min-h-screen bg-[#FAF0D9] flex flex-col items-center">
      <div className="w-full max-w-md min-h-screen bg-[#FAF0D9] relative flex flex-col">

        <header className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-royal-700 flex items-center justify-center">
              <Camera size={16} className="text-white" />
            </div>
            <span className="font-display font-bold text-royal-700 text-sm tracking-wide">i__comics</span>
          </div>
          <button
            onClick={() => setScreen(screen === 'admin' ? 'welcome' : 'admin')}
            className="text-royal-700/70 hover:text-royal-700 p-2"
            aria-label="Admin"
          >
            <Settings size={18} />
          </button>
        </header>

        {screen === 'welcome' && (
          <main className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-6 pb-10">
            <Sparkles className="text-royal-700" size={28} />
            <div>
              <h1 className="font-script text-6xl text-royal-700 leading-tight">{config.coupleNames}</h1>
              <p className="font-display text-lg text-royal-900/70 mt-2">{config.eventName} · {config.eventDate}</p>
              <p className="text-royal-700/60 text-sm mt-1 font-medium">{config.hashtag}</p>
            </div>
            <div className="w-full space-y-3 mt-4">
              <button onClick={() => setScreen('camera')} className="btn-primary w-full py-4 flex items-center justify-center gap-2 shadow-soft">
                <Camera size={20} /> Open Photobooth
              </button>
              <button onClick={() => fileInputRef.current?.click()} className="w-full py-4 rounded-full border-2 border-royal-700 text-royal-700 font-semibold flex items-center justify-center gap-2">
                <ImageIcon size={20} /> Upload from Gallery
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
              {photos.length > 0 && (
                <button onClick={() => setScreen('gallery')} className="w-full py-3 text-royal-700/70 font-medium flex items-center justify-center gap-1 text-sm">
                  <Grid3x3 size={16} /> View Gallery ({photos.length}) <ChevronRight size={14} />
                </button>
              )}
            </div>
          </main>
        )}

        {screen === 'camera' && (
          <main className="flex-1 flex flex-col">
            <div className="relative flex-1 bg-black overflow-hidden" style={{ aspectRatio: `${aspect.w}/${aspect.h}` }}>
              <video
                ref={videoRef}
                autoPlay playsInline muted
                className="w-full h-full object-cover"
                style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
              />
              {!streamActive && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white/70 gap-2 px-6 text-center">
                  <Camera size={32} />
                  <p className="text-sm">Allow camera access, or upload a photo instead.</p>
                </div>
              )}
              {flashing && <div className="absolute inset-0 bg-white flash-effect" />}
              <button onClick={() => setScreen('welcome')} className="absolute top-4 left-4 bg-black/40 text-white p-2 rounded-full">
                <ArrowLeft size={18} />
              </button>
              <button onClick={flipCamera} className="absolute top-4 right-4 bg-black/40 text-white p-2 rounded-full">
                <RefreshCw size={18} />
              </button>
            </div>

            <div className="px-4 py-3 flex gap-2 justify-center">
              {ASPECTS.map(a => (
                <button
                  key={a.id}
                  onClick={() => setAspect(a)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border-2 ${aspect.id === a.id ? 'bg-royal-700 border-royal-700 text-white' : 'border-royal-200 text-royal-700 bg-white'}`}
                >
                  <div>{a.label}</div>
                  <div className="text-[10px] font-normal opacity-80">{a.sub}</div>
                </button>
              ))}
            </div>

            <div className="px-6 py-5 flex items-center justify-center gap-8">
              <button onClick={() => fileInputRef.current?.click()} className="text-royal-700 p-3 rounded-full bg-white shadow">
                <ImageIcon size={22} />
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
              <button
                onClick={capturePhoto}
                disabled={!streamActive}
                className="w-16 h-16 rounded-full bg-royal-700 border-4 border-white shadow-soft flex items-center justify-center disabled:opacity-40"
              >
                <div className="w-12 h-12 rounded-full bg-white" />
              </button>
              <div className="w-11" />
            </div>
          </main>
        )}

        {screen === 'edit' && (
          <main className="flex-1 flex flex-col px-4 pb-6 gap-4 overflow-y-auto">
            <div className="flex items-center gap-2 pt-1">
              <button onClick={() => { setScreen('camera'); setRawImage(null); }} className="text-royal-700 p-2">
                <ArrowLeft size={18} />
              </button>
              <h2 className="font-display font-bold text-royal-700">Decorate your photo</h2>
            </div>

            <div className="card p-3 flex items-center justify-center">
              {finalImage ? (
                <img src={finalImage} alt="preview" className="rounded-xl max-h-[50vh] object-contain" />
              ) : (
                <div className="h-64 w-full flex items-center justify-center text-royal-700/50 text-sm">Rendering...</div>
              )}
            </div>
            <canvas ref={canvasRef} className="hidden" />

            <div>
              <p className="text-xs font-semibold text-royal-900/60 mb-2 uppercase tracking-wide">Aspect Ratio</p>
              <div className="flex gap-2">
                {ASPECTS.map(a => (
                  <button key={a.id} onClick={() => setAspect(a)}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold border-2 ${aspect.id === a.id ? 'bg-royal-700 border-royal-700 text-white' : 'border-royal-200 text-royal-700 bg-white'}`}>
                    {a.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-royal-900/60 mb-2 uppercase tracking-wide flex items-center gap-1"><Wand2 size={12} /> Doodle Style</p>
              <div className="grid grid-cols-3 gap-2">
                {DOODLE_STYLES.map(s => (
                  <button key={s.id} onClick={() => setDoodleStyle(s.id)}
                    className={`py-2 px-1 rounded-xl text-[11px] font-semibold border-2 leading-tight ${doodleStyle === s.id ? 'bg-royal-700 border-royal-700 text-white' : 'border-royal-200 text-royal-700 bg-white'}`}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-royal-900/60 mb-2 uppercase tracking-wide flex items-center gap-1"><Palette size={12} /> Doodle Ink</p>
              <div className="flex items-center gap-3 flex-wrap">
                {INK_SWATCHES.map(sw => (
                  <button
                    key={sw.hex}
                    title={sw.name}
                    onClick={() => setInkColor(sw.hex)}
                    className={`swatch ${inkColor.toUpperCase() === sw.hex ? 'selected' : ''}`}
                    style={{ background: sw.hex, border: sw.hex === '#FFFFFF' ? '3px solid #e5e5e5' : undefined }}
                  />
                ))}
                <button onClick={() => setCustomColorOpen(v => !v)} className="swatch flex items-center justify-center bg-gradient-to-br from-pink-400 via-purple-500 to-yellow-400">
                  <Palette size={14} className="text-white" />
                </button>
              </div>
              {customColorOpen && (
                <input
                  type="color"
                  value={inkColor}
                  onChange={(e) => setInkColor(e.target.value)}
                  className="mt-3 w-full h-10 rounded-lg cursor-pointer"
                />
              )}
            </div>

            <div className="flex gap-3 mt-1">
              <button onClick={downloadImage} className="btn-primary flex-1 py-3 flex items-center justify-center gap-2">
                <Download size={18} /> Download
              </button>
              <button onClick={() => uploadToDrive(finalImage)} className="flex-1 py-3 rounded-full border-2 border-royal-700 text-royal-700 font-semibold flex items-center justify-center gap-2">
                <Send size={18} /> Re-send
              </button>
            </div>

            <div className="text-center text-xs">
              {uploadStatus === 'sending' && <span className="text-royal-700/60">Uploading to Google Drive...</span>}
              {uploadStatus === 'sent' && <span className="text-emerald-600 flex items-center justify-center gap-1"><Check size={14} /> Saved to Drive</span>}
              {uploadStatus === 'error' && <span className="text-red-500">Upload failed — try Re-send</span>}
            </div>

            <a href={DRIVE_FOLDER_LINK} target="_blank" rel="noreferrer"
              className="text-center text-xs text-royal-700 underline flex items-center justify-center gap-1">
              View live Google Drive folder <ExternalLink size={12} />
            </a>

            <button onClick={resetToWelcome} className="w-full py-3 text-royal-900/50 text-sm flex items-center justify-center gap-1">
              <RotateCcw size={14} /> Start Over
            </button>
          </main>
        )}

        {screen === 'gallery' && (
          <main className="flex-1 flex flex-col px-4 pb-6 gap-4">
            <div className="flex items-center gap-2 pt-1">
              <button onClick={() => setScreen('welcome')} className="text-royal-700 p-2"><ArrowLeft size={18} /></button>
              <h2 className="font-display font-bold text-royal-700">Gallery</h2>
            </div>
            {photos.length === 0 ? (
              <p className="text-center text-royal-900/50 text-sm mt-10">No photos yet. Go capture your first memory!</p>
            ) : (
              <div className="grid grid-cols-2 gap-3 overflow-y-auto">
                {photos.map(p => (
                  <div key={p.id} className="card overflow-hidden">
                    <img src={p.src} alt="" className="w-full object-cover" />
                  </div>
                ))}
              </div>
            )}
            <a href={DRIVE_FOLDER_LINK} target="_blank" rel="noreferrer"
              className="text-center text-xs text-royal-700 underline flex items-center justify-center gap-1 mt-2">
              View full album on Google Drive <ExternalLink size={12} />
            </a>
          </main>
        )}

        {screen === 'admin' && !adminAuthed && (
          <main className="flex-1 flex flex-col items-center justify-center px-6 gap-4 text-center">
            <Lock className="text-royal-700" size={28} />
            <h2 className="font-display font-bold text-royal-700 text-lg">Admin Access</h2>
            <input
              type="password"
              value={pwInput}
              onChange={(e) => { setPwInput(e.target.value); setPwError(false); }}
              placeholder="Enter admin password"
              className="w-full px-4 py-3 rounded-xl border-2 border-royal-200 focus:border-royal-700 outline-none text-center"
              onKeyDown={(e) => e.key === 'Enter' && tryAdminLogin()}
            />
            {pwError && <p className="text-red-500 text-xs">Incorrect password. Try again.</p>}
            <button onClick={tryAdminLogin} className="btn-primary w-full py-3">Unlock</button>
            <button onClick={() => setScreen('welcome')} className="text-royal-900/50 text-sm">Cancel</button>
          </main>
        )}

        {screen === 'admin' && adminAuthed && (
          <main className="flex-1 flex flex-col px-4 pb-8 gap-4 overflow-y-auto">
            <div className="flex items-center gap-2 pt-1">
              <button onClick={() => { setAdminAuthed(false); setScreen('welcome'); setPwInput(''); }} className="text-royal-700 p-2"><ArrowLeft size={18} /></button>
              <h2 className="font-display font-bold text-royal-700">Admin Dashboard</h2>
            </div>

            <div className="card p-4 space-y-3">
              <p className="text-xs font-semibold text-royal-900/60 uppercase tracking-wide flex items-center gap-1"><Heart size={12} /> Event Settings</p>
              {[
                ['coupleNames', 'Couple Names'],
                ['eventDate', 'Event Date'],
                ['eventName', 'Event Name'],
                ['hashtag', 'Hashtag']
              ].map(([key, label]) => (
                <div key={key}>
                  <label className="text-xs text-royal-900/50">{label}</label>
                  <input
                    value={configDraft[key]}
                    onChange={(e) => setConfigDraft({ ...configDraft, [key]: e.target.value })}
                    className="w-full px-3 py-2 mt-1 rounded-lg border-2 border-royal-200 focus:border-royal-700 outline-none text-sm"
                  />
                </div>
              ))}
              <button onClick={saveAdminConfig} className="btn-primary w-full py-3 mt-1">Save Event Settings</button>
            </div>

            <div className="card p-4">
              <p className="text-xs font-semibold text-royal-900/60 uppercase tracking-wide mb-2">Captured Photos ({photos.length})</p>
              {photos.length === 0 ? (
                <p className="text-royal-900/40 text-sm">No submissions yet.</p>
              ) : (
                <div className="grid grid-cols-3 gap-2 max-h-72 overflow-y-auto">
                  {photos.map(p => (
                    <img key={p.id} src={p.src} className="rounded-lg w-full object-cover" alt="" />
                  ))}
                </div>
              )}
              {photos.length > 0 && (
                <button onClick={() => setPhotos([])} className="mt-3 text-red-500 text-xs font-medium">Clear all photos</button>
              )}
            </div>

            <a href={DRIVE_FOLDER_LINK} target="_blank" rel="noreferrer"
              className="btn-primary w-full py-3 flex items-center justify-center gap-2">
              Open Google Drive Folder <ExternalLink size={16} />
            </a>
          </main>
        )}
      </div>
    </div>
  );
}
