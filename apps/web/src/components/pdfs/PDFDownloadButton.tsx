'use client';

import { useState, useEffect } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { trpc } from '@/lib/trpc/provider';
import { InspectionPDF } from './InspectionPDF';
import QRCode from 'qrcode';
import { Button } from '@/components/ui';
import { FileText, Loader2 } from 'lucide-react';

// Fetch logo via server proxy to avoid CORS issues
async function fetchLogoAsBase64(url: string): Promise<string | null> {
  try {
    const response = await fetch(`/api/image-proxy?url=${encodeURIComponent(url)}`);
    if (!response.ok) return null;
    const data = await response.json();
    return data.dataUrl || null;
  } catch (e) {
    console.error('Failed to fetch logo via proxy:', e);
    return null;
  }
}

export function PDFDownloadButton({ orderId }: { orderId: string }) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [trackingUrl, setTrackingUrl] = useState<string>('');
  const [logoBase64, setLogoBase64] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [isPreparingAssets, setIsPreparingAssets] = useState(true);
  
  const { data: publicStatus, isLoading } = trpc.inspection.getPublicStatus.useQuery({ orderId });

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !publicStatus) return;

    const prepareAssets = async () => {
      setIsPreparingAssets(true);
      
      // Generate QR Code
      const url = `${window.location.origin}/tracking/${orderId}`;
      setTrackingUrl(url);
      
      try {
        const qr = await QRCode.toDataURL(url, { width: 300, margin: 2 });
        setQrCodeUrl(qr);
      } catch (e) {
        console.error('QR generation failed', e);
      }

      // Convert logo to base64 via server proxy if exists
      const logoUrl = publicStatus.tenantContact.logo;
      if (logoUrl && logoUrl.startsWith('http')) {
        const base64 = await fetchLogoAsBase64(logoUrl);
        setLogoBase64(base64);
      }
      
      setIsPreparingAssets(false);
    };

    prepareAssets();
  }, [orderId, publicStatus]);

  if (!isClient) return null;

  if (isLoading || !publicStatus || !qrCodeUrl || !trackingUrl || isPreparingAssets) {
    return (
      <Button variant="outline" disabled size="sm">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Preparando PDF...
      </Button>
    );
  }

  // Create modified data with base64 logo
  const pdfData = {
    ...publicStatus,
    tenantContact: {
      ...publicStatus.tenantContact,
      logo: logoBase64 || null, // Use base64 or null if conversion failed
    },
  };

  return (
    <PDFDownloadLink
      document={<InspectionPDF data={pdfData} qrCodeUrl={qrCodeUrl} trackingUrl={trackingUrl} />}
      fileName={`vistoria-${publicStatus.vehicleName}-${publicStatus.status}.pdf`}
    >
      {({ blob, url, loading, error }) => (
        <Button variant="outline" size="sm" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4 font-bold text-red-600" />}
            {loading ? 'Gerando PDF...' : 'Baixar PDF Convite'}
        </Button>
      )}
    </PDFDownloadLink>
  );
}
