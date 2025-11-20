import React from 'react';
import { X, Download, GraduationCap } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import logoImage from '../../logo.png';

const CourseCertificate = ({ course, studentName, onClose }) => {
  const certificateRef = React.useRef(null);

  const handleDownloadPDF = async () => {
    if (!certificateRef.current) return;

    try {
      // Create canvas from the certificate
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true
      });

      // Convert canvas to image
      const imgData = canvas.toDataURL('image/png');

      // Create PDF
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgScaledWidth = imgWidth * ratio;
      const imgScaledHeight = imgHeight * ratio;
      const xOffset = (pdfWidth - imgScaledWidth) / 2;
      const yOffset = (pdfHeight - imgScaledHeight) / 2;

      pdf.addImage(imgData, 'PNG', xOffset, yOffset, imgScaledWidth, imgScaledHeight);
      pdf.save(`Certificate_${course.title.replace(/\s+/g, '_')}_${studentName.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to download certificate. Please try again.');
    }
  };

  const formatDate = (date) => {
    if (!date) return new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '2rem'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '2rem',
          right: '2rem',
          background: 'rgba(255, 255, 255, 0.2)',
          border: 'none',
          color: 'white',
          fontSize: '1.5rem',
          cursor: 'pointer',
          padding: '0.75rem',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background-color 0.3s',
          zIndex: 10000
        }}
        onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'}
        onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
      >
        <X size={24} />
      </button>

      {/* Download Button */}
      <button
        onClick={handleDownloadPDF}
        style={{
          position: 'absolute',
          top: '2rem',
          right: '5rem',
          background: 'rgba(34, 197, 94, 0.9)',
          border: 'none',
          color: 'white',
          fontSize: '1rem',
          cursor: 'pointer',
          padding: '0.75rem 1.5rem',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          transition: 'background-color 0.3s',
          zIndex: 10000,
          fontWeight: '600'
        }}
        onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(34, 197, 94, 1)'}
        onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(34, 197, 94, 0.9)'}
      >
        <Download size={18} />
        Download PDF
      </button>

      {/* Certificate */}
      <div
        ref={certificateRef}
        style={{
          width: '100%',
          maxWidth: '900px',
          aspectRatio: '4/3',
          backgroundColor: '#ffffff',
          border: '8px solid #d4af37',
          borderRadius: '8px',
          padding: '2.5rem',
          paddingBottom: '2.5rem',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Decorative Border Pattern */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            border: '2px solid #d4af37',
            margin: '1rem',
            borderRadius: '4px',
            pointerEvents: 'none'
          }}
        />

        {/* Watermark Stamp in Background */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%) rotate(-45deg)',
            opacity: 0.15,
            pointerEvents: 'none',
            zIndex: 0
          }}
        >
          <div
            style={{
              width: '450px',
              height: '450px',
              border: '10px solid #d4af37',
              borderRadius: '50%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(212, 175, 55, 0.05)',
              boxShadow: '0 0 20px rgba(212, 175, 55, 0.2)'
            }}
          >
            <div
              style={{
                fontSize: '5rem',
                fontWeight: 'bold',
                color: '#d4af37',
                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.1)'
              }}
            >
              ✓
            </div>
            <div
              style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                color: '#1e40af',
                marginTop: '1rem',
                textShadow: '1px 1px 2px rgba(0, 0, 0, 0.1)'
              }}
            >
              CERTIFIED
            </div>
          </div>
        </div>

        {/* Content */}
        <div
          style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            textAlign: 'center',
            position: 'relative',
            zIndex: 1
          }}
        >
          {/* Logo/Header */}
          <div style={{ marginBottom: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ marginBottom: '1rem' }}>
              <img
                src={logoImage}
                alt="E-Learning Logo"
                style={{
                  height: '80px',
                  width: 'auto',
                  objectFit: 'contain',
                  maxWidth: '200px'
                }}
                onError={(e) => {
                  // Fallback to text if logo not found
                  e.target.style.display = 'none';
                  const fallback = e.target.nextSibling;
                  if (fallback) {
                    fallback.style.display = 'block';
                  }
                }}
              />
              <div
                style={{
                  fontSize: '2.5rem',
                  fontWeight: 'bold',
                  color: '#1e40af',
                  marginTop: '0.5rem',
                  letterSpacing: '2px',
                  display: 'none'
                }}
              >
                <GraduationCap size={20} style={{ display: 'inline-block', marginRight: '8px', verticalAlign: 'middle' }} />
                E-LEARNING
              </div>
            </div>
            <div
              style={{
                fontSize: '1rem',
                color: '#6b7280',
                textTransform: 'uppercase',
                letterSpacing: '3px',
                fontWeight: '600'
              }}
            >
              Certificate of Completion
            </div>
          </div>

          {/* Main Content */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '100%', minHeight: 0 }}>
            <div
              style={{
                fontSize: '1.1rem',
                color: '#4b5563',
                marginBottom: '1.5rem',
                lineHeight: '1.8'
              }}
            >
              This is to certify that
            </div>

            <div
              style={{
                fontSize: '2.5rem',
                fontWeight: 'bold',
                color: '#1e40af',
                marginBottom: '1.5rem',
                padding: '1rem 2rem',
                borderBottom: '3px solid #d4af37',
                borderTop: '3px solid #d4af37',
                display: 'inline-block',
                minWidth: '400px'
              }}
            >
              {studentName || 'Student Name'}
            </div>

            <div
              style={{
                fontSize: '1.1rem',
                color: '#4b5563',
                marginBottom: '0.75rem',
                lineHeight: '1.8'
              }}
            >
              has successfully completed the course
            </div>

            <div
              style={{
                fontSize: '1.8rem',
                fontWeight: '600',
                color: '#1e40af',
                marginBottom: '0.75rem',
                padding: '0.5rem 1rem'
              }}
            >
              "{course?.title || 'Course Title'}"
            </div>

            <div
              style={{
                fontSize: '1rem',
                color: '#6b7280',
                marginBottom: '1.5rem',
                fontStyle: 'italic'
              }}
            >
              under the guidance of {course?.teacher?.fullName || 'Course Instructor'}
            </div>

            <div
              style={{
                fontSize: '1rem',
                color: '#6b7280',
                marginBottom: '1rem'
              }}
            >
              Completed on {formatDate(new Date())}
            </div>
          </div>

          {/* Official Stamp/Seal - Bottom Right Corner */}
          <div
            style={{
              position: 'absolute',
              bottom: '1.5rem',
              right: '1.5rem',
              textAlign: 'center',
              zIndex: 10
            }}
          >
            {/* Official Stamp/Seal */}
            <div
              style={{
                width: '110px',
                height: '110px',
                margin: '0 auto',
                border: '4px solid #d4af37',
                borderRadius: '50%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(212, 175, 55, 0.1)',
                position: 'relative',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
              }}
            >
              {/* Inner circle */}
              <div
                style={{
                  width: '90px',
                  height: '90px',
                  border: '2px solid #d4af37',
                  borderRadius: '50%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(255, 255, 255, 0.9)'
                }}
              >
                {/* Stamp content */}
                <div
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    color: '#d4af37',
                    marginBottom: '0.25rem'
                  }}
                >
                  ✓
                </div>
                <div
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 'bold',
                    color: '#1e40af',
                    textAlign: 'center',
                    lineHeight: '1.2',
                    padding: '0 0.5rem'
                  }}
                >
                  VERIFIED
                </div>
                <div
                  style={{
                    fontSize: '0.6rem',
                    color: '#6b7280',
                    textAlign: 'center',
                    marginTop: '0.25rem'
                  }}
                >
                  E-LEARNING
                </div>
              </div>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.5rem' }}>
              Official Seal
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCertificate;

