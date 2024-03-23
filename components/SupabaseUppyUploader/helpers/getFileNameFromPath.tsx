export default function getFileNameFromPath(filePath : string) {
  const filePathParts = filePath.split("/")
  const filePathPartsLen = filePathParts.length;
  return filePathPartsLen > 1 ? filePathParts[filePathPartsLen-1] : filePath;
}