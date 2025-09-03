import { useRouter } from "next/router";
import DefaultLayout from "@/layouts/default";
import { Button } from "@heroui/button";
import React, { useEffect, useState } from "react";
import { useArticle } from "@/hooks/useArticles";
import DOMPurify from 'dompurify';

export default function ArticleDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { article, loading, error } = useArticle(Number(id));
  const [sanitizedContent, setSanitizedContent] = useState("");

  // Nettoyer le contenu HTML côté client
  useEffect(() => {
    if (article?.content && typeof window !== 'undefined') {
      const cleanContent = DOMPurify.sanitize(article.content, {
        ALLOWED_TAGS: [
          'p', 'br', 'strong', 'em', 'u', 's', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
          'ul', 'ol', 'li', 'blockquote', 'a', 'img', 'code', 'pre',
          'table', 'thead', 'tbody', 'tr', 'th', 'td', 'div', 'span'
        ],
        ALLOWED_ATTR: [
          'href', 'target', 'rel', 'src', 'alt', 'title', 'class', 'style',
          'width', 'height', 'align'
        ]
      });
      setSanitizedContent(cleanContent);
    }
  }, [article?.content]);

  if (loading) {
    return (
      <DefaultLayout>
        <div className="min-h-screen bg-gradient-to-br from-cesizen-50 via-cesizen-100 to-cesizen-200 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cesizen-600 mx-auto mb-4"></div>
            <div className="text-xl text-gray-600">Chargement de l'article...</div>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  if (error || !article) {
    return (
      <DefaultLayout>
        <div className="min-h-screen bg-gradient-to-br from-cesizen-50 via-cesizen-100 to-cesizen-200 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl text-red-600 mb-4">{error || "Article non trouvé"}</div>
            <Button onClick={() => router.push('/articles')} className="bg-cesizen-600 hover:bg-cesizen-700 text-white">
              Retour aux articles
            </Button>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div className="min-h-screen bg-gradient-to-br from-cesizen-50 via-cesizen-100 to-cesizen-200">
        {/* En-tête de l'article */}
        <div className="relative pt-8 pb-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-cesizen-600/10 to-cesizen-700/10" />
          <div className="relative max-w-4xl mx-auto px-4">
            <Button
              onClick={() => router.back()}
              variant="ghost"
              className="mb-8 text-cesizen-600 hover:bg-cesizen-50"
            >
              ← Retour
            </Button>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-cesizen-500 to-cesizen-600 rounded-full mb-6 shadow-lg">
                <span className="text-2xl">📄</span>
              </div>
              
              {article.category && (
                <div className="mb-4">
                  <span className="inline-block bg-cesizen-100 text-cesizen-800 text-sm font-semibold px-3 py-1 rounded-full">
                    {article.category}
                  </span>
                </div>
              )}

              <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6 leading-tight">
                {article.title}
              </h1>

              {article.excerpt && (
                <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                  {article.excerpt}
                </p>
              )}

              <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
                {article.author && (
                  <>
                    <div className="flex items-center space-x-2">
                      <div className="w-10 h-10 bg-gradient-to-r from-cesizen-500 to-cesizen-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">
                          {(article.author.name || article.author.username).charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span>{article.author.name || article.author.username}</span>
                    </div>
                    <span>•</span>
                  </>
                )}
                <span>{new Date(article.createdAt).toLocaleDateString('fr-FR')}</span>
                <span>•</span>
                <span>📖 Lecture</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contenu de l'article */}
        <div className="relative -mt-16">
          <div className="max-w-4xl mx-auto px-4">
            <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
              {/* Tags */}
              {article.tags && article.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-8 pb-8 border-b border-gray-100">
                  {article.tags.map((tag: string, index: number) => (
                    <span
                      key={index}
                      className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Contenu principal avec styles pour l'HTML */}
              <div className="article-content">
                {sanitizedContent ? (
                  <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
                ) : (
                  <p className="text-gray-600">Contenu de l'article non disponible.</p>
                )}
              </div>
              
              <style jsx global>{`
                .article-content {
                  color: #374151;
                  line-height: 1.75;
                  font-size: 1.125rem;
                }
                
                .article-content h1 {
                  font-size: 2.25rem;
                  font-weight: 700;
                  color: #111827;
                  margin-top: 2rem;
                  margin-bottom: 1rem;
                  line-height: 1.2;
                }
                
                .article-content h2 {
                  font-size: 1.875rem;
                  font-weight: 700;
                  color: #111827;
                  margin-top: 2rem;
                  margin-bottom: 1rem;
                  line-height: 1.3;
                }
                
                .article-content h3 {
                  font-size: 1.5rem;
                  font-weight: 600;
                  color: #111827;
                  margin-top: 1.5rem;
                  margin-bottom: 0.75rem;
                  line-height: 1.4;
                }
                
                .article-content h4 {
                  font-size: 1.25rem;
                  font-weight: 600;
                  color: #111827;
                  margin-top: 1.5rem;
                  margin-bottom: 0.75rem;
                  line-height: 1.4;
                }
                
                .article-content p {
                  margin-bottom: 1.25rem;
                  line-height: 1.7;
                }
                
                .article-content strong {
                  font-weight: 600;
                  color: #111827;
                }
                
                .article-content em {
                  font-style: italic;
                }
                
                .article-content ul {
                  margin: 1.25rem 0;
                  padding-left: 1.5rem;
                  list-style-type: disc;
                }
                
                .article-content ol {
                  margin: 1.25rem 0;
                  padding-left: 1.5rem;
                  list-style-type: decimal;
                }
                
                .article-content li {
                  margin: 0.5rem 0;
                  line-height: 1.6;
                }
                
                .article-content blockquote {
                  border-left: 4px solid #059669;
                  padding-left: 1rem;
                  margin: 1.5rem 0;
                  font-style: italic;
                  background: #f0fdf4;
                  padding: 1rem;
                  border-radius: 0 0.5rem 0.5rem 0;
                  color: #475569;
                }
                
                .article-content a {
                  color: #059669;
                  text-decoration: underline;
                  transition: color 0.2s;
                }
                
                .article-content a:hover {
                  color: #047857;
                }
                
                .article-content img {
                  max-width: 100%;
                  height: auto;
                  border-radius: 0.5rem;
                  margin: 1.5rem 0;
                  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
                }
                
                .article-content code {
                  background: #f1f5f9;
                  padding: 0.2rem 0.4rem;
                  border-radius: 0.25rem;
                  font-family: 'Monaco', 'Consolas', monospace;
                  font-size: 0.875rem;
                  color: #1e293b;
                }
                
                .article-content pre {
                  background: #1e293b;
                  color: #f1f5f9;
                  padding: 1rem;
                  border-radius: 0.5rem;
                  overflow-x: auto;
                  margin: 1.5rem 0;
                }
                
                .article-content pre code {
                  background: transparent;
                  padding: 0;
                  color: inherit;
                }
                
                .article-content table {
                  width: 100%;
                  border-collapse: collapse;
                  margin: 1.5rem 0;
                }
                
                .article-content th,
                .article-content td {
                  border: 1px solid #e5e7eb;
                  padding: 0.75rem;
                  text-align: left;
                }
                
                .article-content th {
                  background: #f9fafb;
                  font-weight: 600;
                }
              `}</style>

              {/* Pied de l'article */}
              <div className="mt-12 pt-8 border-t border-gray-100">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  {article.author && (
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-cesizen-500 to-cesizen-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {(article.author.name || article.author.username).charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">
                          {article.author.name || article.author.username}
                        </div>
                        <div className="text-sm text-gray-500">
                          Publié le {new Date(article.createdAt).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex space-x-3">
                    <Button
                      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                      className="bg-gradient-to-r from-cesizen-600 to-cesizen-700 hover:from-cesizen-700 hover:to-cesizen-800 text-white"
                    >
                      Haut de page
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Articles suggérés ou autres actions */}
        <div className="py-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">
              Envie de lire d'autres articles ?
            </h3>
            <Button
              onClick={() => router.push('/articles')}
              size="lg"
              className="bg-gradient-to-r from-cesizen-600 to-cesizen-700 hover:from-cesizen-700 hover:to-cesizen-800 text-white"
            >
              Découvrir plus d'articles
            </Button>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
} 