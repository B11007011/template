"use client";

import React from "react";
import QRCode from "react-qr-code";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Smartphone } from "lucide-react";

interface QRCodeModalProps {
  open: boolean;
  onClose: () => void;
  url: string;
  title: string;
  description?: string;
  daysRemaining?: number;
  children?: React.ReactNode;
}

export default function QRCodeModal({ open, onClose, url, title, description, daysRemaining, children }: QRCodeModalProps) {
  const handleDownloadQR = () => {
    // Create a canvas from the QR code
    const svg = document.getElementById("download-qr-code");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    
    // Create an image to draw on canvas
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      
      // Download the PNG file
      const downloadLink = document.createElement("a");
      downloadLink.download = `${title.replace(/\s+/g, "-").toLowerCase()}-qr-code.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    
    // Load image data
    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description || "Scan this QR code with your mobile device to download the app"}
          </DialogDescription>
        </DialogHeader>
        
        {children || (
          <div className="flex flex-col items-center justify-center p-4">
            <div className="bg-white p-4 rounded-lg">
              <QRCode
                id="download-qr-code"
                value={url}
                size={256}
                level="H"
                className="h-64 w-64"
              />
            </div>
            
            <div className="mt-4 text-sm text-gray-500 text-center">
              {daysRemaining !== undefined && (
                <p className={`mb-2 ${
                  daysRemaining <= 5 ? 'text-red-600 font-medium' : 
                  daysRemaining <= 10 ? 'text-orange-600' : 'text-blue-600'
                }`}>
                  {daysRemaining > 0 
                    ? `⚠️ Files expire in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}` 
                    : '⚠️ Files expired (pending deletion)'}
                </p>
              )}
              <p className="flex items-center justify-center gap-1">
                <Smartphone className="h-4 w-4" />
                Scan with your phone's camera
              </p>
              <p className="text-xs mt-1">{url}</p>
            </div>
          </div>
        )}
        
        <div className="flex justify-between mt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button 
            onClick={handleDownloadQR} 
            className="bg-[#8c52ff] hover:bg-[#7a45e0]"
          >
            <Download className="mr-2 h-4 w-4" />
            Download QR Code
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 