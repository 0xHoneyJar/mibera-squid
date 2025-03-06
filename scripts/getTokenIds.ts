import fs from "fs";
import csv from "csv-parser";
import path from "path";

const inputFile = path.join(__dirname, "..", "/scripts/thj_minters.csv");
const outputFile = path.join(__dirname, "..", "src", "constants.ts");

interface MinterData {
  minter: string;
  IDs: string;
}

function parseIds(idsString: string): number[] {
  return idsString
    .replace(/[\[\]]/g, "")
    .split(" ")
    .map((id) => parseInt(id.trim(), 10));
}

async function processCSV(): Promise<number[]> {
  const allIds: number[] = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(inputFile)
      .pipe(csv())
      .on("data", (row: MinterData) => {
        const ids = parseIds(row.IDs);
        allIds.push(...ids);
      })
      .on("end", () => {
        resolve(allIds);
      })
      .on("error", (error) => {
        reject(error);
      });
  });
}

function generateTokenIdsArray(ids: number[]): string {
  return `export const thjTokenIds = [
  ${ids.map((id) => `"${id}"`).join(",\n  ")}
];`;
}

async function main() {
  try {
    const tokenIds = await processCSV();
    const tokenIdsArray = generateTokenIdsArray(tokenIds);

    // Read the current contents of the constants.ts file
    const constantsContent = fs.readFileSync(outputFile, "utf-8");

    // Append the new array to the end of the file
    const updatedContent = `${constantsContent}\n\n${tokenIdsArray}\n`;

    // Write the updated content back to the file
    fs.writeFileSync(outputFile, updatedContent);

    console.log(`Token IDs have been added to ${outputFile}`);
  } catch (error) {
    console.error("Error processing CSV:", error);
  }
}

main();
