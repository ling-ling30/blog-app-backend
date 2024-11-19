import { Hono } from "hono";
import { Context } from "../../types";

export const uploadApi = new Hono<Context>();

uploadApi.post("/", async (c) => {
  try {
    const body = await c.req.formData();

    // Check if 'file' is a FormData object
    if (body instanceof FormData) {
      const file = body.get("file");

      if (file && file instanceof File) {
        console.log("Uploading file...");
        const currentDate = Date.now();
        const filename = `${file.name}|-|${currentDate}`;

        // Save the file to the R2 bucket
        const result = await c.env.R2.put(filename, file.stream());

        console.log("File uploaded successfully");
        return c.json({
          message: "Uploaded!",
          data: filename,
        });
      } else {
        console.error("No valid file found in FormData");
      }
    } else {
      console.error("File is not a FormData object or is not present");
    }

    return c.json({
      message: "File not found",
    });
  } catch (error) {
    console.error(error);
    return c.json({
      message: "Error uploading file",
    });
  }
});
