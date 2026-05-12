import { useState, useEffect } from "react";

export function useImagePreloader(imageSrc: string): boolean {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = imageSrc;

    if (img.complete) {
      setIsLoaded(true);
      return;
    }

    const handleLoad = () => setIsLoaded(true);
    const handleError = () => setIsLoaded(true);

    img.addEventListener("load", handleLoad);
    img.addEventListener("error", handleError);

    const timeout = setTimeout(() => setIsLoaded(true), 3000);

    return () => {
      img.removeEventListener("load", handleLoad);
      img.removeEventListener("error", handleError);
      clearTimeout(timeout);
    };
  }, [imageSrc]);

  return isLoaded;
}
