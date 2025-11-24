import './UploadFIleButtonStyle.css'
import { type ButtonHTMLAttributes, type InputHTMLAttributes, forwardRef, useRef } from 'react';


interface UploadFileButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  onFilesSelected: (files: File[]) => void;
  multiple?: boolean;
  accept?: string;
  inputProps?: InputHTMLAttributes<HTMLInputElement>;
}

const UploadFileButton = forwardRef<
  HTMLButtonElement,
  UploadFileButtonProps
>(
  (
    {
      onFilesSelected,
      multiple = false,
      accept,
      inputProps,
      children,
      ...buttonProps
    },
    ref
  ) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleClick = () => {
      fileInputRef.current?.click();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        onFilesSelected(Array.from(files));
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };

    return (
      <>
        <button
          className="upload-file-button"
          type="button"
          {...buttonProps}
          onClick={handleClick}
          ref={ref}
        >
          {children}
        </button>
        <input
          className="upload-file-button"
          type="file"
          ref={fileInputRef}
          onChange={handleChange}
          multiple={multiple}
          accept={accept}
          style={{ display: 'none' }}
          {...inputProps}
        />
      </>
    );
  }
);

UploadFileButton.displayName = 'UploadFileButton';

export default UploadFileButton;