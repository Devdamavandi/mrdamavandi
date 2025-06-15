


'use client'
import { Editor } from '@tinymce/tinymce-react';
import { useRef, useState } from 'react';

export default function RichTextEditor({ value, onChange }: {
  value: string;
  onChange: (content: string) => void;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const editorRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isReady, setIsReady] = useState(false);

  return (
    <Editor
      apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
      onInit={(_, editor) => {
        editorRef.current = editor;
        setIsReady(true);
      }}
      value={value}
      onEditorChange={onChange}
      init={{
        height: 400,
        width: 700,
        menubar: true,
        plugins: [
          'advlist autolink lists link image charmap print preview anchor',
          'searchreplace visualblocks code fullscreen',
          'insertdatetime media table paste code help wordcount',
          'media',
          'codesample',
          'emoticons',
          'quickbars'
        ],
        toolbar: 'full',
        automatic_uploads: true,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        images_upload_handler: async (blobInfo, progress) => {
          try {
            // 1. Prepare the file for upload
            const file = new File([blobInfo.blob()], blobInfo.filename(), {
              type: blobInfo.blob().type
            });

            // 2. Create FormData
            const formData = new FormData();
            formData.append('file', file);

            // 3. Upload to your API endpoint
            const response = await fetch('/dashboard/products/api/images/upload', {
              method: 'POST',
              body: formData
            });

            if (!response.ok) {
              throw new Error('Upload failed');
            }

            // 4. Get the URL from response
            const data = await response.json();
            return data.url; // Return the URL directly
            
          } catch (error) {
            console.error('Upload error:', error);
            throw new Error('Image upload failed. Please try again.');
          }
        },
        file_picker_types: 'image media',
        content_style: `
          body { font-family:Helvetica,Arial,sans-serif; font-size:14px; line-height:1.6; }
          img { max-width: 100%; height: auto; }
          iframe { max-width: 100%; }
        `,
      }}
    />
  );
}