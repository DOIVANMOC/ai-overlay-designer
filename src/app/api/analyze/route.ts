import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { getServerConfig, getStyleProfiles } from '@/lib/storage';
import { getAIProvider } from '@/lib/ai-provider';
import { AnalysisResult } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imagePath, imageUrl, styleProfileId } = body;

    let targetFilePath = imagePath;
    if (!targetFilePath && imageUrl) {
      // Resolve relative public URL
      const relative = imageUrl.startsWith('/') ? imageUrl.slice(1) : imageUrl;
      targetFilePath = path.join(process.cwd(), 'public', relative);
    }

    if (!targetFilePath || !fs.existsSync(targetFilePath)) {
      return NextResponse.json({ success: false, error: 'Target image not found on server' }, { status: 404 });
    }

    // Check style profile if specified
    const profiles = getStyleProfiles();
    const selectedProfile = styleProfileId ? profiles.find(p => p.id === styleProfileId) : undefined;

    // Get current provider
    const config = getServerConfig();
    const provider = getAIProvider(config);

    const analysis: AnalysisResult = await provider.analyzeOverlay(targetFilePath, selectedProfile);

    return NextResponse.json({
      success: true,
      provider: config.activeProvider,
      analysis
    });
  } catch (err: any) {
    console.error('Analyze error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

