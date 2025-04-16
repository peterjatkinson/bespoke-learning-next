"use client";

import React, { useState } from "react";

//
// 1. "Mined" hash: 12 chars, starting with '0000'
//    (Uses the block's id, createdTimestamp, data, and previousHash)
//
function calculateMinedHash(block) {
  const str = `${block.id}${block.createdTimestamp}${block.data}${block.previousHash}`;
  let hashNum = 0;
  for (let i = 0; i < str.length; i++) {
    hashNum = (hashNum << 5) - hashNum + str.charCodeAt(i);
    hashNum |= 0; // force 32-bit
  }
  const rawHex = Math.abs(hashNum).toString(16).padStart(8, "0");
  return "0000" + rawHex; // ensures 12 chars starting with "0000"
}

//
// 1b. "Untethered" hash: 12 chars, computed deterministically from the same properties.
//     (Double-pass approach; note that we use createdTimestamp – never updated – so that
//      if the block's data is restored, its hash reverts to the original.)
//
function calculateUntetheredHash(block) {
  const baseStr = `${block.id}${block.createdTimestamp}${block.data}${block.previousHash}`;

  // PASS 1: integer shift => 8-hex
  let hashNum1 = 0;
  for (let i = 0; i < baseStr.length; i++) {
    hashNum1 = (hashNum1 << 5) - hashNum1 + baseStr.charCodeAt(i);
    hashNum1 |= 0;
  }
  const firstHex = Math.abs(hashNum1).toString(16).padStart(8, "0");

  // PASS 2: feed firstHex into the same shift logic
  let hashNum2 = 0;
  for (let j = 0; j < firstHex.length; j++) {
    hashNum2 = (hashNum2 << 5) - hashNum2 + firstHex.charCodeAt(j);
    hashNum2 |= 0;
  }
  const secondHex = Math.abs(hashNum2).toString(16).padStart(8, "0");

  // Combine and slice to 12 characters.
  let finalHex = (firstHex + secondHex).slice(0, 12);
  if (finalHex.startsWith("0000")) {
    finalHex = "abcd" + finalHex.slice(4);
  }
  return finalHex;
}

//
// 2. Create initial chain of 5 blocks.
//    This version accepts an optional array (customData) so you can specify custom default values.
//    For block 1 (genesis), it uses customData[0] if provided; for blocks 2–5, it uses customData[i-1].
//    If a value isn't provided, a fallback default is used.
//    Each block stores its immutable createdTimestamp (for hashing) and its lastModified timestamp (for display).
//
function createInitialChain(customData = []) {
  const chain = [];
  const now = Date.now();

  // Genesis block
  const genesisData = customData[0] || "Payment 1: £200";
  const genesis = {
    id: 1,
    createdTimestamp: now,
    lastModified: now,
    data: genesisData,
    previousHash: "0",
    isValid: true,
  };
  genesis.hash = calculateMinedHash(genesis);
  // Save original values for later comparison.
  genesis.originalData = genesis.data;
  genesis.originalHash = genesis.hash;
  genesis.originalPreviousHash = genesis.previousHash;
  genesis.originalTimestamp = genesis.createdTimestamp;
  chain.push(genesis);

  // Next 4 blocks (ids 2 to 5)
  for (let i = 2; i <= 5; i++) {
    const blockCreatedTime = Date.now();
    // Use custom data if provided; note index i-1 because genesis used customData[0]
    const blockData = customData[i - 1] || `Block #${i} data`;
    const newBlock = {
      id: i,
      createdTimestamp: blockCreatedTime,
      lastModified: blockCreatedTime,
      data: blockData,
      previousHash: chain[chain.length - 1].hash,
      isValid: true,
    };
    newBlock.hash = calculateMinedHash(newBlock);
    newBlock.originalData = newBlock.data;
    newBlock.originalHash = newBlock.hash;
    newBlock.originalPreviousHash = newBlock.previousHash;
    newBlock.originalTimestamp = newBlock.createdTimestamp;
    chain.push(newBlock);
  }

  return chain;
}

