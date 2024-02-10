import { createOrUpdateActivity, deleteActivity } from '@/lib/strava'
import { verifySignatureAppRouter } from '@upstash/qstash/dist/nextjs'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({
  object_type: z.enum(['activity', 'athlete'] as const),
  object_id: z.number(),
  aspect_type: z.enum(['create', 'update', 'delete'] as const),
  owner_id: z.literal(Number(process.env.STRAVA_ATHLETE_ID)),
  subscription_id: z.literal(Number(process.env.STRAVA_SUBSCRIPTION_ID)),
})

async function handler(request: NextRequest) {
  try {
    const body = await request.json()
    const result = schema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: 'INVALID_REQUEST_BODY' },
        { status: 400 }
      )
    }

    const { object_type, object_id, aspect_type } = result.data

    if (object_type !== 'activity') {
      return NextResponse.json(
        { error: 'INVALID_OBJECT_TYPE' },
        { status: 400 }
      )
    }

    let opResult: { ok: boolean; error?: string } = { ok: false, error: '' }

    if (aspect_type === 'create' || aspect_type === 'update') {
      opResult = await createOrUpdateActivity(object_id)
    } else if (aspect_type === 'delete') {
      opResult = await deleteActivity(object_id)
    } else {
      opResult = { ok: false, error: 'INVALID_ASPECT_TYPE' }
    }

    if (!opResult.ok) {
      return NextResponse.json({ error: opResult.error }, { status: 500 })
    }

    return NextResponse.json({ message: 'ACTIVITY_SAVED' })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export const POST = verifySignatureAppRouter(handler)
