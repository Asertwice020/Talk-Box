import { useState } from "react";
import ImageCropper from "./ImageCropper";

const AvatarCroppingPopup = ({ avatarSrc, onClose, onCropComplete }) => {
  const [isCropping, setIsCropping] = useState(false);

  const handleCropComplete = () => {
    setIsCropping(false);
    console.log(`hell owrlld`)
    // onCropComplete(); // This function should trigger the backend API call
  };

  return (
    <div className="popup-container">
      <header>
        <h2>Crop Avatar</h2>
        <button onClick={onClose}>Close</button>
      </header>
      <ImageCropper src={avatarSrc} onCropComplete={handleCropComplete} />
      <button onClick={handleCropComplete}>OK</button>
    </div>
  );
};

export default AvatarCroppingPopup;