import { useRouter } from "next/router";
import DefaultLayout from "@/layouts/default";
import { Button } from "@heroui/button";
import React, { useState, useEffect } from "react";
import { useArticles } from "@/hooks/useArticles";

export default function ArticlesPage() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const { articles, loading, error } = useArticles();

  // Gérer l'hydratation
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Positions fixes pour les particules
  const particlePositions = [
    { left: '10%', top: '20%', delay: '0s' },
    { left: '85%', top: '15%', delay: '0.5s' },
    { left: '20%', top: '80%', delay: '1s' },
    { left: '90%', top: '70%', delay: '1.5s' },
    { left: '50%', top: '10%', delay: '2s' },
    { left: '15%', top: '60%', delay: '0.3s' },
  ];

  // Catégories uniques
  const categories = articles.length ? 
    ["Tous", ...Array.from(new Set(articles.map(article => article.category)))] :
    ["Tous"];

  // Filtrer les articles par catégorie
  const filteredArticles = selectedCategory === "Tous" 
    ? articles 
    : articles.filter(article => article.category === selectedCategory);

  return (
    <DefaultLayout>
      <div className="min-h-screen bg-gradient-to-br from-cesizen-50 via-cesizen-100 to-cesizen-200 relative overflow-hidden">
        {/* Particules de fond */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {isClient && particlePositions.map((position, index) => (
            <div
              key={index}
              className="absolute w-3 h-3 rounded-full opacity-10 bg-cesizen-400 animate-pulse"
              style={{
                left: position.left,
                top: position.top,
                animationDelay: position.delay,
                animationDuration: '4s'
              }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-6xl mx-auto py-8 px-4">
          {/* En-tête */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-cesizen-500 to-cesizen-600 rounded-full mb-6 shadow-lg">
              <span className="text-3xl">📚</span>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cesizen-600 to-cesizen-700 bg-clip-text text-transparent mb-4">
              Articles sur la Respiration
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Découvrez des articles experts sur les techniques de respiration, le bien-être et la santé mentale
            </p>
          </div>

          {/* Affichage des erreurs */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-8 text-center">
              {error}
            </div>
          )}

          {/* Loading state */}
          {loading ? (
            <div className="text-center py-20">
              <div className="text-gray-500 text-xl">Chargement des articles...</div>
            </div>
          ) : (
            <>
              {/* Filtres par catégorie */}
              <div className="flex flex-wrap justify-center gap-3 mb-12">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`
                      px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300
                      ${selectedCategory === category
                        ? 'bg-gradient-to-r from-cesizen-600 to-cesizen-700 text-white shadow-lg'
                        : 'bg-white/70 backdrop-blur-sm text-gray-700 hover:bg-white/90 border border-white/50'
                      }
                    `}
                  >
                    {category}
                  </button>
                ))}
              </div>

              {/* Grille d'articles */}
              {filteredArticles.length === 0 ? (
                <div className="text-center py-20">
                  <div className="text-gray-500 text-xl">Aucun article trouvé.</div>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredArticles.map((article) => (
                    <article
                      key={article.id}
                      className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/50 hover:shadow-2xl transition-all duration-500 hover:scale-105 cursor-pointer"
                      onClick={() => router.push(`/articles/${article.id}`)}
                    >
                      {/* En-tête de l'article */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl">{article.image || "📄"}</span>
                          <span className="text-xs font-semibold text-cesizen-600 bg-cesizen-100 px-2 py-1 rounded-full">
                            {article.category || "Article"}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {article.readTime || "5 min"}
                        </div>
                      </div>

                      {/* Titre */}
                      <h2 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2">
                        {article.title}
                      </h2>

                      {/* Extrait */}
                      <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                        {article.excerpt || article.description}
                      </p>

                      {/* Tags */}
                                              {article.tags && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {article.tags.slice(0, 3).map((tag: string, index: number) => (
                              <span
                                key={index}
                                className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}

                      {/* Pied de l'article */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-gradient-to-r from-cesizen-500 to-cesizen-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">
                              {article.author ? (article.author.name || article.author.username || article.author).charAt(0).toUpperCase() : "A"}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-800">
                              {article.author ? (article.author.name || article.author.username || article.author) : "Auteur"}
                            </div>
                            <div className="text-xs text-gray-500">
                              {article.date || new Date().toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-cesizen-600 hover:bg-cesizen-50"
                        >
                          Lire →
                        </Button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </DefaultLayout>
  );
} 