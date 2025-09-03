import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import { isAdmin } from "@/utils/userUtils";
import DefaultLayout from "@/layouts/default";
import { articleCategories, defaultCategory } from "@/config/categories";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Textarea } from "@heroui/input";
import { Card, CardHeader, CardBody } from "@heroui/card";
import { Switch } from "@heroui/switch";
import { Select, SelectItem } from "@heroui/select";
import RichEditor from "@/components/RichEditor";

interface CreateArticleData {
  title: string;
  content: string;
  excerpt: string;
  imageUrl: string;
  category: string;
  tags: string[];
  isPublished: boolean;
}

// Catégories importées du fichier de configuration

export default function CreateArticle() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tagsInput, setTagsInput] = useState("");
  const [articleData, setArticleData] = useState<CreateArticleData>({
    title: '',
    content: '',
    excerpt: '',
    imageUrl: '',
    category: defaultCategory,
    tags: [],
    isPublished: true,
  });

  // Vérifier les permissions d'accès
  useEffect(() => {
    if (user !== null && !isAdmin(user)) {
      router.push("/dashboard");
      return;
    }
  }, [user, router]);

  const handleInputChange = (field: keyof CreateArticleData, value: string | boolean | string[]) => {
    setArticleData(prev => ({ ...prev, [field]: value }));
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

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token d'authentification manquant");
      }

      const response = await fetch("/api/v1/articles", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(articleData),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Erreur ${response.status}: ${errorData || response.statusText}`);
      }

      router.push("/admin/articles");
    } catch (err) {
      console.error("Erreur lors de la création:", err);
      setError(err instanceof Error ? err.message : "Erreur lors de la création de l'article");
    } finally {
      setLoading(false);
    }
  };

  // Protection d'accès
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

  return (
    <DefaultLayout>
      <div className="min-h-screen bg-gradient-to-br from-cesizen-50 via-cesizen-100 to-cesizen-200">
        <div className="container mx-auto px-4 py-8">
          {/* En-tête */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cesizen-600 to-cesizen-700 bg-clip-text text-transparent">
                Créer un Article
              </h1>
              <p className="text-gray-600 mt-2">
                Rédigez un nouvel article pour la plateforme
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
                      label="Catégorie"
                      selectedKeys={new Set([articleData.category])}
                      onSelectionChange={(keys) => {
                        const value = Array.from(keys)[0] as string;
                        handleInputChange('category', value);
                      }}
                    >
                      {articleCategories.map((category) => (
                        <SelectItem key={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </Select>

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
                  {loading ? "Création..." : articleData.isPublished ? "Publier l'article" : "Sauvegarder le brouillon"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
} 