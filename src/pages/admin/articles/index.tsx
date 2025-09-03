import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import { isAdmin } from "@/utils/userUtils";
import DefaultLayout from "@/layouts/default";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Card, CardHeader, CardBody } from "@heroui/card";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { Chip } from "@heroui/chip";
import { Pagination } from "@heroui/pagination";
import { 
  Dropdown, 
  DropdownTrigger, 
  DropdownMenu, 
  DropdownItem 
} from "@heroui/dropdown";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { useDisclosure } from "@heroui/use-disclosure";
import NextLink from "next/link";

interface Article {
  id: number;
  title: string;
  excerpt?: string;
  category?: string;
  tags?: string[];
  isPublished: boolean;
  author: {
    id: number;
    username: string;
    name?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface ArticlesResponse {
  content: Article[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

export default function ArticlesManagement() {
  const router = useRouter();
  const { user } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Vérifier les permissions d'accès
  useEffect(() => {
    if (user !== null && !isAdmin(user)) {
      router.push("/dashboard");
      return;
    }
  }, [user, router]);

  // Charger les articles
  const fetchArticles = async (page: number = 1, search: string = "") => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: (page - 1).toString(),
        size: "10",
        ...(search && { search })
      });

      // Utiliser fetch sans token car les articles sont publics en lecture
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/v1/articles?${params}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const data: ArticlesResponse = await response.json();
      setArticles(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
      setCurrentPage(data.number + 1);
    } catch (err) {
      console.error("Erreur lors du chargement des articles:", err);
      setError(err instanceof Error ? err.message : "Erreur lors du chargement des articles");
    } finally {
      setLoading(false);
    }
  };

  // Supprimer un article
  const deleteArticle = async (articleId: number) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/v1/articles/${articleId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      // Recharger la liste
      await fetchArticles(currentPage, searchTerm);
      onClose();
    } catch (err) {
      console.error("Erreur lors de la suppression:", err);
      setError(err instanceof Error ? err.message : "Erreur lors de la suppression");
    }
  };

  // Charger les articles au montage et lors des changements
  useEffect(() => {
    if (user && isAdmin(user)) {
      fetchArticles(currentPage, searchTerm);
    }
  }, [user, currentPage]);

  // Gérer la recherche
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
    fetchArticles(1, value);
  };

  // Gérer la pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchArticles(page, searchTerm);
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
                Gestion des Articles
              </h1>
              <p className="text-gray-600 mt-2">
                Créez et gérez les articles de la plateforme
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => router.push("/dashboard")}
                variant="ghost"
                className="text-gray-600"
              >
                ← Dashboard
              </Button>
              <NextLink href="/admin/articles/create">
                <Button className="bg-cesizen-600 hover:bg-cesizen-700 text-white">
                  + Nouvel article
                </Button>
              </NextLink>
            </div>
          </div>

          {/* Barre de recherche */}
          <Card className="mb-6">
            <CardBody>
              <div className="flex gap-4 items-center">
                <Input
                  placeholder="Rechercher par titre ou contenu..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="flex-1"
                  startContent={<span className="text-gray-400">🔍</span>}
                />
                <div className="text-sm text-gray-500">
                  {totalElements} article{totalElements > 1 ? 's' : ''}
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Affichage des erreurs */}
          {error && (
            <Card className="mb-6 border-l-4 border-l-red-500">
              <CardBody>
                <div className="text-red-700 bg-red-50 p-3 rounded">
                  {error}
                </div>
              </CardBody>
            </Card>
          )}

          {/* Tableau des articles */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Liste des articles</h2>
            </CardHeader>
            <CardBody>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cesizen-600 mx-auto mb-4"></div>
                  <p className="text-gray-500">Chargement des articles...</p>
                </div>
              ) : articles.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Aucun article trouvé.</p>
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableColumn>TITRE</TableColumn>
                      <TableColumn>AUTEUR</TableColumn>
                      <TableColumn>CATÉGORIE</TableColumn>
                      <TableColumn>STATUT</TableColumn>
                      <TableColumn>DATE CRÉATION</TableColumn>
                      <TableColumn>ACTIONS</TableColumn>
                    </TableHeader>
                    <TableBody>
                      {articles.map((article) => (
                        <TableRow key={article.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium line-clamp-1">{article.title}</div>
                              {article.excerpt && (
                                <div className="text-sm text-gray-500 line-clamp-2 mt-1">
                                  {article.excerpt}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full flex items-center justify-center">
                                <span className="text-white font-bold text-xs">
                                  {(article.author.name || article.author.username).charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <div className="font-medium text-sm">
                                  {article.author.name || article.author.username}
                                </div>
                                <div className="text-xs text-gray-500">
                                  @{article.author.username}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {article.category ? (
                              <Chip size="sm" variant="flat" className="bg-blue-100 text-blue-800">
                                {article.category}
                              </Chip>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Chip
                              size="sm"
                              variant="flat"
                              className={
                                article.isPublished 
                                  ? "bg-green-100 text-green-800" 
                                  : "bg-yellow-100 text-yellow-800"
                              }
                            >
                              {article.isPublished ? "Publié" : "Brouillon"}
                            </Chip>
                          </TableCell>
                          <TableCell>
                            {new Date(article.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Dropdown>
                              <DropdownTrigger>
                                <Button variant="ghost" size="sm">
                                  ⋮
                                </Button>
                              </DropdownTrigger>
                              <DropdownMenu>
                                <DropdownItem
                                  key="view"
                                  onClick={() => router.push(`/articles/${article.id}`)}
                                >
                                  👁️ Voir
                                </DropdownItem>
                                <DropdownItem
                                  key="edit"
                                  onClick={() => router.push(`/admin/articles/edit/${article.id}`)}
                                >
                                  ✏️ Modifier
                                </DropdownItem>
                                <DropdownItem
                                  key="delete"
                                  className="text-red-600"
                                  onClick={() => {
                                    setSelectedArticle(article);
                                    onOpen();
                                  }}
                                >
                                  🗑️ Supprimer
                                </DropdownItem>
                              </DropdownMenu>
                            </Dropdown>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center mt-6">
                      <Pagination
                        total={totalPages}
                        page={currentPage}
                        onChange={handlePageChange}
                        showControls
                        className="gap-2"
                      />
                    </div>
                  )}
                </>
              )}
            </CardBody>
          </Card>

          {/* Modal de confirmation de suppression */}
          <Modal isOpen={isOpen} onClose={onClose}>
            <ModalContent>
              <ModalHeader>
                <h3 className="text-lg font-semibold">Confirmer la suppression</h3>
              </ModalHeader>
              <ModalBody>
                <p>
                  Êtes-vous sûr de vouloir supprimer l'article{" "}
                  <strong>{selectedArticle?.title}</strong> ?
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Cette action est irréversible.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button variant="ghost" onClick={onClose}>
                  Annuler
                </Button>
                <Button
                  color="danger"
                  onClick={() => selectedArticle && deleteArticle(selectedArticle.id)}
                >
                  Supprimer
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </div>
      </div>
    </DefaultLayout>
  );
} 