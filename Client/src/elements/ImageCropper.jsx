import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useState, useRef } from "react";
import "react-image-crop/dist/ReactCrop.css";
import ReactCrop, { centerCrop, makeAspectCrop } from "react-image-crop";
// import { SlPencil } from "react-icons/sl";

const ImageCropper = () => {
  const [avatarSrc, setAvatarSrc] = useState("");
  const [crop, setCrop] = useState();
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const ASPECT_RATIO = 1;
  const MIN_DIMENSION = 150;

  const onSelectFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      const imageElement = new Image();
      const imageUrl = reader?.result?.toString() || "";
      imageElement.src = imageUrl;

      imageElement.addEventListener("load", (e) => {
        if (error) setError("")
        const { naturalWidth, naturalHeight } = e.currentTarget;
        if (naturalWidth < MIN_DIMENSION || naturalHeight < MIN_DIMENSION) {
          setError("Image Must Be At least 150 x 150 Pixel!");
          return setAvatarSrc("");
        }
        setAvatarSrc(imageUrl);
      });
    });

    reader.readAsDataURL(file);
  };

  const handleClick = () => {
    fileInputRef.current.click();
  };

  const onImageLoad = (e) => {
    const { width, height } = e.currentTarget;
    const cropWidthInPercent = (MIN_DIMENSION / width) * 100;

    const crop = makeAspectCrop(
      {
        unit: "%",
        width: cropWidthInPercent,
      },
      ASPECT_RATIO,
      width,
      height
    );
    const centeredCrop = centerCrop(crop, width, height);
    setCrop(centeredCrop);
  };

  return (
    <div>
      <Button
        onClick={handleClick}
        className="rounded flex justify-center"
      >
        {/* <SlPencil /> */}
        Change Avatar
      </Button>
      <Input
        type="file"
        accept="image/*"
        onChange={onSelectFile}
        className="text-white hidden"
        ref={fileInputRef}
      />

      {error && <p className="text-red-400">{error}</p>}

      {avatarSrc && (
        <div className="flex flex-col items-center">
          <ReactCrop
            crop={crop}
            onChange={(percentCrop) => setCrop(percentCrop)}
            circularCrop
            keepSelection
            aspect={ASPECT_RATIO}
            minWidth={MIN_DIMENSION}
          >
            <img src={avatarSrc} alt="upload" onLoad={onImageLoad} />
          </ReactCrop>
        </div>
      )}
    </div>
  );
};

export default ImageCropper;
