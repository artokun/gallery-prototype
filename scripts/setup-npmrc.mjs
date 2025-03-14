import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";
import { dirname } from "path";

// Initialize dotenv
config();

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = dirname(__dirname);

// Path to .npmrc files
const npmrcTemplatePath = path.join(rootDir, ".npmrc.template");
const npmrcPath = path.join(rootDir, ".npmrc");

// Check if template exists
if (!fs.existsSync(npmrcTemplatePath)) {
  console.error("Error: .npmrc.template file not found");
  process.exit(1);
}

// Read the .npmrc template
let npmrcContent = fs.readFileSync(npmrcTemplatePath, "utf8");

// Replace the environment variable placeholder with the actual value
if (process.env.GSAP_TOKEN) {
  npmrcContent = npmrcContent.replace("${GSAP_TOKEN}", process.env.GSAP_TOKEN);
  fs.writeFileSync(npmrcPath, npmrcContent);
  console.log(
    "Successfully updated .npmrc with GSAP token from environment variables"
  );
} else {
  console.error("Error: GSAP_TOKEN environment variable is not set");
  process.exit(1);
}
