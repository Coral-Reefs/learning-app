import { X } from "lucide-react";
import React, { useState } from "react";

type Props = {
  imageUrl: string;
  altText: string;
  content?: string;
};

const ZoomableImage = ({ imageUrl, altText, content }: Props) => {
  const [isZoomed, setIsZoomed] = useState(false);

  const handleImageClick = () => {
    setIsZoomed(true);
  };

  const handleCloseClick = () => {
    setIsZoomed(false);
  };

  return (
    <>
      <div className="relative w-full h-full overflow-hidden rounded-lg">
        <div
          className="absolute w-full h-full  bg-cover bg-center bg-no-repeat inset-0 filter blur-lg bg-blend-multiply scale-110 bg-black/5"
          style={{ backgroundImage: `url('${imageUrl}')` }}
        />
        <img
          src={imageUrl}
          alt={altText}
          className="cursor-pointer relative z-10 min-w-40 max-w-80 max-h-96 object-contain w-full h-full rounded-lg"
          onClick={handleImageClick}
        />
      </div>
      {isZoomed && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex flex-col items-center justify-center z-50 text-white"
          onClick={handleCloseClick}
        >
          <X className="absolute inset-y-5 right-5 cursor-pointer" />
          <img
            src={imageUrl}
            alt={altText}
            className="transform transition-transform duration-600 ease-in-out max-w-[60%] max-h-[80%]"
          />
          {content && <p className="my-5 max-w-80">{content}</p>}
        </div>
      )}
    </>
  );
};

export default ZoomableImage;
