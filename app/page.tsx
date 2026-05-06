"use client";

import { useState } from "react";
// 1. Remove SignedIn/SignedOut and import useAuth instead
import { SignInButton, UserButton, useAuth } from "@clerk/nextjs";

export default function Home() {
  // 2. Initialize the auth hook
  const { isSignedIn, isLoaded } = useAuth();
  
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async () => {
    if (!image) return;
    setLoading(true);
    setResult("");

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: image }),
      });

      const data = await response.json();
      setResult(data.recipe || "Could not analyze the image.");
    } catch (error) {
      setResult("Error connecting to AI.");
    } finally {
      setLoading(false);
    }
  };

  // Prevent UI flashing before Clerk loads
  if (!isLoaded) return <div className="p-8">Loading...</div>;

  return (
    <main className="min-h-screen p-8 max-w-2xl mx-auto font-sans">
      <nav className="flex justify-between items-center mb-10 border-b pb-4">
        <h1 className="text-2xl font-bold">🍳 Snap & Cook</h1>
        
        
        {!isSignedIn ? (
          <SignInButton mode="modal" fallbackRedirectUrl="/"/>
        ) : (
          <UserButton />
        )}
      </nav>

      
      {!isSignedIn ? (
        <div className="text-center mt-20">
          <h2 className="text-xl mb-4">Please log in to use the AI Recipe Generator.</h2>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="border-2 border-dashed p-6 text-center rounded-lg">
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageUpload} 
              className="mb-4"
            />
            {image && (
              <img src={image} alt="Preview" className="max-h-64 mx-auto rounded-md shadow-md" />
            )}
          </div>

          <button
            onClick={analyzeImage}
            disabled={!image || loading}
            className="bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold disabled:bg-gray-400 transition-colors"
          >
            {loading ? "AI is analyzing..." : "Generate Recipe"}
          </button>

          {result && (
            <div className="mt-8 p-6 bg-gray-50 rounded-lg shadow-inner whitespace-pre-wrap">
              <h2 className="text-xl font-bold mb-4">🍽️ Your AI Recipe:</h2>
              <p>{result}</p>
            </div>
          )}
        </div>
      )}
    </main>
  );
}