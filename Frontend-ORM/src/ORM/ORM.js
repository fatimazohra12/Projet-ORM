import React, { useState, useRef } from "react";
import Tesseract from "tesseract.js";
// import pdfjsLib from "pdfjs-dist";
import Webcam from "react-webcam";
import "bootstrap/dist/css/bootstrap.min.css";
import { getDocument } from "pdfjs-dist";

const IdCardScanner = () => {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [extractedText, setExtractedText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showWebcam, setShowWebcam] = useState(false);
  const webcamRef = useRef(null);

  // Function to process PDF files and extract an image from the first page
  const extractPageAsImage = async (file) => {
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
  
    return new Promise((resolve, reject) => {
      reader.onload = async (e) => {
        const typedArray = new Uint8Array(e.target.result);
        const pdf = await getDocument(typedArray).promise;
        const page = await pdf.getPage(1);
  
        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
  
        await page.render({ canvasContext: context, viewport }).promise;
        resolve(canvas.toDataURL("image/jpeg"));
      };
  
      reader.onerror = () => reject("Error reading PDF file.");
    });
  };
  

  // Function to extract text from images using Tesseract.js
  const extractTextFromImage = (imageSrc) => {
    setIsProcessing(true);

    const img = new Image();
    img.src = imageSrc;

    img.onload = () => {
      Tesseract.recognize(imageSrc, "eng", {
        logger: (m) => console.log(m),
      })
        .then(({ data: { text } }) => {
          setExtractedText(text.trim());
        })
        .catch((error) => console.error("OCR Error:", error))
        .finally(() => setIsProcessing(false));
    };

    img.onerror = () => {
      console.error("Error loading image.");
      setIsProcessing(false);
    };
  };

  // Function to handle file uploads (image or PDF)
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type === "application/pdf") {
      const imageDataUrl = await extractPageAsImage(file);
      setUploadedImage(imageDataUrl);
      extractTextFromImage(imageDataUrl);
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target.result);
        extractTextFromImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Function to capture image from webcam and process it
  const captureWithWebcam = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setUploadedImage(imageSrc);
    extractTextFromImage(imageSrc);
    setShowWebcam(false);
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
      {uploadedImage && (
        <div className="text-center mt-4">
          <h5>Uploaded Image:</h5>
          <img
            src={uploadedImage}
            alt="Uploaded ID Card"
            style={{ maxWidth: "100%", height: "auto" }}
          />
        </div>
      )}

      {/* Extracted Text */}
      {isProcessing ? (
        <div className="alert alert-info mt-4">Processing the image...</div>
      ) : (
        extractedText && (
          <div className="alert alert-success mt-4">
            <h5>Extracted Text:</h5>
            <pre>{extractedText}</pre>
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
