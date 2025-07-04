"use client"

import { useState, useRef, type DragEvent, type ChangeEvent } from "react"
import { Upload, File, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { getAiResult } from "@/server/ai";

interface FileWithPreview extends File {
  preview?: string
}

export default function DragDropUpload() {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [prompt, setPrompt] = useState<string>("")

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(false)

    const droppedFiles = Array.from(e.dataTransfer.files)
    handleFiles(droppedFiles)
  }

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files)
      handleFiles(selectedFiles)
    }
  }

  const handleFiles = (newFiles: File[]) => {
    const filesWithPreview = newFiles.map((file) => {
      const fileWithPreview = file as FileWithPreview
      if (file.type.startsWith("image/")) {
        fileWithPreview.preview = URL.createObjectURL(file)
      }
      return fileWithPreview
    })

    setFiles((prev) => [...prev, ...filesWithPreview])
  }

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const newFiles = [...prev]
      // Clean up preview URL if it exists
      if (newFiles[index].preview) {
        URL.revokeObjectURL(newFiles[index].preview!)
      }
      newFiles.splice(index, 1)
      return newFiles
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  const onSubmit = async () => {
    if (files.length === 0) return;

    const formData = new FormData();
    formData.append("file", files[0]);
    formData.append("prompt", prompt);

    // console.log("Prompt:", prompt);
    // console.log("File name:", files[0].name);
    // console.log("File type:", files[0].type);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Upload failed:", errorText);
      return;
    }

    const data = await res.json();
    console.log("AI Result:", data?.result?.steps?.[0].text);
  }
  

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-5 items-center">
      <Textarea className="bg-[#303030] text-white max-w-2xl min-h-[50px] max-h-[150px] border-white"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <div className="w-full p-6 space-y-4 border border-white">
        <div className="text-center space-y-2">
          <h2 className="text-2xl text-white font-bold">File Upload</h2>
          <p className="text-white">Drag and drop files here or click to browse</p>
        </div>

        <Card
          className={cn(
            "border border-dashed bg-[#303030] transition-colors cursor-pointer",
            isDragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-muted-foreground/50",
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={openFileDialog}
        >
          <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <Upload
              className={cn("h-12 w-12 mb-4 transition-colors", isDragOver ? "text-primary" : "text-muted-foreground")}
            />
            <div className="space-y-2">
              <p className="text-lg text-white font-medium">{isDragOver ? "Drop files here" : "Choose files or drag and drop"}</p>
              <p className="text-sm text-muted-foreground">Support for single or bulk uploads</p>
            </div>
            <Button variant="outline" className="mt-4" type="button">
              Browse Files
            </Button>
          </CardContent>
        </Card>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileInput}
          className="hidden"
          aria-label="File upload"
        />

        {files.length > 0 && (
          <Card className="bg-[#303030]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium  text-white">Uploaded Files ({files.length})</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    files.forEach((file) => {
                      if (file.preview) {
                        URL.revokeObjectURL(file.preview)
                      }
                    })
                    setFiles([])
                  }}
                >
                  Clear All
                </Button>
              </div>
              <div className="space-y-3">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                    {file.preview ? (
                      <img
                        src={file.preview || "/placeholder.svg"}
                        alt={file.name}
                        className="h-10 w-10 object-cover rounded"
                      />
                    ) : (
                      <File className="h-10 w-10" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{file.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {file.type || "Unknown"}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{formatFileSize(file.size)}</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeFile(index)
                      }}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Remove file</span>
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {files.length > 0 && (
          <div className="flex gap-2">
            <Button className="bg-white hover:bg-zinc-200 text-black flex-1 duration-200 cursor-pointer">
              Upload {files.length} {files.length === 1 ? "File" : "Files"}
            </Button>
            <Button variant="outline" className="bg-white hover:bg-zinc-200 text-black duration-200 cursor-pointer">Cancel</Button>
          </div>
        )}
      </div>
      <Button className="w-[80%] bg-white text-black hover:bg-zinc-200 duration-200 cursor-pointer" onClick={onSubmit}>Submit</Button>
    </div>
  )
}


// "use client";

