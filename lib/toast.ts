// tiny pub sub used to trigger the soft toast banner from anywhere in the
// app without threading callbacks through every screen
type ToastListener = (message: string) => void;

let listener: ToastListener | null = null;

// called once by the toast host on mount
export function registerToastListener(callback: ToastListener): () => void {
  listener = callback;
  return () => {
    if (listener === callback) {
      listener = null;
    }
  };
}

// shows a short lived message in the toast host, a no op if no host is mounted
export function showToast(message: string): void {
  listener?.(message);
}
