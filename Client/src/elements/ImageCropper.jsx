import { Input } from "../components/ui/input"
import { useState } from "react"

const ImageCropper = () => {
  const [avatarSrc, setAvatarSrc] = useState("")

  const onSelectFile = (e) => {
    const file = e.target.files?.[0]
    if(!file) return;

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      const imageUrl = reader.result?.toString() || "";
      setAvatarSrc(imageUrl)
    })
    reader.readAsDataURL(file)
  }


  return (
    <div>
      <Input 
        type="file"
        accept="image/*"
        onChange={onSelectFile}
        className="text-white"
      />
    </div>
  )
}

export default ImageCropper