// import { useRef, useState, type DragEvent, type ChangeEvent } from "react";
// import { Upload, File as FileIcon, X } from "lucide-react";
// import { getAiResult } from "@/server/ai";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Card, CardContent } from "@/components/ui/card";
// import { Textarea } from "@/components/ui/textarea";

// export default function DragDropUpload() {
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const [files, setFiles] = useState<File[]>([]);
//   const [prompt, setPrompt] = useState("");
//   const [response, setResponse] = useState("");
//   const [isDragOver, setIsDragOver] = useState(false);
//   const [loading, setLoading] = useState(false);

//   const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
//     e.preventDefault();
//     setIsDragOver(true);
//   };

//   const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
//     e.preventDefault();
//     setIsDragOver(false);
//   };

//   const handleDrop = (e: DragEvent<HTMLDivElement>) => {
//     e.preventDefault();
//     setIsDragOver(false);
//     const dropped = Array.from(e.dataTransfer.files);
//     setFiles(dropped);
//   };

//   const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files) {
//       setFiles(Array.from(e.target.files));
//     }
//   };

//   const convertFileToBase64 = (file: File): Promise<string> => {
//     return new Promise((resolve, reject) => {
//       const reader = new FileReader();
//       reader.onloadend = () => resolve(reader.result as string);
//       reader.onerror = reject;
//       reader.readAsDataURL(file);
//     });
//   };

//   const onSubmit = async () => {
//     if (files.length === 0 || !prompt.trim()) return;

//     const file = files[0];
//     setLoading(true);

//     try {
//       const base64WithPrefix = await convertFileToBase64(file);
//       const base64 = base64WithPrefix.split(",")[1]; // strip prefix
//       const mimeType = file.type;

//       const formData = new FormData();
//       formData.append("prompt", prompt);
//       formData.append("base64", base64);
//       formData.append("mimeType", mimeType);

//       const result = await getAiResult(formData);
//       setResponse(result);
//     } catch (error) {
//       console.error("Upload error:", error);
//       setResponse("❌ Something went wrong. Check console for details.");
//     } finally {
//       setLoading(false);
//     }

//   };

//   return (
//     <div className="max-w-2xl mx-auto flex flex-col gap-4">
//       <Textarea
//         className="bg-zinc-900 text-white"
//         placeholder="Enter your prompt here"
//         value={prompt}
//         onChange={(e) => setPrompt(e.target.value)}
//       />

//       <div
//         className={`border-2 border-dashed p-6 text-center bg-zinc-800 text-white transition cursor-pointer ${isDragOver ? "bg-zinc-700 border-white" : ""
//           }`}
//         onDragOver={handleDragOver}
//         onDragLeave={handleDragLeave}
//         onDrop={handleDrop}
//         onClick={() => fileInputRef.current?.click()}
//       >
//         <Upload className="mx-auto mb-2" />
//         <p>{isDragOver ? "Drop the file here" : "Drag and drop or click to upload"}</p>
//       </div>

//       <input
//         ref={fileInputRef}
//         type="file"
//         onChange={handleFileInput}
//         className="hidden"
//       />

//       {files.length > 0 && (
//         <Card>
//           <CardContent className="flex items-center justify-between p-4">
//             <div>
//               <p className="text-white">{files[0].name}</p>
//               <Badge>{files[0].type || "unknown"}</Badge>
//             </div>
//             <Button
//               size="sm"
//               variant="outline"
//               onClick={() => setFiles([])}
//               className="text-red-500 border-red-500"
//             >
//               <X className="w-4 h-4" />
//             </Button>
//           </CardContent>
//         </Card>
//       )}

//       <Button onClick={onSubmit} disabled={loading} className="bg-white text-black hover:bg-gray-200">
//         {loading ? "Generating..." : "Submit"}
//       </Button>

//       {response && (
//         <Card className="bg-zinc-900 text-white p-4 whitespace-pre-wrap">
//           <CardContent>
//             <h2 className="text-lg font-semibold mb-2">AI Response:</h2>
//             <p>{response}</p>
//           </CardContent>
//         </Card>
//       )}
//     </div>
//   );
// }
