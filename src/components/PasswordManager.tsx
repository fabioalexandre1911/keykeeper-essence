
import React, { useState } from "react";
import { Folder, Key, Lock, Edit, Trash, Plus, Import, ArrowUpFromLine, Menu, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { CreatePasswordModal } from "./CreatePasswordModal";
import { useToast } from "./ui/use-toast";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { passwordService } from "../services/api";
import { PasswordEntry } from "../types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const PasswordManager = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState("Example Safe");
  const [editingPassword, setEditingPassword] = useState<PasswordEntry | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch passwords
  const { data: passwords = [], isLoading, error } = useQuery({
    queryKey: ['passwords'],
    queryFn: passwordService.getAll,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Create password mutation
  const createMutation = useMutation({
    mutationFn: passwordService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['passwords'] });
      toast({
        title: "Senha adicionada",
        description: "A nova senha foi salva com sucesso!",
      });
    },
    onError: (error) => {
      console.error("Error creating password:", error);
      toast({
        title: "Erro ao adicionar senha",
        description: "Não foi possível salvar a senha.",
        variant: "destructive",
      });
    }
  });

  // Update password mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: Omit<PasswordEntry, 'id' | 'modified'> }) => 
      passwordService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['passwords'] });
      toast({
        title: "Senha atualizada",
        description: "A senha foi atualizada com sucesso!",
      });
    },
    onError: (error) => {
      console.error("Error updating password:", error);
      toast({
        title: "Erro ao atualizar senha",
        description: "Não foi possível atualizar a senha.",
        variant: "destructive",
      });
    }
  });

  // Delete password mutation
  const deleteMutation = useMutation({
    mutationFn: passwordService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['passwords'] });
      toast({
        title: "Senha excluída",
        description: "A senha foi excluída com sucesso!",
      });
    },
    onError: (error) => {
      console.error("Error deleting password:", error);
      toast({
        title: "Erro ao excluir senha",
        description: "Não foi possível excluir a senha.",
        variant: "destructive",
      });
    }
  });

  const handleCreatePassword = (data: { title: string; login: string; password: string; url: string }) => {
    if (editingPassword) {
      // Modo edição
      updateMutation.mutate({ 
        id: editingPassword.id, 
        data 
      });
      setEditingPassword(null);
    } else {
      // Modo criação
      createMutation.mutate(data);
    }
    setIsCreateModalOpen(false);
  };

  const handleEdit = (password: PasswordEntry) => {
    setEditingPassword(password);
    setIsCreateModalOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleLogout = () => {
    localStorage.removeItem("password-manager-auth");
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso.",
    });
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-primary p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            className="text-white lg:hidden" 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-white text-xl md:text-2xl font-bold">GESTÃO DE SENHAS</h1>
        </div>
        <div className="flex space-x-4">
          <Button variant="ghost" className="text-white">
            <Lock className="h-5 w-5" />
          </Button>
          <Button variant="ghost" className="text-white">
            <Key className="h-5 w-5" />
          </Button>
          <Button variant="ghost" className="text-white" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <div className="flex h-[calc(100vh-64px)]">
        {/* Sidebar - responsivo */}
        <div className={`${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transform transition-transform duration-200 ease-in-out fixed lg:relative w-64 bg-secondary border-r border-gray-200 p-4 h-[calc(100vh-64px)] z-50 lg:translate-x-0`}>
          <div className="space-y-2">
            <div className="flex items-center space-x-2 p-2 bg-blue-600 text-white rounded">
              <Folder className="h-5 w-5" />
              <span>Example Safe</span>
            </div>
            <div className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded cursor-pointer">
              <Folder className="h-5 w-5" />
              <span>Imported</span>
            </div>
            <div className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded cursor-pointer">
              <Folder className="h-5 w-5" />
              <span>Backup</span>
            </div>
          </div>

          <div className="absolute bottom-4 left-4 space-y-2 w-[calc(100%-2rem)]">
            <Button size="sm" variant="outline" className="w-full">
              <Import className="h-4 w-4 mr-2" />
              Import
            </Button>
            <Button size="sm" variant="outline" className="w-full">
              <ArrowUpFromLine className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Overlay para fechar o sidebar em telas pequenas */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main content - responsivo */}
        <div className="flex-1 p-4 overflow-x-auto w-full">
          <div className="mb-4">
            <Button 
              className="bg-green-500 hover:bg-green-600"
              onClick={() => {
                setEditingPassword(null);
                setIsCreateModalOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">New Password Safe</span>
              <span className="sm:hidden">New</span>
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-10">Carregando senhas...</div>
          ) : error ? (
            <div className="text-center py-10 text-red-500">
              Erro ao carregar senhas. Verifique a conexão com o servidor.
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead className="w-[200px]">Title</TableHead>
                      <TableHead className="w-[200px]">Login/Password</TableHead>
                      <TableHead className="hidden sm:table-cell">URL</TableHead>
                      <TableHead className="hidden md:table-cell">Modified</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {passwords.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-10">
                          Nenhuma senha encontrada. Clique em "New Password Safe" para adicionar.
                        </TableCell>
                      </TableRow>
                    ) : (
                      passwords.map((entry) => (
                        <TableRow key={entry.id} className="hover:bg-gray-50">
                          <TableCell>
                            <div className="flex items-center">
                              <Key className="h-4 w-4 text-gray-400 mr-2" />
                              {entry.title}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="truncate max-w-[150px] sm:max-w-none">{entry.login}</div>
                              <div className="truncate max-w-[150px] sm:max-w-none">{entry.password}</div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <a href={entry.url} className="text-blue-600 hover:text-blue-800 truncate block max-w-[200px]">
                              {entry.url}
                            </a>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-sm text-gray-500">
                            {entry.modified}
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" className="mr-2" onClick={() => handleEdit(entry)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-600 hover:text-red-800"
                              onClick={() => handleDelete(entry.id)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>
      </div>

      <CreatePasswordModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingPassword(null);
        }}
        onSave={handleCreatePassword}
        initialData={editingPassword}
      />
    </div>
  );
};

export default PasswordManager;
