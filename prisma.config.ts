
// import { defineConfig, env } from 'prisma/config'

// export default defineConfig({
//   datasource: {
//     url: env('DATABASE_URL'),
//     directUrl: env('DIRECT_URL')
//   }
// })
import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  // Optional: tells Prisma exactly where your schema lives
  schema: "prisma/schema.prisma",
  datasource: {
    // The Prisma CLI will use this strictly for migrations and builds
    url: env('DIRECT_URL')
  }
})