export const configuration = () => ({
  PORT: parseInt(process.env.PORT, 10) || 3000,
  NODE_ENV: process.env.NODE_ENV,
  db: {
    mongo: { MONGO_URI: process.env.MONGO_URI }
  }
});

export type ConfigurationType = ReturnType<typeof configuration>

export type ConfigType = ConfigurationType & {
  MONGO_URI: string
  PORT: string
  NODE_ENV: string
}