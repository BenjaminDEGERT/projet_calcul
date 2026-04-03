"use client";

import { useState, useEffect } from "react";
import { useReadContract } from "wagmi";
import { VERIDEGREE_ADDRESS, VERIDEGREE_ABI } from "../../constants";

export default function StudentPage() {
  const [tokenId, setTokenId] = useState("");
  const [metadata, setMetadata] = useState<{ name: string; description: string; document: string } | null>(null);

  const { data: tokenURI, isError, isLoading } = useReadContract({
    address: VERIDEGREE_ADDRESS,
    abi: VERIDEGREE_ABI,
    functionName: "tokenURI",
    args: tokenId ? [BigInt(tokenId)] : undefined,
  });

  useEffect(() => {
    if (tokenURI && typeof tokenURI === "string") {
      const fetchMetadata = async () => {
        try {
          const gatewayUrl = tokenURI.replace("ipfs://", "http://127.0.0.1:8080/ipfs/");
          const response = await fetch(gatewayUrl);
          const data = await response.json();
          setMetadata(data);
        } catch (error) {
          console.error("Erreur lors de la récupération IPFS:", error);
        }
      };
      fetchMetadata();
    } else {
      setMetadata(null);
    }
  }, [tokenURI]);

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <h1 className="text-4xl font-bold mb-8">Espace Étudiant - Mes Diplômes</h1>

      <div className="flex flex-col gap-4 w-1/3 bg-gray-100 p-6 rounded-lg text-black mb-8">
        <label className="font-bold">Entrez votre numéro de diplôme (Token ID) :</label>
        <input
          type="number"
          className="p-2 border rounded"
          placeholder="Ex: 171234567890"
          value={tokenId}
          onChange={(e) => setTokenId(e.target.value)}
        />
      </div>

      {isLoading && <p>Recherche sur la blockchain Besu...</p>}
      {isError && <p className="text-red-500">Ce diplôme n'existe pas ou une erreur est survenue.</p>}

      {metadata && (
        <div className="w-full max-w-4xl bg-white border border-gray-300 shadow-xl rounded-lg p-8 text-black flex flex-col items-center">
          <h2 className="text-3xl font-bold text-blue-600 mb-2">{metadata.name}</h2>
          <p className="text-gray-600 mb-6 italic">{metadata.description}</p>

          <div className="w-full h-[600px] border-2 border-gray-200 rounded">
            <iframe
              src={metadata.document.replace("ipfs://", "http://127.0.0.1:8080/ipfs/")}
              className="w-full h-full"
              title="Diplôme PDF"
            />
          </div>
        </div>
      )}
    </main>
  );
}