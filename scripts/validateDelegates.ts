import fs from "fs";
import csv from "csv-parser";

interface AddressQuantity {
  address: string;
  quantity: number;
}

interface AddressDelegate {
  address: string;
  to: string;
  latest_delegate: string;
}

const addressQuantityFile = "./scripts/address_quantity1.csv";
const addressDelegateFile = "./scripts/address_delegate1.csv";

const delegateMap: Map<string, string> = new Map();
const inconsistencies: string[] = [];
const addressQuantitySet: Set<string> = new Set();
const toSet: Set<string> = new Set();
const missingDelegates: string[] = [];
const invalidAddresses: string[] = [];

function processAddressQuantity(data: AddressQuantity) {
  addressQuantitySet.add(data.address);
}

function processAddressDelegate(data: AddressDelegate) {
  const { address, to } = data;
  if (delegateMap.has(address)) {
    const existingDelegate = delegateMap.get(address);
    if (existingDelegate !== to) {
      inconsistencies.push(
        `Inconsistent delegate for address ${address}: ${existingDelegate} vs ${to}`
      );
    }
  } else {
    delegateMap.set(address, to);
  }
  toSet.add(to);
}

function validateDelegates() {
  return new Promise<void>((resolve, reject) => {
    fs.createReadStream(addressQuantityFile)
      .pipe(csv())
      .on("data", (data: AddressQuantity) => processAddressQuantity(data))
      .on("end", () => {
        fs.createReadStream(addressDelegateFile)
          .pipe(csv())
          .on("data", (data: AddressDelegate) => processAddressDelegate(data))
          .on("end", () => {
            // Check if all 'to' addresses exist in addressQuantity
            for (const to of toSet) {
              if (!addressQuantitySet.has(to)) {
                missingDelegates.push(to);
              }
            }

            // Check if any 'address' from addressDelegate exists in addressQuantity
            for (const [address] of delegateMap) {
              if (addressQuantitySet.has(address)) {
                invalidAddresses.push(address);
              }
            }

            // Log results
            if (inconsistencies.length > 0) {
              console.log("Inconsistencies found:");
              inconsistencies.forEach((inconsistency) =>
                console.log(inconsistency)
              );
            } else {
              console.log("All delegate mappings are consistent.");
            }

            // Log missing delegates
            if (missingDelegates.length > 0) {
              console.log(
                "Missing delegates (not found in address_quantity.csv):"
              );
              missingDelegates.forEach((delegate) => console.log(delegate));
            } else {
              console.log("All 'to' addresses exist in address_quantity.csv");
            }

            // Log invalid addresses
            if (invalidAddresses.length > 0) {
              console.log("Invalid addresses (found in both files):");
              invalidAddresses.forEach((address) => console.log(address));
            } else {
              console.log(
                "No addresses from address_delegate.csv exist in address_quantity.csv"
              );
            }

            resolve();
          })
          .on("error", reject);
      });
  });
}

async function main() {
  try {
    await validateDelegates();
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

main();
