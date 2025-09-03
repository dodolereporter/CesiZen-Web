import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import { isAdmin } from "@/utils/userUtils";
import DefaultLayout from "@/layouts/default";
import { tokenService } from "@/services/tokenService";
import { articleService } from "@/services/api";
import { articleCategories, defaultCategory } from "@/config/categories";
import { Button } from "@heroui/button";
import { Input, Textarea } from "@heroui/input";
import { Card, CardHeader, CardBody } from "@heroui/card";
import { Switch } from "@heroui/switch";
import { Select, SelectItem } from "@heroui/select";
import RichEditor from "@/components/RichEditor";

interface EditArticleData {
  title: string;
  content: string;
  excerpt: string;
  imageUrl: string;
  category: string;
  tags: string[];
  isPublished: boolean;
  isDraft: boolean;
}

interface Article {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  imageUrl: string;
  category: string;
  tags: string[];
  isPublished: boolean | null | undefined; // Peut être null/undefined depuis l'API
  author: {
    id: number;
    username: string;
    email: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Catégories importées du fichier de configuration

export default function EditArticle() {
  const router = useRouter();
  const { id } = router.query;
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tagsInput, setTagsInput] = useState("");
  const [articleData, setArticleData] = useState<EditArticleData>({
    title: '',
    content: '',
    excerpt: '',
    imageUrl: '',
    category: defaultCategory,
    tags: [],
    isPublished: true,
    isDraft: false, // Par défaut, article publié donc pas de brouillon
  });
  const [initialLoading, setInitialLoading] = useState(true);

  // Debug: Fonction pour tester le Select
  const testSelectState = () => {
    console.log("=== TEST SELECT STATE ===");
    console.log("articleData.category:", articleData.category);
    console.log("defaultCategory:", defaultCategory);
    console.log("articleCategories:", articleCategories);
    console.log("selectedKeys:", articleData.category ? new Set([articleData.category]) : new Set());
    console.log("=========================");
  };
  
  // Tester l'état du Select après chaque changement
  useEffect(() => {
    testSelectState();
  }, [articleData.category]);

  // Vérifier les permissions d'accès
  useEffect(() => {
    if (user === null && !authLoading) {
      // Utilisateur non connecté
      router.push("/login");
      return;
    }
    if (user !== null && !isAdmin(user)) {
      router.push("/dashboard");
      return;
    }
  }, [user, router, authLoading]);

  // Charger les données de l'article
  useEffect(() => {
    if (id && typeof id === 'string') {
      fetchArticle(id);
    }
  }, [id]);

  const fetchArticle = async (articleId: string) => {
    try {
      setInitialLoading(true);
      setError(null);

      // Utiliser le service API pour récupérer l'article
      const article: Article = await articleService.getById(Number(articleId));
      
      console.log("Article récupéré:", article);
      console.log("=== DEBUG PUBLICATION STATUS ===");
      console.log("article.isPublished:", article.isPublished);
      console.log("typeof article.isPublished:", typeof article.isPublished);
      console.log("article.isPublished === null:", article.isPublished === null);
      console.log("article.isPublished === undefined:", article.isPublished === undefined);
      console.log("Boolean(article.isPublished):", Boolean(article.isPublished));
      console.log("=== END DEBUG ===");
      console.log("Catégorie de l'article:", article.category);
      console.log("Catégories disponibles:", articleCategories);
      
      // Vérifier si la catégorie de l'article existe dans la liste
      const categoryExists = article.category && articleCategories.includes(article.category as any);
      const processedCategory = categoryExists ? article.category : defaultCategory;
      
      // Gérer les valeurs null/undefined pour isPublished
      const isPublishedValue = article.isPublished === null || article.isPublished === undefined 
        ? true  // Par défaut, considérer comme publié
        : Boolean(article.isPublished);
      
      setArticleData({
        title: article.title,
        content: article.content,
        excerpt: article.excerpt,
        imageUrl: article.imageUrl || '',
        category: processedCategory,
        tags: article.tags || [],
        isPublished: isPublishedValue,
        isDraft: !isPublishedValue,
      });
      
      console.log("Article chargé - isPublished:", isPublishedValue, "isDraft:", !isPublishedValue);

      // Préparer les tags pour l'affichage
      setTagsInput((article.tags || []).join(', '));
      
      console.log("Données article définies:", {
        title: article.title,
        category: processedCategory,
        tags: article.tags || []
      });
      
      console.log("Catégorie brute:", article.category);
      console.log("Catégorie traitée:", processedCategory);
      console.log("Catégorie existe dans la liste:", categoryExists);
    } catch (err) {
      console.error("Erreur lors du chargement:", err);
      setError(err instanceof Error ? err.message : "Erreur lors du chargement de l'article");
    } finally {
      setInitialLoading(false);
    }
  };

  const handleInputChange = (field: keyof EditArticleData, value: string | boolean | string[]) => {
    const updates: Partial<EditArticleData> = { [field]: value };
    
    // Si on change isPublished, mettre à jour isDraft automatiquement
    if (field === 'isPublished' && typeof value === 'boolean') {
      updates.isDraft = !value;
    }
    
    // Si on change isDraft, mettre à jour isPublished automatiquement  
    if (field === 'isDraft' && typeof value === 'boolean') {
      updates.isPublished = !value;
    }
    
    setArticleData(prev => ({ ...prev, ...updates }));
    setError(null);
  };

  const handleTagsChange = (value: string) => {
    setTagsInput(value);
    // Convertir les tags en tableau (séparés par des virgules)
    const tagsArray = value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    handleInputChange('tags', tagsArray);
  };

  const validateForm = (): string | null => {
    if (!articleData.title.trim()) return "Le titre est requis";
    if (!articleData.content.trim()) return "Le contenu est requis";
    if (articleData.title.length > 255) return "Le titre ne peut pas dépasser 255 caractères";
    if (articleData.excerpt.length > 500) return "L'extrait ne peut pas dépasser 500 caractères";
    
    // Vérifier que les valeurs booléennes sont correctes
    if (typeof articleData.isPublished !== 'boolean') return "Erreur de validation : isPublished doit être un boolean";
    if (typeof articleData.isDraft !== 'boolean') return "Erreur de validation : isDraft doit être un boolean";
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Vérifier l'authentification avant de continuer
      if (!tokenService.getToken() || tokenService.isTokenExpired()) {
        setError("Votre session a expiré. Veuillez vous reconnecter.");
        router.push("/login");
        return;
      }

      // Préparer les données à envoyer avec les bons noms de champs
      // Forcer explicitement les valeurs booléennes
      const isPublishedFinal = articleData.isPublished === null || articleData.isPublished === undefined 
        ? true 
        : Boolean(articleData.isPublished);
      const isDraftFinal = articleData.isDraft === null || articleData.isDraft === undefined 
        ? false 
        : Boolean(articleData.isDraft);
      
      const updateData = {
        title: articleData.title,
        content: articleData.content,
        excerpt: articleData.excerpt,
        imageUrl: articleData.imageUrl,
        category: articleData.category,
        tags: articleData.tags,
        isDraft: isDraftFinal,        // Utiliser camelCase pour correspondre au DTO
        isPublished: isPublishedFinal, // Utiliser camelCase pour correspondre au DTO
      };
      
      console.log("=== DONNÉES À ENVOYER ===");
      console.log("Données complètes:", JSON.stringify(updateData, null, 2));
      console.log("isPublished:", updateData.isPublished, "type:", typeof updateData.isPublished);
      console.log("isDraft:", updateData.isDraft, "type:", typeof updateData.isDraft);
      console.log("=== FIN DEBUG ===");
      
      // Test temporaire supprimé - utilisation du service API normal
      
      // Utiliser le service API pour mettre à jour l'article
      await articleService.update(Number(id), updateData);
      
      // Rediriger vers la liste des articles après succès
      router.push("/admin/articles");
    } catch (err) {
      console.error("Erreur lors de la modification:", err);
      
      // Extraire le message d'erreur détaillé
      let errorMessage = "Erreur lors de la modification de l'article";
      
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Protection d'accès
  if (user === null && !authLoading) {
    return (
      <DefaultLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4 text-red-600">Connexion requise</h1>
            <p className="mb-6 text-gray-500">Vous devez être connecté pour modifier un article.</p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => router.push("/login")} className="bg-cesizen-600 hover:bg-cesizen-700 text-white">
                Se connecter
              </Button>
              <Button onClick={() => router.push("/admin/articles")} variant="ghost" className="text-gray-600">
                ← Retour aux articles
              </Button>
            </div>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  if (user !== null && !isAdmin(user)) {
    return (
      <DefaultLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4 text-red-600">Accès refusé</h1>
            <p className="mb-6 text-gray-500">Vous n'avez pas les permissions pour accéder à cette page.</p>
            <Button onClick={() => router.push("/dashboard")} className="bg-cesizen-600 hover:bg-cesizen-700 text-white">
              ← Retour au dashboard
            </Button>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  // Chargement initial
  if (initialLoading) {
    return (
      <DefaultLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cesizen-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement de l'article...</p>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div className="min-h-screen bg-gradient-to-br from-cesizen-50 via-cesizen-100 to-cesizen-200">
        <div className="container mx-auto px-4 py-8">
          {/* En-tête */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cesizen-600 to-cesizen-700 bg-clip-text text-transparent">
                Modifier l'Article
              </h1>
              <p className="text-gray-600 mt-2">
                Modifiez cet article pour la plateforme
              </p>
            </div>
            <Button
              onClick={() => router.push("/admin/articles")}
              variant="ghost"
              className="text-gray-600"
            >
              ← Retour à la liste
            </Button>
          </div>

          {/* Formulaire */}
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Affichage des erreurs */}
              {error && (
                <Card className="border-l-4 border-l-red-500">
                  <CardBody>
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                      {error}
                    </div>
                  </CardBody>
                </Card>
              )}

              {/* Informations de base */}
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-semibold">Informations générales</h2>
                </CardHeader>
                <CardBody className="space-y-4">
                  <Input
                    label="Titre de l'article"
                    placeholder="Entrez le titre de votre article..."
                    value={articleData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    isRequired
                    description={`${articleData.title.length}/255 caractères`}
                  />

                  <Textarea
                    label="Extrait (résumé)"
                    placeholder="Rédigez un court résumé de votre article..."
                    value={articleData.excerpt}
                    onChange={(e) => handleInputChange('excerpt', e.target.value)}
                    minRows={3}
                    description={`${articleData.excerpt.length}/500 caractères`}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select
                      key={`category-${articleData.category}`}
                      label="Catégorie"
                      selectedKeys={articleData.category ? new Set([articleData.category]) : new Set()}
                      onSelectionChange={(keys) => {
                        const value = Array.from(keys)[0] as string;
                        console.log("Catégorie sélectionnée:", value);
                        console.log("Keys reçues:", keys);
                        handleInputChange('category', value);
                      }}
                    >
                      {articleCategories.map((category) => {
                        console.log("Option catégorie:", category, "Sélectionnée:", articleData.category === category);
                        return (
                          <SelectItem key={category}>
                            {category}
                          </SelectItem>
                        );
                      })}
                    </Select>
                    {/* Debug info */}
                    <div className="text-xs text-gray-500 mt-1">
                      Debug: Catégorie actuelle = "{articleData.category}"
                    </div>

                    <Input
                      label="URL de l'image"
                      placeholder="https://exemple.com/image.jpg"
                      value={articleData.imageUrl}
                      onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                      description="Image de couverture (optionnel)"
                    />
                  </div>

                  <Input
                    label="Tags"
                    placeholder="respiration, méditation, bien-être"
                    value={tagsInput}
                    onChange={(e) => handleTagsChange(e.target.value)}
                    description="Séparez les tags par des virgules"
                  />

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Publier immédiatement</h3>
                      <p className="text-sm text-gray-500">
                        L'article sera visible par tous les utilisateurs
                      </p>
                    </div>
                    <Switch
                      isSelected={articleData.isPublished}
                      onValueChange={(value) => handleInputChange('isPublished', value)}
                    />
                  </div>
                </CardBody>
              </Card>

              {/* Contenu de l'article */}
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-semibold">Contenu de l'article</h2>
                </CardHeader>
                <CardBody>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Contenu *
                    </label>
                    <RichEditor
                      value={articleData.content}
                      onChange={(value) => handleInputChange('content', value)}
                      placeholder="Rédigez le contenu de votre article..."
                      height="400px"
                    />
                  </div>
                </CardBody>
              </Card>

              {/* Aperçu des tags */}
              {articleData.tags.length > 0 && (
                <Card>
                  <CardHeader>
                    <h2 className="text-xl font-semibold">Aperçu des tags</h2>
                  </CardHeader>
                  <CardBody>
                    <div className="flex flex-wrap gap-2">
                      {articleData.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="bg-cesizen-100 text-cesizen-800 text-sm px-3 py-1 rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </CardBody>
                </Card>
              )}

              {/* Boutons d'action */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => router.push("/admin/articles")}
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  isLoading={loading}
                  className="bg-cesizen-600 hover:bg-cesizen-700 text-white flex-1"
                >
                  {loading ? "Modification..." : articleData.isPublished ? "Publier l'article" : "Sauvegarder le brouillon"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
} 