import { Upload, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { api } from '@/utils/api';

interface Props {
  value: string;
  onChange: (url: string) => void;
}

export default function ImageUpload({ value, onChange }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await api.uploadImage(file);
      onChange(result.url);
    } catch (error) {
      alert('图片上传失败，请重试');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    onChange('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
      />
      {value ? (
        <div className="relative rounded-xl overflow-hidden group">
          <img src={value} alt="封面预览" className="w-full h-48 object-cover" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
            <button
              onClick={handleRemove}
              className="opacity-0 group-hover:opacity-100 bg-white/90 hover:bg-white p-2 rounded-full transition-all duration-200"
            >
              <X className="w-4 h-4 text-brown" />
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full h-48 border-2 border-dashed border-primary/30 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-primary/60 hover:bg-primary/5 transition-all duration-200 disabled:opacity-50"
        >
          <Upload className="w-8 h-8 text-primary/50" />
          <span className="text-sm text-brown-light">
            {uploading ? '上传中...' : '点击上传封面图'}
          </span>
        </button>
      )}
    </div>
  );
}
