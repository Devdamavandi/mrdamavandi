import Redis from 'ioredis'

const redis = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL, {
      // Only use TLS if the URL starts with 'rediss://' 
      tls: process.env.REDIS_URL.startsWith('rediss://') ? {} : undefined,
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