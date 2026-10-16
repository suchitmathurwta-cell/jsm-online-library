import React from 'react';
import ReaderPage from './ReaderPage';

/**
 * DedicatedReaderPage
 * Delegates to the full-featured online PDF reader (HikmahPdfReader via ReaderPage).
 */
export default function DedicatedReaderPage(props) {
  return <ReaderPage {...props} />;
}
