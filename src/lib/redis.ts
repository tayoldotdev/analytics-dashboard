import { Redis } from '@upstash/redis'

export const redis = new Redis({
  url: 'https://eu1-capital-hornet-39505.upstash.io',
  token: process.env.REDIS_TOKEN!,
})
