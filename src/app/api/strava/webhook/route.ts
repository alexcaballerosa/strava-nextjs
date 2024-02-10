import { WEB_URL } from '@/lib/constants'
import { safeFetch } from '@/lib/fetch'
import { z } from 'zod'

const QSTASH_URL = [
  process.env.QSTASH_URL,
  WEB_URL,
  '/api/strava/activities',
].join('')

const stravaWebhookSchema = z.object({
  object_type: z.enum(['activity', 'athlete'] as const),
  object_id: z.number(),
  aspect_type: z.enum(['create', 'update', 'delete'] as const),
  updates: z
    .object({
      title: z.string().optional(),
      type: z.string().optional(),
      private: z.boolean().optional(),
    })
    .optional(),
  owner_id: z.number(),
  subscription_id: z.number(),
  event_time: z.number(),
})

const qStashSchema = z.object({
  messageId: z.string(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const result = stravaWebhookSchema.safeParse(body)

    if (!result.success) {
      return Response.json({ message: 'INVALID_REQUEST_BODY' }, { status: 400 })
    }

    const { object_type, object_id, aspect_type, owner_id, subscription_id } =
      result.data

    const qStashResponse = await safeFetch(qStashSchema, QSTASH_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.QSTASH_TOKEN}`,
      },
      body: JSON.stringify({
        object_type,
        object_id,
        aspect_type,
        owner_id,
        subscription_id,
      }),
    })

    if (!qStashResponse.messageId) {
      return Response.json({ message: 'DELIVERY_FAILED' }, { status: 400 })
    }

    return Response.json({ message: 'EVENT_RECEIVED' })
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    const mode = searchParams.get('hub.mode')
    const token = searchParams.get('hub.verify_token')
    const challenge = searchParams.get('hub.challenge')

    if (!mode || !token) {
      return Response.json({ error: 'Missing parameters' }, { status: 403 })
    }

    if (mode !== 'subscribe' || token !== process.env.STRAVA_VERIFY_TOKEN) {
      return Response.json({ error: 'Invalid parameters' }, { status: 403 })
    }

    return Response.json({ 'hub.challenge': challenge })
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 })
  }
}
