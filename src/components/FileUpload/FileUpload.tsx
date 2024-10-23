import { ChangeEvent, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Upload } from "lucide-react"

interface FileUploadProps {
    onFileUpload: (files: File[]) => void
    onFileDelete: (index: number) => void
    maxFileSize?: number // in MB
    acceptedFileTypes?: string[]
    uploadedFiles: File[]
}

export default function FileUpload({
    onFileUpload,
    onFileDelete,
    maxFileSize = 100,
    acceptedFileTypes = ['.pdf', '.jpg', '.jpeg', '.png'],
    uploadedFiles
}: FileUploadProps) {
    const [error, setError] = useState<string | null>(null)

    const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        const validFiles = files.filter(file => {
            if (file.size > maxFileSize * 1024 * 1024) {
                setError(`File ${file.name} is too large. Maximum size is ${maxFileSize}MB.`)
                return false
            }
            if (!acceptedFileTypes.some(type => file.name.endsWith(type))) {
                setError(`File ${file.name} is not an accepted file type.`)
                return false
            }
            return true
        })

        onFileUpload(validFiles)
    }

    return (
        <div className="space-y-4">
            <Input
                data-testid="fileUpload"
                id="fileUpload"
                type="file"
                accept={acceptedFileTypes.join(',')}
                multiple
                onChange={handleFileUpload}
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            {uploadedFiles.length > 0 && (
                <ul className="space-y-2">
                    {uploadedFiles.map((file, index) => (
                        <li key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                            <span className="flex items-center">
                                <Upload className="mr-2 h-4 w-4 text-gray-400" />
                                {file.name}
                            </span>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => onFileDelete(index)}
                            >
                                Delete
                            </Button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}