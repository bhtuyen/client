'use client';

import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { getTableLink } from '@/lib/utils';
import { Row } from '@tanstack/react-table';

interface QRCodeTableProps<T> {
  row: Row<T>;
}

export default function QRCodeTable<T>({ row }: QRCodeTableProps<T>) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const url = getTableLink({
    token: row.getValue('token'),
    tableNumber: row.getValue('number')
  });
  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, url, (error) => {
        if (error) {
          console.error(error);
        }
        console.log('success!');
      });
    }
  }, []);
  return <canvas ref={canvasRef} />;
}
