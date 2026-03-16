import dotenv from "dotenv";
import {z} from "zod"
import path from "path";

dotenv.config({path: path.resolve(process.cwd(),'.env')});

const envSchema = z.object({
    PORT: z.preprocess((input) => {
        if(typeof input === "string" && input.trim() === "") return undefined;
        return Number(input);
    }, z.number().default(3000)),
    EMAIL: z.email(),
    EMAIL_PASSWORD: z.string(),
});

export const env = envSchema.parse(process.env);