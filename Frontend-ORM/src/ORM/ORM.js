import React, { useState, useRef } from "react";
import Webcam from "react-webcam";
import "bootstrap/dist/css/bootstrap.min.css";

const IdCardScanner = () => {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [extractedData, setExtractedData] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [showWebcam, setShowWebcam] = useState(false);
  const webcamRef = useRef(null);

  const backendURL = "http://localhost:8000"; // Update if backend URL changes

  // Function to handle file uploads
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setIsProcessing(true);

    try {
      const response = await fetch(`${backendURL}/upload/`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        setUploadedImage(data.annotated_image);
        setExtractedData(data.data); // Assuming backend returns structured data
      } else {
        console.error("Error:", data.message);
        setExtractedData({ error: `Error: ${data.message}` });
      }
    } catch (error) {
      console.error("Error connecting to backend:", error);
      setExtractedData({ error: "Error connecting to backend." });
    } finally {
      setIsProcessing(false);
    }
  };

  // Function to capture image from webcam and process it
  const captureWithWebcam = async () => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    setIsProcessing(true);

    try {
      const response = await fetch(`${backendURL}/process-frame/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ frame: imageSrc.split(",")[1] }), // Send base64 data
      });
      const data = await response.json();
      if (response.ok) {
        setUploadedImage(data.annotated_image);
        setExtractedData(data.data); // Assuming backend returns structured data
      } else {
        console.error("Error:", data.message);
        setExtractedData({ error: `Error: ${data.message}` });
      }
    } catch (error) {
      console.error("Error connecting to backend:", error);
      setExtractedData({ error: "Error connecting to backend." });
    } finally {
      setIsProcessing(false);
      setShowWebcam(false);
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center">ID Card Scanner</h1>

      {/* File Upload Section */}
      <div className="mt-4">
        <label htmlFor="fileUpload" className="form-label">
          Upload an Image or PDF of the ID Card
        </label>
        <input
          type="file"
          id="fileUpload"
          accept="image/*,application/pdf"
          className="form-control"
          onChange={handleFileUpload}
        />
      </div>

      {/* Display Uploaded Image */}
      {uploadedImage}

      {/* Extracted Data */}
      {isProcessing ? (
        <div className="alert alert-info mt-4">Processing the image...</div>
      ) : (
        Object.keys(extractedData).length > 0 && (
          <div className="mt-4">
            <h5>Extracted Data:</h5>
            <form>
              {Object.entries(extractedData).map(([key, value]) => (
                <div className="mb-3" key={key}>
                  <label htmlFor={key} className="form-label">
                    {key.replace(/_/g, " ").toUpperCase()}
                  </label>
                  <input
                    type="text"
                    id={key}
                    className="form-control"
                    value={value}
                    readOnly
                  />
                </div>
              ))}
            </form>
          </div>
        )
      )}

      {/* Webcam Section */}
      <div className="text-center mt-4">
        <button className="btn btn-primary" onClick={() => setShowWebcam(true)}>
          Scan with Webcam
        </button>
      </div>

      {showWebcam && (
        <div className="text-center mt-4">
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            width={400}
          />
          <div className="mt-3">
            <button className="btn btn-success" onClick={captureWithWebcam}>
              Capture and Process
            </button>
            <button
              className="btn btn-danger ms-2"
              onClick={() => setShowWebcam(false)}
            >
              Close Webcam
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default IdCardScanner;
