"use client";

import { useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { VERIDEGREE_ADDRESS, VERIDEGREE_ABI } from "../../constants";

export default function AdminPage() {
  const [studentAddress, setStudentAddress] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState("");

  const { data: hash, writeContract } = useWriteContract();
  const { isLoading, isSuccess } = useWaitForTransactionReceipt({ hash });

  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !studentAddress) return;

    try {
      setStatus("⏳ Étape 1/3 : Envoi du PDF sur IPFS...");
      const pdfFormData = new FormData();
      pdfFormData.append("file", file);

      const pdfRes = await fetch("http://127.0.0.1:5001/api/v0/add", {
        method: "POST",
        body: pdfFormData,
      });
      const pdfData = await pdfRes.json();
      const pdfCid = pdfData.Hash;

      setStatus("⏳ Étape 2/3 : Création des métadonnées JSON...");
      const metadata = {
        name: "Diplôme VeriDegree",
        description: "Diplôme académique non-transférable (Soulbound Token)",
        document: `ipfs://${pdfCid}`,
      };

      const metaFormData = new FormData();
      metaFormData.append(
        "file",
        new Blob([JSON.stringify(metadata)], { type: "application/json" })
      );

      const metaRes = await fetch("http://127.0.0.1:5001/api/v0/add", {
        method: "POST",
        body: metaFormData,
      });
      const metaData = await metaRes.json();
      const metaCid = metaData.Hash;
      const finalTokenURI = `ipfs://${metaCid}`;

      setStatus("⏳ Étape 3/3 : Validation sur la blockchain Besu...");

      const tokenId = BigInt(Date.now());
        alert(`Le numéro du diplôme est : ${tokenId}`);
      writeContract({
        address: VERIDEGREE_ADDRESS,
        abi: VERIDEGREE_ABI,
        functionName: "safeMint",
        args: [studentAddress, tokenId, finalTokenURI],
      });

    } catch (error) {
      console.error(error);
      setStatus("❌ Erreur lors du processus.");
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <h1 className="text-4xl font-bold mb-8">Administration - Émission de diplôme</h1>

      <form onSubmit={handleMint} className="flex flex-col gap-4 w-1/3 bg-gray-100 p-6 rounded-lg text-black">
        <div>
          <label className="block font-bold mb-1">Adresse de l'étudiant :</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            placeholder="0x..."
            value={studentAddress}
            onChange={(e) => setStudentAddress(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block font-bold mb-1">Fichier du diplôme (PDF) :</label>
          <input
            type="file"
            accept="application/pdf"
            className="w-full"
            onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !studentAddress || !file}
          className="bg-blue-600 text-white font-bold py-2 px-4 rounded mt-4 disabled:bg-gray-400"
        >
          {isLoading ? "Transaction en cours..." : "Émettre le Diplôme"}
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="font-semibold">{status}</p>
        {hash && <p className="text-sm mt-2">Hash de transaction: {hash}</p>}
        {isSuccess && (
          <p className="text-green-500 font-bold mt-2">
            ✅ Diplôme émis avec succès (Soulbound) !
          </p>
        )}
      </div>
    </main>
  );
}