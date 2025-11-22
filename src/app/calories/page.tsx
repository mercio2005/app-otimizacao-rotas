'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Camera, Upload, Activity, Flame } from 'lucide-react';
import Image from 'next/image';

interface NutritionalInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  foodName: string;
  confidence: number;
}

export default function CaloriesPage() {
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [nutritionalInfo, setNutritionalInfo] = useState<NutritionalInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setNutritionalInfo(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setError(null);

    // Modo Demonstração com dados de exemplo
    setTimeout(() => {
      const demoData: NutritionalInfo = {
        calories: 450,
        protein: 25,
        carbs: 55,
        fat: 12,
        fiber: 8,
        foodName: 'Prato Misto (Demonstração)',
        confidence: 85
      };

      setNutritionalInfo(demoData);
      setIsAnalyzing(false);
      setError('⚠️ Modo Demonstração: Dados nutricionais de exemplo. Configure sua chave OpenAI para análise real.');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl relative z-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.push('/')}
            className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-orange-500/50 transition-all duration-300 backdrop-blur-xl"
          >
            <ArrowLeft className="w-6 h-6 text-slate-300" />
          </button>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
              Calories Helper
            </h1>
            <p className="text-slate-400 mt-1">Analise calorias de alimentos por foto</p>
          </div>
        </div>

        {/* Upload Section */}
        <div className="glass-effect rounded-3xl p-8 border border-slate-700/50 backdrop-blur-xl mb-8">
          <div className="text-center">
            {!selectedImage ? (
              <label className="cursor-pointer block">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <div className="border-2 border-dashed border-slate-600 rounded-2xl p-12 hover:border-orange-500/50 transition-all duration-300">
                  <Upload className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-300 text-lg mb-2">Clique para fazer upload</p>
                  <p className="text-slate-500 text-sm">ou arraste uma imagem aqui</p>
                </div>
              </label>
            ) : (
              <div className="space-y-6">
                <div className="relative w-full h-96 rounded-2xl overflow-hidden">
                  <Image
                    src={selectedImage}
                    alt="Imagem selecionada"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex gap-4 justify-center">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <div className="px-6 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-orange-500/50 transition-all duration-300 text-slate-300">
                      Trocar Imagem
                    </div>
                  </label>
                  <button
                    onClick={analyzeImage}
                    disabled={isAnalyzing}
                    className="px-8 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold hover:shadow-2xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAnalyzing ? (
                      <span className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Analisando...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Camera className="w-5 h-5" />
                        Analisar Calorias
                      </span>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="glass-effect rounded-2xl p-6 border border-orange-500/30 backdrop-blur-xl mb-8 bg-orange-500/10">
            <p className="text-orange-300 text-center">{error}</p>
          </div>
        )}

        {/* Results Section */}
        {nutritionalInfo && (
          <div className="glass-effect rounded-3xl p-8 border border-slate-700/50 backdrop-blur-xl animate-scaleIn">
            <div className="flex items-center gap-3 mb-6">
              <Activity className="w-8 h-8 text-orange-400" />
              <h2 className="text-2xl font-bold text-slate-100">Informações Nutricionais</h2>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-slate-200 mb-2">{nutritionalInfo.foodName}</h3>
              <p className="text-slate-400 text-sm">Confiança: {nutritionalInfo.confidence}%</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Calorias - Destaque */}
              <div className="col-span-2 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-2xl p-6 border border-orange-400/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Flame className="w-10 h-10 text-orange-400" />
                    <div>
                      <p className="text-slate-400 text-sm">Calorias Totais</p>
                      <p className="text-4xl font-bold text-orange-400">{nutritionalInfo.calories}</p>
                    </div>
                  </div>
                  <span className="text-slate-400 text-lg">kcal</span>
                </div>
              </div>

              {/* Proteínas */}
              <div className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700/50">
                <p className="text-slate-400 text-sm mb-2">Proteínas</p>
                <p className="text-3xl font-bold text-emerald-400">{nutritionalInfo.protein}g</p>
              </div>

              {/* Carboidratos */}
              <div className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700/50">
                <p className="text-slate-400 text-sm mb-2">Carboidratos</p>
                <p className="text-3xl font-bold text-cyan-400">{nutritionalInfo.carbs}g</p>
              </div>

              {/* Gorduras */}
              <div className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700/50">
                <p className="text-slate-400 text-sm mb-2">Gorduras</p>
                <p className="text-3xl font-bold text-yellow-400">{nutritionalInfo.fat}g</p>
              </div>

              {/* Fibras */}
              <div className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700/50">
                <p className="text-slate-400 text-sm mb-2">Fibras</p>
                <p className="text-3xl font-bold text-purple-400">{nutritionalInfo.fiber}g</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
