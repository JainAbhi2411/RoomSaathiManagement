import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Download, FileText, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CSVUploadProps {
  title: string;
  description: string;
  templateHeaders: string[];
  templateFileName: string;
  onUpload: (data: any[]) => Promise<{ success: boolean; errors?: string[] }>;
  validateRow?: (row: any, index: number) => string | null;
}

export default function CSVUpload({
  title,
  description,
  templateHeaders,
  templateFileName,
  onUpload,
  validateRow,
}: CSVUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    success: boolean;
    message: string;
    errors?: string[];
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const downloadTemplate = () => {
    const csvContent = templateHeaders.join(',') + '\n';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = templateFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    toast({
      title: 'Template Downloaded',
      description: 'CSV template has been downloaded successfully.',
    });
  };

  const parseCSV = (text: string): any[] => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim());
    const data: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const row: any = {};
      
      headers.forEach((header, index) => {
        let value = values[index] || '';
        
        // Handle boolean values
        if (value.toLowerCase() === 'true') value = 'true';
        if (value.toLowerCase() === 'false') value = 'false';
        
        // Handle arrays (comma-separated values in quotes or brackets)
        if (value.startsWith('[') && value.endsWith(']')) {
          value = value.slice(1, -1).split(';').map(v => v.trim()).filter(v => v);
        }
        
        row[header] = value;
      });
      
      data.push(row);
    }

    return data;
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile.name.endsWith('.csv')) {
      toast({
        title: 'Invalid File',
        description: 'Please upload a CSV file.',
        variant: 'destructive',
      });
      return;
    }

    setFile(selectedFile);
    setUploadResult(null);
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setUploadResult(null);

    try {
      const text = await file.text();
      const data = parseCSV(text);

      if (data.length === 0) {
        setUploadResult({
          success: false,
          message: 'No data found in CSV file.',
        });
        setUploading(false);
        return;
      }

      // Validate rows if validator provided
      const errors: string[] = [];
      if (validateRow) {
        data.forEach((row, index) => {
          const error = validateRow(row, index);
          if (error) {
            errors.push(`Row ${index + 2}: ${error}`);
          }
        });
      }

      if (errors.length > 0) {
        setUploadResult({
          success: false,
          message: `Found ${errors.length} validation error(s).`,
          errors: errors.slice(0, 10), // Show first 10 errors
        });
        setUploading(false);
        return;
      }

      // Upload data
      const result = await onUpload(data);

      if (result.success) {
        setUploadResult({
          success: true,
          message: `Successfully uploaded ${data.length} record(s).`,
        });
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        toast({
          title: 'Upload Successful',
          description: `${data.length} record(s) have been imported.`,
        });
      } else {
        setUploadResult({
          success: false,
          message: 'Upload failed. Please check the errors below.',
          errors: result.errors,
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadResult({
        success: false,
        message: 'An error occurred while processing the file.',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Download Template */}
        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">CSV Template</p>
              <p className="text-sm text-muted-foreground">
                Download the template to see required format
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={downloadTemplate}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>

        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
            className="hidden"
          />
          
          <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          
          {file ? (
            <div className="space-y-2">
              <p className="font-medium">{file.name}</p>
              <p className="text-sm text-muted-foreground">
                {(file.size / 1024).toFixed(2)} KB
              </p>
              <div className="flex gap-2 justify-center mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFile(null);
                    setUploadResult(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                >
                  Remove
                </Button>
                <Button
                  size="sm"
                  onClick={handleUpload}
                  disabled={uploading}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="font-medium">Drag and drop your CSV file here</p>
              <p className="text-sm text-muted-foreground">or</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                Browse Files
              </Button>
            </div>
          )}
        </div>

        {/* Upload Result */}
        {uploadResult && (
          <Alert variant={uploadResult.success ? 'default' : 'destructive'}>
            <div className="flex items-start gap-3">
              {uploadResult.success ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5" />
              )}
              <div className="flex-1">
                <AlertDescription>
                  <p className="font-medium mb-2">{uploadResult.message}</p>
                  {uploadResult.errors && uploadResult.errors.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <p className="text-sm font-medium">Errors:</p>
                      <ul className="text-sm list-disc list-inside space-y-1">
                        {uploadResult.errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                      {uploadResult.errors.length >= 10 && (
                        <p className="text-sm italic mt-2">
                          Showing first 10 errors...
                        </p>
                      )}
                    </div>
                  )}
                </AlertDescription>
              </div>
            </div>
          </Alert>
        )}

        {/* Instructions */}
        <div className="text-sm text-muted-foreground space-y-2 p-4 bg-muted/50 rounded-lg">
          <p className="font-medium">Instructions:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Download the CSV template to see the required format</li>
            <li>Fill in your data following the template structure</li>
            <li>For array fields (like amenities), separate values with semicolons (;)</li>
            <li>Use 'true' or 'false' for boolean fields</li>
            <li>Save the file as CSV format</li>
            <li>Upload the file using the area above</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
