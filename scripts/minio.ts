import {
  CreateBucketCommand,
  PutBucketPolicyCommand,
  S3Client
} from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config({ path: ".env.development.local" });

const variables = [
  "S3_ENDPOINT",
  "S3_ACCESS_KEY_ID",
  "S3_SECRET_ACCESS_KEY",
  "S3_BUCKET"
] as const;

const missing = variables.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error(
    `Error: Missing required environment variables: ${missing.join(", ")}`
  );

  process.exit(1);
}

const s3 = new S3Client({
  region: "us-east-1",
  endpoint: process.env.S3_ENDPOINT!,
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!
  }
});

const bucket = process.env.S3_BUCKET!;

async function setup() {
  try {
    await s3.send(new CreateBucketCommand({ Bucket: bucket }));

    console.log(`✅ Bucket "${bucket}" created`);
  } catch (e) {
    const error = e as Error;

    if (
      error.name === "BucketAlreadyOwnedByYou" ||
      error.name === "BucketAlreadyExists"
    )
      console.log(`ℹ️  Bucket "${bucket}" already exists.`);
    else throw e;
  }

  await s3.send(
    new PutBucketPolicyCommand({
      Bucket: bucket,
      Policy: JSON.stringify({
        Version: "2012-10-17",
        Statement: [
          {
            Effect: "Allow",
            Principal: "*",
            Action: ["s3:GetObject"],
            Resource: [`arn:aws:s3:::${bucket}/*`]
          }
        ]
      })
    })
  );

  console.log(`✅ Bucket "${bucket}" is ready and public`);
}

setup().catch((e) => {
  console.error("❌ Storage setup failed:", e);
  process.exit(1);
});
