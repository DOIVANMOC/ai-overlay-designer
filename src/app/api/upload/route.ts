import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { randomUUID } from 'crypto';
import sharp from 'sharp';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const type = (formData.get('type') as string) || 'target'; // 'target' or 'style_reference'

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Validate image formats
    const allowedExtensions = ['.png', '.jpg', '.jpeg', '.webp'];
    const originalExt = path.extname(file.name).toLowerCase();
    const ext = allowedExtensions.includes(originalExt) ? originalExt : '.png';

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filename = `${type}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`;
    const filePath = path.join(uploadsDir, filename);

    fs.writeFileSync(filePath, buffer);

    // Get image dimensions with Sharp
    const metadata = await sharp(buffer).metadata();

    const publicUrl = `/uploads/${filename}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      path: filePath,
      filename: file.name,
      width: metadata.width || 0,
      height: metadata.height || 0,
      format: metadata.format || ext.replace('.', ''),
      size: file.size
    });
  } catch (err: any) {
    console.error('Upload error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
