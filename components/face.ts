// Reconocimiento facial en el navegador. El modelo (~6 MB) se descarga solo cuando se
// abre el escáner o el registro, y ninguna imagen sale del dispositivo: solo el vector.
type FaceApi = typeof import("@vladmandic/face-api");
type Source = HTMLVideoElement | HTMLImageElement | HTMLCanvasElement;

let ready: Promise<FaceApi> | null = null;

export function loadFace(): Promise<FaceApi> {
  ready ??= (async () => {
    const faceapi = await import("@vladmandic/face-api");
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
      faceapi.nets.faceLandmark68TinyNet.loadFromUri("/models"),
      faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
    ]);
    return faceapi;
  })();
  ready.catch(() => (ready = null));
  return ready;
}

/** Vector de 128 números del rostro más visible, o null si no hay un rostro claro. */
export async function describeFace(source: Source): Promise<number[] | null> {
  const faceapi = await loadFace();
  const detect = (input: Source) =>
    faceapi
      .detectSingleFace(input, new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.5 }))
      .withFaceLandmarks(true)
      .withFaceDescriptor();
  // Un rostro que llena el cuadro no se detecta bien: segundo intento con la imagen alejada.
  const found = (await detect(source)) ?? (await detect(zoomOut(source)));
  return found ? Array.from(found.descriptor) : null;
}

function zoomOut(source: Source): HTMLCanvasElement {
  const w = "videoWidth" in source ? source.videoWidth : "naturalWidth" in source ? source.naturalWidth : source.width;
  const h = "videoHeight" in source ? source.videoHeight : "naturalHeight" in source ? source.naturalHeight : source.height;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#777";
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(source, w * 0.22, h * 0.22, w * 0.56, h * 0.56);
  return canvas;
}

export async function openCamera(video: HTMLVideoElement, facingMode: "user" | "environment") {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: { facingMode, width: { ideal: 640 }, height: { ideal: 480 } },
  });
  video.srcObject = stream;
  await video.play();
  return () => stream.getTracks().forEach((t) => t.stop());
}

export function imageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("No se pudo leer la imagen"));
    img.src = URL.createObjectURL(file);
  });
}
