"use client";

import { useState } from "react";
import { SignInButton, UserButton, useAuth } from "@clerk/nextjs";
import { ThemeSwitcher } from "./theme-switcher";
// แนะนำให้ติดตั้ง lucide-react (npm install lucide-react) เพื่อใช้ไอคอนสวยๆ ครับ
import { Loader2, Utensils } from "lucide-react";

export default function Home() {
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
    // 🛑 ป้องกันการกดซ้ำที่ระดับ Function
    if (!image || loading) return;

    setLoading(true);
    setResult(""); // ล้างค่าเก่าทิ้งก่อนเริ่มใหม่

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: image }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setResult(data.recipe || "Could not analyze the image.");
      } else {
        // ดึง Error Message จาก API มาแสดง (เช่น 429 Too Many Requests)
        setResult(data.details || data.error || "Something went wrong.");
      }
    } catch (error) {
      setResult("Error connecting to AI. Please check your connection.");
    } finally {
      // ✅ คืนสถานะ Loading ไม่ว่าจะสำเร็จหรือพัง เพื่อให้กดใหม่ได้
      setLoading(false);
    }
  };

  if (!isLoaded) return <div className="p-8">Loading...</div>;

  return (
    <main className="min-h-screen p-8 max-w-2xl mx-auto font-sans">
      <nav className="flex justify-between items-center mb-10 border-b dark:border-gray-700 pb-4">
        <div className="flex items-center gap-2">
          <Utensils className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold">🍳 Snap & Cook</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <ThemeSwitcher />
          {!isSignedIn ? (
            <SignInButton mode="modal" fallbackRedirectUrl="/"/>
          ) : (
            <UserButton />
          )}
        </div>
      </nav>

      {!isSignedIn ? (
        <div className="text-center mt-20 p-10 border rounded-2xl bg-gray-50 dark:bg-gray-900 dark:border-gray-800">
          <h2 className="text-xl mb-4 font-semibold">Ready to cook?</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Please log in to use the AI Recipe Generator.</p>
          <SignInButton mode="modal">
             <button className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-8 rounded-full font-medium transition-all">
                Login with Clerk
             </button>
          </SignInButton>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 p-6 text-center rounded-lg dark:bg-gray-900 transition-all hover:border-blue-400">
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageUpload} 
              className="mb-4 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {image && (
              <div className="relative group">
                <img src={image} alt="Preview" className="max-h-64 mx-auto rounded-md shadow-md transition-transform group-hover:scale-[1.02]" />
              </div>
            )}
          </div>

          <button
            onClick={analyzeImage}
            disabled={!image || loading}
            className={`flex items-center justify-center gap-2 py-3 px-6 rounded-lg font-semibold transition-all shadow-md
              ${loading 
                ? "bg-gray-400 cursor-not-allowed text-white" 
                : "bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-500 text-white active:scale-95"
              }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                AI is analyzing...
              </>
            ) : (
              "Generate Recipe"
            )}
          </button>

          {result && (
            <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-800 rounded-xl shadow-inner border dark:border-gray-700 text-gray-900 dark:text-gray-100 animate-in fade-in duration-500">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span>🍽️</span> Your AI Recipe:
              </h2>
              <div className="max-w-none leading-relaxed whitespace-pre-wrap">
                <p>{result}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}