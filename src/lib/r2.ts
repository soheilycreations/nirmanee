import "server-only";
import { DeleteObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2Env } from "@/lib/env";

let client: S3Client | null = null;

function r2() {
  const env = r2Env();
  if (!env) throw new Error("R2 is not configured");
  client ??= new S3Client({
    region: "auto",
    endpoint: env.endpoint,
    credentials: { accessKeyId: env.accessKeyId, secretAccessKey: env.secretAccessKey },
  });
  return { client, bucket: env.bucket };
}

const UPLOAD_TTL = Number(process.env.R2_UPLOAD_URL_TTL ?? 900);

/** Presigned PUT for a direct browser upload. The browser must send the same Content-Type. */
export async function presignUpload(key: string, contentType: string): Promise<string> {
  const { client, bucket } = r2();
  return getSignedUrl(client, new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType }), {
    expiresIn: UPLOAD_TTL,
  });
}

/** Size of an uploaded object, or null if it does not exist. */
export async function headObjectSize(key: string): Promise<number | null> {
  const { client, bucket } = r2();
  try {
    const res = await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    return res.ContentLength ?? null;
  } catch {
    return null;
  }
}

export async function deleteObject(key: string): Promise<void> {
  const { client, bucket } = r2();
  await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}
