export const convertFileToBase64 = (file: File) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result); // Resolve the promise with the Base64 string
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file); // Start reading the file as a Base64 encoded string
  });
};

export const convertBlobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert blob to base64 string'));
      }
    };
    reader.onerror = (error) => {
      reject(error);
    };
    reader.readAsDataURL(blob); // Read the blob as a data URL (base64)
  });
};


