import { NextRequest, NextResponse } from 'next/server';
import { getServerConfig, saveServerConfig, getClientSafeConfig } from '@/lib/storage';
import { getAIProvider, GoogleGeminiAdapter, OpenAIAdapter, ReplicateAdapter, LocalEngineAdapter } from '@/lib/ai-provider';
import { AIProviderConfig, AIProviderType } from '@/lib/types';

export async function GET() {
  try {
    const config = getClientSafeConfig();
    return NextResponse.json({ success: true, config });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const updated = saveServerConfig(body);
    const clientSafe = getClientSafeConfig();
    return NextResponse.json({ success: true, config: clientSafe });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const providerType = (body.provider || 'local') as AIProviderType;
    const testConfig: AIProviderConfig = {
      ...getServerConfig(),
      activeProvider: providerType,
      ...(body.apiKey && !body.apiKey.includes('••••') ? {
        ...(providerType === 'gemini' ? { geminiApiKey: body.apiKey } : {}),
        ...(providerType === 'openai' ? { openaiApiKey: body.apiKey } : {}),
        ...(providerType === 'replicate' ? { replicateApiKey: body.apiKey } : {}),
        ...(providerType === 'custom' ? { customApiKey: body.apiKey } : {})
      } : {}),
      ...(body.model ? {
        ...(providerType === 'gemini' ? { geminiModel: body.model } : {}),
        ...(providerType === 'openai' ? { openaiModel: body.model } : {}),
        ...(providerType === 'custom' ? { customModel: body.model } : {})
      } : {}),
      ...(body.endpoint ? { customEndpoint: body.endpoint } : {})
    };

    let provider;
    switch (providerType) {
      case 'gemini':
        provider = new GoogleGeminiAdapter(testConfig.geminiApiKey || '', testConfig.geminiModel || 'gemini-1.5-flash');
        break;
      case 'openai':
        provider = new OpenAIAdapter(testConfig.openaiApiKey || '', testConfig.openaiModel || 'gpt-4o');
        break;
      case 'custom':
        provider = new OpenAIAdapter(testConfig.customApiKey || '', testConfig.customModel || 'gpt-4o', testConfig.customEndpoint || 'https://api.openai.com/v1');
        break;
      case 'replicate':
        provider = new ReplicateAdapter(testConfig.replicateApiKey || '');
        break;
      case 'local':
      default:
        provider = new LocalEngineAdapter();
        break;
    }

    const testResult = await provider.testConnection();
    return NextResponse.json({ success: true, testResult });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      testResult: {
        success: false,
        message: err.message,
        latencyMs: 0
      }
    });
  }
}

