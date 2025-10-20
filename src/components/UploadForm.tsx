import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress'; // Import Progress component
import { Music, FileText, Upload } from 'lucide-react';
import { showSuccess, showError, showLoading, dismissToast } from '@/utils/toast';

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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

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

    const loadingToastId = showLoading(`准备上传 ${audioFile.name}...`);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('audio', audioFile, audioFile.name);
      formData.append('lyrics', lrcFile, lrcFile.name);

      const xhr = new XMLHttpRequest();
      
      // Set up progress listener
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percent);
        }
      };

      // Set up load listener (success/failure)
      const responsePromise = new Promise<void>((resolve, reject) => {
        xhr.onload = () => {
          dismissToast(loadingToastId);
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`Upload failed: ${xhr.status} - ${xhr.responseText}`));
          }
        };

        xhr.onerror = () => {
          dismissToast(loadingToastId);
          reject(new Error("Network error or request failed."));
        };
      });

      xhr.open('POST', WORKER_API_URL);
      xhr.send(formData);

      await responsePromise;

      showSuccess("上传成功！正在刷新曲目列表。");
      
      // Reset form and notify parent component
      form.reset();
      onUploadSuccess();

    } catch (error) {
      console.error("Upload error:", error);
      showError(`上传失败: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
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
                      disabled={isUploading}
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
                      disabled={isUploading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Progress Bar Display */}
            {isUploading && (
              <div className="space-y-2 pt-2">
                <p className="text-sm text-muted-foreground">上传进度: {uploadProgress}%</p>
                <Progress value={uploadProgress} className="w-full h-2" />
              </div>
            )}

            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting || isUploading}>
              {isUploading ? `上传中... (${uploadProgress}%)` : '开始上传'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default UploadForm;