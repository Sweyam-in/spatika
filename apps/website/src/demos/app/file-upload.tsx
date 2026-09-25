import { FileUpload, fileKey } from "@spatika/react";
import { useState } from "react";

export default function Demo() {
  const [files, setFiles] = useState<File[]>([]);
  // Your upload code reports progress per file; here every file sits at 60%.
  const progress = Object.fromEntries(files.map((file) => [fileKey(file), 60]));
  return (
    <FileUpload
      className="w-full max-w-md"
      value={files}
      onValueChange={setFiles}
      accept="image/*,.pdf"
      maxSize={10 * 1024 * 1024}
      maxFiles={5}
      progress={progress}
    />
  );
}
