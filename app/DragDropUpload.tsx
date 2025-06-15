"use client"

import { useState, useRef, type DragEvent, type ChangeEvent } from "react"
import { Upload, File, X } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface FileWithPreview extends File {
  preview?: string
}

export default function DragDropUpload() {
  const [files, setFiles] = useState<FileWithPreview[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  return (
    <div className="w-full max-w-2xl mx-auto p-6 space-y-4 border-2">
      <div className="text-center space-y-2">
        <h2 className="text-2xl text- font-bold">File Upload</h2>
        <p className="text-muted-foreground">Drag and drop files here or click to browse</p>
      </div>

      <Card
        className={cn(
          "border-2 border-dashed transition-colors cursor-pointer",
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
            <p className="text-lg font-medium">{isDragOver ? "Drop files here" : "Choose files or drag and drop"}</p>
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
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Uploaded Files ({files.length})</h3>
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
                    <File className="h-10 w-10 text-muted-foreground" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{file.name}</p>
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
          <Button className="flex-1">
            Upload {files.length} {files.length === 1 ? "File" : "Files"}
          </Button>
          <Button variant="outline">Cancel</Button>
        </div>
      )}
    </div>
  )
}