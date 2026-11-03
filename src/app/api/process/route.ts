import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { exec } from 'child_process';
import util from 'util';
import { addHistoryItem, getStyleProfiles } from '@/lib/storage';
import { OverlayProcessingOptions, QualityReport, HistoryItem } from '@/lib/types';
import sharp from 'sharp';

const execPromise = util.promisify(exec);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      imageUrl,
      imagePath,
      options = {} as OverlayProcessingOptions,
      title = 'AI Stream Overlay'
    } = body;

    let targetFilePath = imagePath;
    if (!targetFilePath && imageUrl) {
      const relative = imageUrl.startsWith('/') ? imageUrl.slice(1) : imageUrl;
      targetFilePath = path.join(process.cwd(), 'public', relative);
    }

    if (!targetFilePath || !fs.existsSync(targetFilePath)) {
      return NextResponse.json({ success: false, error: 'Source image file does not exist' }, { status: 404 });
    }

    // Prepare outputs directory
    const outputsDir = path.join(process.cwd(), 'public', 'outputs');
    if (!fs.existsSync(outputsDir)) {
      fs.mkdirSync(outputsDir, { recursive: true });
    }

    const outputFilename = `overlay_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.png`;
    const outputFilePath = path.join(outputsDir, outputFilename);

    // Resolution dimensions
    let targetWidth = 0;
    let targetHeight = 0;
    if (options.resolution === '1080p') {
      targetWidth = 1920;
      targetHeight = 1080;
    } else if (options.resolution === '1440p') {
      targetWidth = 2560;
      targetHeight = 1440;
    } else if (options.resolution === '4k') {
      targetWidth = 3840;
      targetHeight = 2160;
    }

    // Default effect values
    const glowIntensity = typeof options.glowIntensity === 'number' ? options.glowIntensity : 35;
    const glowColor = options.glowColor || '#00e5ff';
    const shadowIntensity = typeof options.shadowIntensity === 'number' ? options.shadowIntensity : 40;
    const neonBoost = typeof options.neonBoost === 'number' ? options.neonBoost : 15;
    const metallicBoost = typeof options.metallicBoost === 'number' ? options.metallicBoost : 15;
    const edgeFeather = typeof options.edgeFeather === 'number' ? options.edgeFeather : 2;
    const hollowCenter = Boolean(options.hollowCenter);
    const backgroundColor = options.backgroundColor || 'transparent';

    // Call Python script
    const scriptPath = path.join(process.cwd(), 'scripts', 'process_overlay.py');
    const cmd = [
      `python "${scriptPath}"`,
      `--input "${targetFilePath}"`,
      `--output "${outputFilePath}"`,
      `--glow-intensity ${glowIntensity}`,
      `--glow-color "${glowColor}"`,
      `--shadow-intensity ${shadowIntensity}`,
      `--neon-boost ${neonBoost}`,
      `--metallic-boost ${metallicBoost}`,
      `--edge-feather ${edgeFeather}`,
      `--bg-color "${backgroundColor}"`,
      targetWidth > 0 ? `--width ${targetWidth}` : '',
      targetHeight > 0 ? `--height ${targetHeight}` : '',
      hollowCenter ? `--hollow-center` : ''
    ].filter(Boolean).join(' ');

    const { stdout, stderr } = await execPromise(cmd, { timeout: 45000 });

    const startIdx = stdout.indexOf('JSON_START');
    const endIdx = stdout.indexOf('JSON_END');
    if (startIdx === -1 || endIdx === -1) {
      throw new Error(`Overlay processing script failed. Stderr: ${stderr}`);
    }

    const jsonStr = stdout.substring(startIdx + 10, endIdx).trim();
    const pyReport = JSON.parse(jsonStr);

    if (!pyReport.success) {
      throw new Error(pyReport.error || 'Python processing failed');
    }

    // Verify output with Sharp
    const sharpMeta = await sharp(outputFilePath).metadata();

    const publicOutputUrl = `/outputs/${outputFilename}`;

    // Lookup theme from style profile if attached
    let themeName = 'Custom AI Design';
    if (options.styleProfileId) {
      const profiles = getStyleProfiles();
      const p = profiles.find(item => item.id === options.styleProfileId);
      if (p) themeName = p.theme;
    }

    // Save to history
    const historyItem: HistoryItem = {
      id: `hist_${Date.now()}`,
      title: title || 'Stream Overlay',
      theme: themeName,
      originalUrl: imageUrl || `/uploads/${path.basename(targetFilePath)}`,
      outputUrl: publicOutputUrl,
      dimensions: {
        width: sharpMeta.width || pyReport.dimensions.width,
        height: sharpMeta.height || pyReport.dimensions.height
      },
      transparencyPercentage: pyReport.transparency_percentage,
      qualityScore: pyReport.quality_score,
      palette: pyReport.palette || [],
      createdAt: new Date().toISOString(),
      options: {
        glowIntensity,
        glowColor,
        shadowIntensity,
        neonBoost,
        metallicBoost,
        edgeFeather,
        resolution: options.resolution || 'original',
        hollowCenter,
        styleProfileId: options.styleProfileId
      }
    };

    addHistoryItem(historyItem);

    return NextResponse.json({
      success: true,
      outputUrl: publicOutputUrl,
      originalUrl: imageUrl,
      report: pyReport,
      dimensions: {
        width: sharpMeta.width || pyReport.dimensions.width,
        height: sharpMeta.height || pyReport.dimensions.height
      },
      historyItem
    });
  } catch (err: any) {
    console.error('Process overlay error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

