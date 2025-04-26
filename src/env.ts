import process from 'node:process'
import { z } from 'zod'
import 'dotenv/config'

const commaSeparatedString = z
    .string()
    .transform((val) => val.split(',').map((x) => x.trim()))
    .default('')

const envSchema = z.object({
    GIST_ID: z.string(),
    GH_USERNAME: z.string(),
    GH_TOKEN: z.string(),
    EXCLUDE: commaSeparatedString,
    EXCLUDE_REPO: commaSeparatedString,
    DESCRIPTION: z.string().optional(),
})

export const env = envSchema.parse(process.env)
