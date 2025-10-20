import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Music, FileText, Upload } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';

// Define the schema for form validation
const uploadSchema = z.object({
  audioFile: z.instanceof(FileList).refine(files => files.length > 0, "Audio file is required."),
  lrcFile: z.instanceof(FileList).refine(files => files.length > 0, "LRC file is required."),
});

type UploadFormValues = z.infer<typeof uploadSchema>;

interface UploadFormProps {
  onUploadSuccess: () => void;
}

// IMPORTANT: Use the same API URL for uploads
const WORKER_API_URL = import.meta.env.VITE_WORKER_API_URL || 'https://player.tuple2.dpdns.org/'; 

const UploadForm: React.FC<UploadFormProps> = ({ onUploadSuccess }) => {
  const form = useForm<UploadFormValues>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      audioFile: undefined,
      lrcFile: undefined,
    },
  });

  const onSubmit = async (data: UploadFormValues) => {
    const audioFile = data.audioFile[0];
    const lrcFile = data.lrcFile[0];

    const loadingToastId = showSuccess(`Uploading ${audioFile.name}...`);

    try {
      const formData = new FormData();
      formData.append('audio', audioFile, audioFile.name);
      formData.append('lyrics', lrcFile, lrcFile.name);

      const response = await fetch(WORKER_API_URL, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${response.status} - ${errorText}`);
      }

      showSuccess("Upload successful! Refreshing track list.", { id: loadingToastId });
      
      // Reset form and notify parent component
      form.reset();
      onUploadSuccess();

    } catch (error) {
      console.error("Upload error:", error);
      showError(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <Card className="shadow-lg border-none">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Upload className="w-5 h-5 mr-2 text-primary" />
          上传新曲目
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Audio File Input */}
            <FormField
              control={form.control}
              name="audioFile"
              render={({ field: { value, onChange, ...fieldProps } }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    <Music className="w-4 h-4 mr-2" />
                    音频文件 (.flac, .mp3, etc.)
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...fieldProps}
                      type="file"
                      accept=".flac,.mp3,.wav"
                      onChange={(event) => {
                        onChange(event.target.files);
                      }}
                      className="file:text-primary file:font-medium"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* LRC File Input */}
            <FormField
              control={form.control}
              name="lrcFile"
              render={({ field: { value, onChange, ...fieldProps } }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    歌词文件 (.lrc)
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...fieldProps}
                      type="file"
                      accept=".lrc"
                      onChange={(event) => {
                        onChange(event.target.files);
                      }}
                      className="file:text-primary file:font-medium"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? '上传中...' : '开始上传'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default UploadForm;