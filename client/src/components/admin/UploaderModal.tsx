import React from 'react';
import UploadBookModal from '../UploadBookModal';

export interface UploaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookUploaded?: (book: any) => void;
  onCategoryCreated?: () => void;
  onSubGenreCreated?: () => void;
  categories?: any[];
  lang?: string;
  t?: any;
}

export function UploaderModal(props: UploaderModalProps) {
  return <UploadBookModal {...props} />;
}

export * from '../UploadBookModal';
export default UploadBookModal;
