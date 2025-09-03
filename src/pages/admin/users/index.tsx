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
import { userService } from "@/services/api";

interface User {
  id: number;
  username: string;
  email: string;
  name?: string;
  roles: string[];
  createdAt: string;
  notificationsEnabled: boolean;
}

interface UsersResponse {
  content: User[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

export default function UsersManagement() {
  const router = useRouter();
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Vérifier les permissions d'accès
  useEffect(() => {
    if (user !== null && !isAdmin(user)) {
      router.push("/dashboard");
      return;
    }
  }, [user, router]);

  // Charger les utilisateurs
  const fetchUsers = async (page: number = 1, search: string = "") => {
    try {
      setLoading(true);
      setError(null);

      const data: UsersResponse = await userService.getAll(page - 1, 10, search);
      setUsers(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
      setCurrentPage(data.number + 1);
    } catch (err) {
      console.error("Erreur lors du chargement des utilisateurs:", err);
      setError(err instanceof Error ? err.message : "Erreur lors du chargement des utilisateurs");
    } finally {
      setLoading(false);
    }
  };

  // Supprimer un utilisateur
  const deleteUser = async (userId: number) => {
    try {
      await userService.delete(userId);
      // Recharger la liste
      await fetchUsers(currentPage, searchTerm);
      onClose();
    } catch (err) {
      console.error("Erreur lors de la suppression:", err);
      setError(err instanceof Error ? err.message : "Erreur lors de la suppression");
    }
  };

  // Charger les utilisateurs au montage et lors des changements
  useEffect(() => {
    if (user && isAdmin(user)) {
      fetchUsers(currentPage, searchTerm);
    }
  }, [user, currentPage]);

  // Gérer la recherche
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
    fetchUsers(1, value);
  };

  // Gérer la pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchUsers(page, searchTerm);
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
                Gestion des Utilisateurs
              </h1>
              <p className="text-gray-600 mt-2">
                Gérez les comptes utilisateurs de la plateforme
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
              <NextLink href="/admin/users/create">
                <Button className="bg-cesizen-600 hover:bg-cesizen-700 text-white">
                  + Nouvel utilisateur
                </Button>
              </NextLink>
            </div>
          </div>

          {/* Barre de recherche */}
          <Card className="mb-6">
            <CardBody>
              <div className="flex gap-4 items-center">
                <Input
                  placeholder="Rechercher par nom, email ou nom d'utilisateur..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="flex-1"
                  startContent={<span className="text-gray-400">🔍</span>}
                />
                <div className="text-sm text-gray-500">
                  {totalElements} utilisateur{totalElements > 1 ? 's' : ''}
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

          {/* Tableau des utilisateurs */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Liste des utilisateurs</h2>
            </CardHeader>
            <CardBody>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cesizen-600 mx-auto mb-4"></div>
                  <p className="text-gray-500">Chargement des utilisateurs...</p>
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Aucun utilisateur trouvé.</p>
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableColumn>UTILISATEUR</TableColumn>
                      <TableColumn>EMAIL</TableColumn>
                      <TableColumn>RÔLES</TableColumn>
                      <TableColumn>NOTIFICATIONS</TableColumn>
                      <TableColumn>DATE CRÉATION</TableColumn>
                      <TableColumn>ACTIONS</TableColumn>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                                                          <div className="w-10 h-10 bg-gradient-to-r from-cesizen-500 to-cesizen-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-bold text-sm">
                                {(user.name || user.username).charAt(0).toUpperCase()}
                              </span>
                            </div>
                              <div>
                                <div className="font-medium">{user.name || user.username}</div>
                                <div className="text-sm text-gray-500">@{user.username}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {user.roles?.map((role, index) => (
                                <Chip
                                  key={index}
                                  size="sm"
                                  variant="flat"
                                  className={
                                    role === "ADMIN" 
                                      ? "bg-cesizen-100 text-cesizen-800" 
                                      : "bg-cesizen-50 text-cesizen-700"
                                  }
                                >
                                  {role === "ADMIN" ? "Admin" : "Utilisateur"}
                                </Chip>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Chip
                              size="sm"
                              variant="flat"
                              className={
                                user.notificationsEnabled 
                                  ? "bg-green-100 text-green-800" 
                                  : "bg-gray-100 text-gray-800"
                              }
                            >
                              {user.notificationsEnabled ? "Activées" : "Désactivées"}
                            </Chip>
                          </TableCell>
                          <TableCell>
                            {new Date(user.createdAt).toLocaleDateString()}
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
                                  key="edit"
                                  onClick={() => router.push(`/admin/users/edit/${user.id}`)}
                                >
                                  ✏️ Modifier
                                </DropdownItem>
                                <DropdownItem
                                  key="delete"
                                  className="text-red-600"
                                  onClick={() => {
                                    setSelectedUser(user);
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
                  Êtes-vous sûr de vouloir supprimer l'utilisateur{" "}
                  <strong>{selectedUser?.name || selectedUser?.username}</strong> ?
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
                  onClick={() => selectedUser && deleteUser(selectedUser.id)}
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