import { useState, useCallback } from "react";

export const useFileUpload = () => {
  const [file, setFile] = useState(null);

  const handleFileChange = useCallback((event) => {
    const uploadedFile = event.target.files[0];
    if (uploadedFile) setFile(uploadedFile);
  }, []);

  const handleCapturePhoto = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) return;
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    // Logic to capture photo (use canvas to save a snapshot from the video stream)
    // After capturing, set the file with the resulting photo data
  }, []);

  return {
    file,
    handleFileChange,
    handleCapturePhoto,
  };
};