export default function BlockchainDemo() {
  // Define your custom default data for blocks here.
  // The first element is for the genesis block, then blocks 2–5 follow.
  const defaultData = [
    "Payment 1: £200", // Block 1 (Genesis)
    "Payment 2: £59",  // Block 2
    "Payment 3: £309", // Block 3
    "Payment 4: £231", // Block 4
    "Payment 5: £30"   // Block 5
  ];

  // 3. State: current blocks and a permanent original chain.
  const [blocks, setBlocks] = useState(() => createInitialChain(defaultData));
  const [originalChain] = useState(() => createInitialChain(defaultData));

  //
  // 4. Tamper logic:
  //    When a block's data is changed by the user, update its data and its lastModified
  //    (display) timestamp. Then, recalc the hash for that block and every subsequent block.
  //
  const tamperBlock = (index, newData) => {
    const newBlocks = [...blocks];
    // Update block data.
    newBlocks[index].data = newData;
    // If the data matches the original, revert lastModified; otherwise update it.
    if (newData === newBlocks[index].originalData) {
      newBlocks[index].lastModified = newBlocks[index].originalTimestamp;
    } else {
      newBlocks[index].lastModified = Date.now();
    }

    // Recalculate hash (and update previousHash) from this block onward.
    for (let i = index; i < newBlocks.length; i++) {
      const block = newBlocks[i];
      if (i > 0) {
        block.previousHash = newBlocks[i - 1].hash;
      }

      // For a block that hasn't been directly tampered with, we want its hash to be the original.
      const dataIsOriginal = block.data === block.originalData;
      const linkIsOriginal = block.previousHash === block.originalPreviousHash;

      if (dataIsOriginal && linkIsOriginal) {
        block.hash = block.originalHash;
        // Also, if no tampering, reset the display timestamp.
        block.lastModified = block.originalTimestamp;
      } else {
        block.hash = calculateUntetheredHash(block);
      }
    }

    // Re-check validity of the chain.
    newBlocks[0].isValid = newBlocks[0].data === newBlocks[0].originalData;
    for (let i = 1; i < newBlocks.length; i++) {
      const prev = newBlocks[i - 1];
      const curr = newBlocks[i];
      const dataUnchanged = curr.data === curr.originalData;
      const linkUnchanged = curr.previousHash === curr.originalPreviousHash;
      curr.isValid = prev.isValid && dataUnchanged && linkUnchanged;
    }

    setBlocks(newBlocks);
  };

  //
  // 5. Render full-size chain (top section).
  //
  //
  // 5. Render full-size chain (top section).
  //
  const renderChainFull = (chain, canEdit) => (
    <div className="space-y-4">
      {chain.map((block, idx) => {
        // Generate a unique ID for the input field based on the block's ID
        const inputId = `block-data-input-${block.id}`;

        return (
          <div key={block.id} className="flex flex-col items-center">
            <div
              // Each block container gets an aria-label for screen readers
              aria-label={`Block #${block.id}${
                block.id === 1 ? " (genesis)" : ""
              } is ${block.isValid ? "untampered (green)" : "tampered (red)"}`}
              className={`w-full border-2 rounded-lg p-4 text-gray-100 ${
                block.isValid
                  ? "bg-green-900 border-green-700"
                  : "bg-red-900 border-red-700"
              }`}
            >
              <div className="grid grid-cols-2 gap-4">
                {/* --- Column 1: Block Info & Data Input --- */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm font-medium">
                      Block #{block.id}
                      {block.id === 1 ? " (genesis)" : ""}
                      {/* Screenreader-only text indicating block state */}
                      <span className="sr-only">
                        {block.isValid
                          ? ", untampered, green"
                          : ", tampered, red"}
                      </span>
                    </p>
                    <div>
                      {block.isValid ? (
                        <span aria-hidden="true" className="inline-flex w-6 h-6 border border-white rounded-full text-white flex items-center justify-center">✓</span>
                      ) : (
                        <span aria-hidden="true" className="inline-flex w-6 h-6 border border-white rounded-full text-white flex items-center justify-center">✕</span>
                      )}
                    </div>
                  </div>
                  {canEdit ? (
                    // Use a fragment <> to group label and input without extra DOM nodes
                    <>
                      {/* --- START: Added Accessible Label --- */}
                      <label
                        htmlFor={inputId}
                        // Add classes for styling and screen reader visibility
                        className="block text-sm font-medium mb-1" // Make it a block element and add margin
                      >
                        {/* Descriptive label text */}
                        Data for Block #{block.id}
                      </label>
                      {/* --- END: Added Accessible Label --- */}

                      <input
                        type="text"
                        id={inputId} // Add the unique ID here
                        value={block.data}
                        onChange={(e) => tamperBlock(idx, e.target.value)}
                        // Add aria-describedby if needed for more context, but label is primary
                        className="w-full px-3 py-2 border rounded-md bg-white text-black border-gray-300"
                      />
                    </>
                  ) : (
                    // Read-only display - no input, so no label needed here
                    <p className="mt-1 w-full px-3 py-2 border rounded-md bg-gray-800 border-gray-600">
                      {block.data}
                    </p>
                  )}
                </div>
                {/* --- Column 2: Hash, Prev Hash, Timestamp --- */}
                <div>
                  <p className="text-sm font-medium">Hash</p>
                  <p className="font-mono text-xs break-all">{block.hash}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Previous Hash</p>
                  <p className="font-mono text-xs break-all">
                    {block.previousHash}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">
                    Timestamp (for when this block's data was last modified)
                  </p>
                  <p className="font-mono text-xs break-all">
                    {new Date(block.lastModified).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
            {idx < chain.length - 1 && (
              <div
                className={`py-2 ${
                  block.isValid ? "text-green-400" : "text-red-400"
                }`}
              >
                {/* chain arrow or line */}
                ↓
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
  //
  // 6. Render mini chain (side-by-side, small squares).
  //
  const renderChainMini = (chain) => (
    <div className="flex flex-col md:flex-row flex-wrap md:items-center gap-4">
      {chain.map((block, idx) => {
        const blockColor = block.isValid
          ? "bg-green-900 border-green-700"
          : "bg-red-900 border-red-700";
        return (
          <React.Fragment key={block.id}>
            <div
              aria-label={`Block #${block.id}${
                block.id === 1 ? " (genesis)" : ""
              } is ${block.isValid ? "untampered (green)" : "tampered (red)"}`}
              className={`
                flex flex-col p-2 border-2 rounded text-xs
                break-all w-full md:w-40 text-gray-100
                ${blockColor}
              `}
            >
              <div className="font-bold mb-1 flex justify-between">
                <span>
                  Block #{block.id}
                  {block.id === 1 ? " (genesis)" : ""}
                </span>
                <span>
                  {block.isValid ? (
                    <span aria-hidden="true" className="inline-flex w-4 h-4 border border-white rounded-full text-white flex items-center justify-center text-xs">✓</span>
                  ) : (
                    <span aria-hidden="true" className="inline-flex w-4 h-4 border border-white rounded-full text-white flex items-center justify-center text-xs">✕</span>
                  )}
                </span>
                <span className="sr-only">
                  {block.isValid
                    ? ", untampered, green"
                    : ", tampered, red"}
                </span>
              </div>
              <p className="mb-1">Data: {block.data}</p>
              <p className="mb-1">
                Timestamp: {new Date(block.lastModified).toLocaleString()}
              </p>
              <p className="mb-1">Hash: {block.hash}</p>
              <p>Prev: {block.previousHash}</p>
            </div>
            {idx < chain.length - 1 && (
              <div className="hidden md:flex items-center text-gray-400 text-xl">
                &#8594;
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );

  // Add a simple legend for the icons
  const renderSimpleLegend = () => (
    <div aria-hidden="true" className="mt-4 p-4 border border-gray-600 rounded bg-gray-800">
      <div className="flex flex-col space-y-2">
        <div className="flex items-center">
          <span className="inline-flex w-6 h-6 border border-white rounded-full text-white flex items-center justify-center mr-2">✓</span>
          <span>Valid block (untampered)</span>
        </div>
        <div className="flex items-center">
          <span className="inline-flex w-6 h-6 border border-white rounded-full text-white flex items-center justify-center mr-2">✕</span>
          <span>Invalid block (tampered)</span>
        </div>
      </div>
    </div>
  );

  //
  // 7. Render the page.
  //
  return (
    <div className="min-h-full bg-gray-900 text-gray-100 p-6 space-y-10">
      <div>
        <h1 className="text-xl font-bold mb-2">Blockchain demonstration</h1>
        <p>
          Try amending some of the data in the blocks below and observe the
          impact of your changes on the hashes and subsequent blocks. In this
          example, the data for each block contains some imaginary payment
          data. (Note that the first block is often called the &apos;genesis block&apos;.)
        </p>

        {blocks.some((b) => !b.isValid) && (
          <div className="bg-red-900 border-l-4 border-red-700 p-4 rounded mt-4 text-red-100">
            <div className="flex items-center">
              <span className="inline-flex w-6 h-6 border border-white rounded-full text-white flex items-center justify-center mr-2">✕</span>
              <span>Blockchain integrity compromised! Some blocks have been tampered with.</span>
            </div>
          </div>
        )}

        {renderSimpleLegend()}

        <div className="mt-6">{renderChainFull(blocks, true)}</div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-2">
          Comparison with other nodes
        </h2>
        <p className="mb-4">
          Compare your altered node chain with other nodes. This is a
          simplification of how it really works, but demonstrates the principle
          that if there are other nodes recording all or some of the chain,
          then a malicious alteration of another version can easily be detected.
        </p>

        {/* Node #1: Reflects the current state */}
        <div className="mb-6">
          <h3 className="text-md font-bold mb-2">
            Node #1 (this is the version above, which you may have tampered with)
          </h3>
          {renderChainMini(blocks)}
        </div>

        {/* Node #2: Original chain (read-only) */}
        <div className="mb-6">
          <h3 className="text-md font-bold mb-2">
            Node #2 (original/untampered chain)
          </h3>
          {renderChainMini(originalChain)}
        </div>

        {/* Node #3: Original chain (read-only) */}
        <div>
          <h3 className="text-md font-bold mb-2">
            Node #3 (original/untampered chain)
          </h3>
          {renderChainMini(originalChain)}
        </div>
      </div>
    </div>
  );
}