import Redis from 'ioredis'

const redis = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL, {
      tls: process.env.NODE_ENV === 'production' ? {} : undefined,
      connectTimeout: 10000,
      lazyConnect: true,
      maxRetriesPerRequest: 3,
    })
  : new Redis({
      host: 'localhost',
      port: 6379,
      connectTimeout: 10000,
      lazyConnect: true,
    });

export default redis