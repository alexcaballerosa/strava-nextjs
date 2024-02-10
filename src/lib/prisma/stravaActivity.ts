import prisma from '@/lib/prisma/client'
import { Prisma } from '@prisma/client'

export async function createOrUpdateStravaActivity(
  stravaId: number,
  data: Prisma.StravaActivityCreateInput
): Promise<{ id: string } | null> {
  try {
    const activity = await prisma.stravaActivity.upsert({
      where: {
        stravaId,
      },
      update: data,
      create: data,
      select: {
        id: true,
      },
    })

    if (!activity?.id) {
      return null
    }

    return activity
  } catch (e) {
    console.error(e)
    return null
  }
}

export async function deleteStravaActivity(
  stravaId: number
): Promise<{ ok: boolean; message?: string }> {
  try {
    const activity = await prisma.stravaActivity.findUnique({
      where: {
        stravaId,
      },
      select: {
        id: true,
      },
    })

    if (!activity?.id) {
      return {
        ok: false,
        message: 'Strava Activity not found',
      }
    }

    await prisma.stravaActivity.delete({
      where: {
        id: activity.id,
      },
    })

    return {
      ok: true,
    }
  } catch (e) {
    return {
      ok: false,
      message: String(e),
    }
  }
}
