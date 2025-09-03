import { useState, useEffect } from 'react';
import { articleService } from '@/services/api';

export function useArticles() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError(null);
      const articlesData = await articleService.getAll();
      
      // S'assurer que articlesData est un tableau
      if (Array.isArray(articlesData)) {
        setArticles(articlesData);
      } else if (articlesData && articlesData.content && Array.isArray(articlesData.content)) {
        // Si c'est une réponse paginée
        setArticles(articlesData.content);
      } else {
        console.warn('Format de données inattendu:', articlesData);
        setArticles([]);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des articles:', err);
      setError('Erreur lors du chargement des articles');
      setArticles([]); // S'assurer que articles reste un tableau
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const createArticle = async (article: any) => {
    try {
      const newArticle = await articleService.create(article);
      setArticles(prev => [...prev, newArticle]);
      return newArticle;
    } catch (err) {
      console.error('Erreur lors de la création de l\'article:', err);
      setError('Erreur lors de la création de l\'article');
      throw err;
    }
  };

  const updateArticle = async (id: number, article: any) => {
    try {
      const updatedArticle = await articleService.update(id, article);
      setArticles(prev => prev.map(a => (a.id === id ? updatedArticle : a)));
      return updatedArticle;
    } catch (err) {
      console.error('Erreur lors de la mise à jour de l\'article:', err);
      setError('Erreur lors de la mise à jour de l\'article');
      throw err;
    }
  };

  const deleteArticle = async (id: number) => {
    try {
      await articleService.delete(id);
      setArticles(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      console.error('Erreur lors de la suppression de l\'article:', err);
      setError('Erreur lors de la suppression de l\'article');
      throw err;
    }
  };

  const getArticleById = (id: number) => articles.find(a => a.id === id);

  return {
    articles,
    loading,
    error,
    createArticle,
    updateArticle,
    deleteArticle,
    getArticleById,
    refresh: fetchArticles
  };
}

export function useArticle(id: number) {
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        setError(null);
        const articleData = await articleService.getById(id);
        setArticle(articleData);
      } catch (err) {
        console.error('Erreur lors du chargement de l\'article:', err);
        setError('Article non trouvé');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchArticle();
    }
  }, [id]);

  return { article, loading, error };
} 