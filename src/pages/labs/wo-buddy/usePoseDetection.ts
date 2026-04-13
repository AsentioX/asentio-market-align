import { useEffect, useRef, useState, useCallback } from 'react';
import { PoseLandmarker, FilesetResolver, DrawingUtils } from '@mediapipe/tasks-vision';
import type { Landmark } from './repCounter';

const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task';
const WASM_CDN =
  'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm';

export interface PoseDetectionResult {
  landmarks: Landmark[];
  timestamp: number;
}

interface UsePoseDetectionOptions {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  enabled: boolean;
  onResult?: (result: PoseDetectionResult) => void;
}

export function usePoseDetection({ videoRef, canvasRef, enabled, onResult }: UsePoseDetectionOptions) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const landmarkerRef = useRef<PoseLandmarker | null>(null);
  const rafRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);
  const lastTimestampRef = useRef<number>(-1);

  // Initialize MediaPipe
  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    (async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(WASM_CDN);
        if (cancelled) return;
        const landmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: { modelAssetPath: MODEL_URL, delegate: 'GPU' },
          runningMode: 'VIDEO',
          numPoses: 1,
        });
        if (cancelled) { landmarker.close(); return; }
        landmarkerRef.current = landmarker;
        setLoading(false);
      } catch (e) {
        if (!cancelled) {
          console.error('MediaPipe init error:', e);
          setError('Failed to load pose model');
          setLoading(false);
        }
      }
    })();

    return () => { cancelled = true; };
  }, [enabled]);

  // Start camera
  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: 640, height: 480 },
        });
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraActive(true);
        }
      } catch {
        if (!cancelled) {
          setError('Camera unavailable');
          setCameraActive(false);
        }
      }
    })();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    };
  }, [enabled, videoRef]);

  // Detection loop
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;

  useEffect(() => {
    if (!enabled || loading || !cameraActive) return;

    const detect = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const landmarker = landmarkerRef.current;

      if (!video || !canvas || !landmarker || video.readyState < 2) {
        rafRef.current = requestAnimationFrame(detect);
        return;
      }

      const ts = performance.now();
      // MediaPipe requires strictly increasing timestamps
      if (ts <= lastTimestampRef.current) {
        rafRef.current = requestAnimationFrame(detect);
        return;
      }
      lastTimestampRef.current = ts;

      const results = landmarker.detectForVideo(video, ts);
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (results.landmarks && results.landmarks.length > 0) {
          const drawUtils = new DrawingUtils(ctx);
          // Draw connections
          drawUtils.drawConnectors(
            results.landmarks[0],
            PoseLandmarker.POSE_CONNECTIONS,
            { color: '#34d399', lineWidth: 2.5 }
          );
          // Draw landmarks
          drawUtils.drawLandmarks(results.landmarks[0], {
            color: '#34d399',
            lineWidth: 1,
            radius: 3,
          });

          onResultRef.current?.({
            landmarks: results.landmarks[0] as Landmark[],
            timestamp: ts,
          });
        }
      }

      rafRef.current = requestAnimationFrame(detect);
    };

    rafRef.current = requestAnimationFrame(detect);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [enabled, loading, cameraActive, videoRef, canvasRef]);

  // Cleanup landmarker
  useEffect(() => {
    return () => {
      landmarkerRef.current?.close();
      landmarkerRef.current = null;
    };
  }, []);

  return { loading, error, cameraActive };
}
