import IORedis from 'ioredis';

export class RedisClient {
    private redis: IORedis;

    constructor() {
        // Initialize the Redis client with options
        this.redis = new IORedis({
            host: process.env.REDIS_HOST || 'localhost', // Redis server hostname
            port: Number(process.env.REDIS_PORT) || 6379, // Redis server port
            password: process.env.REDIS_PASSWORD, // Redis password if it is set
            db: Number(process.env.REDIS_DB) || 0, // Default Redis DB
        });
    }

    // Generic get method
    async get(key: string): Promise<string | null> {
        return this.redis.get(key);
    }

    // Generic set method
    async set(key: string, value: string): Promise<string> {
        return this.redis.set(key, value);
    }

    // Method to publish the agent's state
    async publishAgentState(agentId: number, state: any): Promise<number> {
        // Here we are serializing the state object to a string before publishing
        return this.redis.publish(`agent-state:${agentId}`, JSON.stringify(state));
    }

    // Method to subscribe to a channel
    async subscribe(channel: string, callback: (channel: string, message: string) => void): Promise<number> {
        const subscriber = this.redis.duplicate();
        subscriber.on('message', callback);
        // The 'as number' assertion tells TypeScript that you're certain of the return type.
        return await subscriber.subscribe(channel) as number;
    }

    // Method to close the Redis connection
    async close(): Promise<void> {
        await this.redis.quit();
    }
}
