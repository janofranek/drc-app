import React from 'react';
import { Container } from 'react-bootstrap';
import ReactMarkdown from 'react-markdown';
import manualContent from '../assets/manual.md?raw';

const AdminManual = () => {
  return (
    <Container className="mt-4 mb-5 admin-manual">
      <div className="markdown-body shadow-sm p-5 border rounded bg-white">
        <ReactMarkdown>{manualContent}</ReactMarkdown>
      </div>
    </Container>
  );
};

export default AdminManual;
