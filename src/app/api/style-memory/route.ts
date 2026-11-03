import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { getStyleProfiles, saveStyleProfile, deleteStyleProfile, getServerConfig } from '@/lib/storage';
import { getAIProvider } from '@/lib/ai-provider';
import { StyleProfile } from '@/lib/types';

export async function GET() {
  try {
    const profiles = getStyleProfiles();
    return NextResponse.json({ success: true, profiles });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, referenceImageUrl, referenceImagePath } = body;

    let targetPath = referenceImagePath;
    if (!targetPath && referenceImageUrl) {
      const rel = referenceImageUrl.startsWith('/') ? referenceImageUrl.slice(1) : referenceImageUrl;
      targetPath = path.join(process.cwd(), 'public', rel);
    }

    if (!targetPath || !fs.existsSync(targetPath)) {
      return NextResponse.json({ success: false, error: 'Reference image not found' }, { status: 404 });
    }

    // Analyze reference image using active AI provider
    const config = getServerConfig();
    const provider = getAIProvider(config);
    const analysis = await provider.analyzeOverlay(targetPath);

    const profileId = `style_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newProfile: StyleProfile = {
      id: profileId,
      name: name || analysis.theme || 'Custom Style Profile',
      theme: analysis.theme,
      aesthetic: analysis.aesthetic,
      palette: analysis.palette,
      dominantGlowColor: analysis.dominantGlowColor || analysis.suggested_settings.glow_color,
      glowIntensity: analysis.suggested_settings.glow_intensity,
      shadowIntensity: analysis.suggested_settings.shadow_intensity,
      metallicBoost: analysis.suggested_settings.metallic_boost,
      neonBoost: analysis.suggested_settings.neon_boost,
      edgeFeather: analysis.suggested_settings.edge_feather,
      referenceImageUrl: referenceImageUrl,
      createdAt: new Date().toISOString()
    };

    const updatedProfiles = saveStyleProfile(newProfile);
    return NextResponse.json({ success: true, profile: newProfile, profiles: updatedProfiles });
  } catch (err: any) {
    console.error('Style Memory save error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing ID' }, { status: 400 });
    }
    const updated = deleteStyleProfile(id);
    return NextResponse.json({ success: true, profiles: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

