import { useCallback, useMemo, useState } from 'react'
import { type FileError, type FileRejection, useDropzone } from 'react-dropzone'

interface FileWithPreview extends File {
  preview?: string
  errors: readonly FileError[]
}

type UseLocalUploadOptions = {
  bucketName?: string // kept for compatibility
  path?: string
  allowedMimeTypes?: string[]
  maxFileSize?: number
  maxFiles?: number
  supabase?: any // ignore
}

const useSupabaseUpload = (options: UseLocalUploadOptions) => {
  const {
    allowedMimeTypes = [],
    maxFileSize = Number.POSITIVE_INFINITY,
    maxFiles = 1,
  } = options

  const [files, setFiles] = useState<FileWithPreview[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [errors, setErrors] = useState<{ name: string; message: string }[]>([])
  const [successes, setSuccesses] = useState<string[]>([])
  const [urls, setUrls] = useState<string[]>([])

  const isSuccess = useMemo(() => {
    return successes.length > 0 && successes.length === files.length;
  }, [successes.length, files.length])

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      const validFiles = acceptedFiles.map((file) => {
          const f = file as FileWithPreview;
          f.preview = URL.createObjectURL(file);
          f.errors = [];
          return f;
        })

      const invalidFiles = fileRejections.map(({ file, errors }) => {
        const f = file as FileWithPreview;
        f.preview = URL.createObjectURL(file);
        f.errors = errors;
        return f;
      })

      setFiles([...validFiles, ...invalidFiles])
    },
    []
  )

  const dropzoneProps = useDropzone({
    onDrop,
    noClick: true,
    accept: allowedMimeTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxSize: maxFileSize,
    maxFiles: maxFiles,
    multiple: maxFiles !== 1,
  })

  const onUpload = useCallback(async () => {
    setLoading(true)
    setErrors([])
    const newUrls: string[] = []
    const newSuccesses: string[] = []

    try {
      for (const file of files) {
        const formData = new FormData()
        formData.append('file', file)
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
        })

        if (!response.ok) throw new Error('Upload failed')
        const data = await response.json()
        newUrls.push(data.url)
        newSuccesses.push(file.name)
      }
      setUrls(newUrls)
      setSuccesses(newSuccesses)
    } catch (err: any) {
      setErrors([{ name: 'upload', message: err.message }])
    } finally {
      setLoading(false)
    }
  }, [files])

  return {
    files,
    setFiles,
    successes,
    isSuccess,
    loading,
    errors,
    setErrors,
    onUpload,
    urls,
    maxFileSize,
    maxFiles,
    allowedMimeTypes,
    ...dropzoneProps,
  }
}

export { useSupabaseUpload }
export type { UseLocalUploadOptions as UseSupabaseUploadOptions }
export type UseSupabaseUploadReturn = ReturnType<typeof useSupabaseUpload>
