"use client";

import { ImagePlus, Trash } from "lucide-react";
import Image from "next/image";
import { CldUploadWidget } from "next-cloudinary";
import { useEffect, useState } from "react";
import { Button } from "./button";

interface ImageUploadProps {
  disabled?: boolean;
  onChange: (value: string) => void;
  onRemove: (value: string) => void;
  value: string[];
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  disabled,
  onChange,
  onRemove,
  value,
}) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const onUpload = (result: any) => {
    onChange(result.info.secure_url);
  }

  if (!isMounted) {
    return null;
  }
  
  return (
    <div>
      <div className="mb-4 flex items-center gap-4">
        {value.map((imageUrl) => (
          <div key={imageUrl} className="relative w-[200px] h-[200px] rounded-md overflow-hidden">
            <div className="z-10 absolute top-2 right-2">
              <Button type="button" onClick={() => onRemove(imageUrl)} variant="destructive" size="icon">
                <Trash className="w-4 h-4" />
              </Button>
            </div>
            <Image 
              fill
              className="object-cover"
              src={imageUrl}
              alt="Image preview"
            />
          </div>
        ))}
      </div>
      <CldUploadWidget
        onUpload={onUpload}
        uploadPreset="ixmhdulu"
      >
        {({ open }) => {
          const onClick = () => {
            open();
          }

          return (
            <Button type="button" disabled={disabled} variant="secondary" onClick={onClick}>
              <ImagePlus className="mr-2 h-4 w-4" />
              Upload an Image
            </Button>
          )
        }}
      </CldUploadWidget>
    </div>
  );
}

export default ImageUpload;