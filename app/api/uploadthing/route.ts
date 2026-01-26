import { createRouteHandler } from "uploadthing/next";
import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

// กำหนดเงื่อนไขการอัปโหลดไฟล์ (รับเฉพาะรูปภาพ ขนาดไม่เกิน 4MB)
export const ourFileRouter = {
  candidateImage: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 },
  }).onUploadComplete(async ({ metadata, file }) => {
    console.log("Upload complete for url:", file.url);
    return { uploadedBy: "admin", url: file.url };
  }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;

export const { GET, POST } = createRouteHandler({ router: ourFileRouter });
