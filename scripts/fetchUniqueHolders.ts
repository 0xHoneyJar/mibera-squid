import { DuneClient } from "@duneanalytics/client-sdk";
import fs from "fs";
import path from "path";

interface DuneQueryResult {
  result: {
    rows: Array<{
      address: string;
      balance: string;
    }>;
  };
}

async function fetchUniqueHolders(
  contractAddress: string,
  blockNumber: number
) {
  console.log(
    `Fetching unique holders for contract ${contractAddress} at block ${blockNumber}...`
  );

  try {
    const dune = new DuneClient(process.env.DUNE_API_KEY as string);

    const executionResponse = await fetch(
      `https://api.dune.com/api/v1/query/3955588/execute`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Dune-API-Key": process.env.DUNE_API_KEY as string,
        },
        body: JSON.stringify({
          query_parameters: {
            contract_address: contractAddress,
            blockchain: "ethereum",
            block_number: blockNumber.toString(),
          },
        }),
      }
    );

    const executionData = await executionResponse.json();
    let executionId = executionData.execution_id;

    let retryCount = 0;
    const maxRetries = 3;
    while (!executionId && retryCount < maxRetries) {
      console.log(`Retrying to get execution_id (Attempt ${retryCount + 1})`);
      await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait for 5 seconds before retrying
      const retryResponse = await fetch(
        `https://api.dune.com/api/v1/query/3955588/execute`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Dune-API-Key": "qe5SSNe3PeUFDuf7XUXNMmr9FJ10EOev",
          },
          body: JSON.stringify({
            query_parameters: {
              contract_address: contractAddress,
              blockchain: "ethereum",
              block_number: blockNumber.toString(),
            },
          }),
        }
      );
      const retryData = await retryResponse.json();
      executionId = retryData.execution_id;
      retryCount++;
    }

    if (!executionId) {
      throw new Error("Failed to get execution_id after multiple attempts");
    }

    console.log("Execution ID:", executionId);

    // Implement polling mechanism with timeout
    const maxAttempts = 20; // Maximum number of attempts
    const pollingInterval = 30000; // 30 seconds between each attempt
    let attempts = 0;
    let resultData: DuneQueryResult | null = null;

    while (attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, pollingInterval));

      const resultResponse = await fetch(
        `https://api.dune.com/api/v1/execution/${executionId}/status`,
        {
          headers: {
            "X-Dune-API-Key": "qe5SSNe3PeUFDuf7XUXNMmr9FJ10EOev",
          },
        }
      );

      const statusData = await resultResponse.json();

      if (statusData.state === "QUERY_STATE_COMPLETED") {
        // Query execution is finished, fetch the results
        const resultsResponse = await fetch(
          `https://api.dune.com/api/v1/execution/${executionId}/results`,
          {
            headers: {
              "X-Dune-API-Key": "qe5SSNe3PeUFDuf7XUXNMmr9FJ10EOev",
            },
          }
        );

        resultData = (await resultsResponse.json()) as DuneQueryResult;
        break;
      } else if (statusData.state === "QUERY_STATE_FAILED") {
        throw new Error("Query execution failed");
      }

      attempts++;
      console.log(
        `Attempt ${attempts}/${maxAttempts}: Query still executing...`
      );
    }

    if (!resultData) {
      throw new Error("Query execution timed out");
    }

    console.log("Query execution completed. Processing results...");

    // Use a Map to store unique addresses and their total balance
    const uniqueHoldersMap = new Map<string, number>();

    resultData.result.rows.forEach((row) => {
      const address = row.address.toLowerCase(); // Normalize addresses to lowercase
      const balance = parseInt(row.balance);

      if (uniqueHoldersMap.has(address)) {
        uniqueHoldersMap.set(address, uniqueHoldersMap.get(address)! + balance);
      } else {
        uniqueHoldersMap.set(address, balance);
      }
    });

    // Convert the Map back to an array of unique holders
    const uniqueHolders = Array.from(uniqueHoldersMap, ([address, amount]) => ({
      address,
      amount,
    }));

    console.log(`Total unique holders: ${uniqueHolders.length}`);

    return uniqueHolders;
  } catch (error) {
    console.error("Error fetching unique holders:", error);
    throw error;
  }
}

// New function to save data to CSV
function saveToCSV(
  data: Array<{ address: string; amount: number }>,
  filename: string
) {
  const csvContent = [
    "Address,Amount", // CSV header
    ...data.map((row) => `${row.address},${row.amount}`),
  ].join("\n");

  const filePath = path.join(__dirname, filename);
  fs.writeFileSync(filePath, csvContent);
  console.log(`Data saved to ${filePath}`);
}

// Example usage
const contractAddress = "0xcb0477d1af5b8b05795d89d59f4667b59eae9244"; // Replace with actual contract address
const blockNumber = 20594778; // Replace with desired block number

fetchUniqueHolders(contractAddress, blockNumber)
  .then((holders) => {
    console.log(`Unique holders: ${holders.length}`);
    const filename = `unique_holders_${contractAddress}_block_${blockNumber}.csv`;
    saveToCSV(holders, filename);
  })
  .catch((error) => {
    console.error("Error in main execution:", error);
  });
