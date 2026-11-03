import { NextRequest, NextResponse } from 'next/server';
import { getHistory, deleteHistoryItem } from '@/lib/storage';

export async function GET() {
  try {
    const history = getHistory();
    return NextResponse.json({ success: true, history });
  } catch (err: any) {
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
    const updated = deleteHistoryItem(id);
    return NextResponse.json({ success: true, history: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

