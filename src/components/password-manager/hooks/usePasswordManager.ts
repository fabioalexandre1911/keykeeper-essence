
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { passwordService } from "../../../services/api";
import { PasswordEntry } from "../../../types";

export const usePasswordManager = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState("Example Safe");
  const [editingPassword, setEditingPassword] = useState<PasswordEntry | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch passwords
  const { 
    data: passwords = [], 
    isLoading, 
    error 
  } = useQuery({
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

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return {
    passwords,
    isLoading,
    error,
    isCreateModalOpen,
    setIsCreateModalOpen,
    selectedFolder,
    setSelectedFolder,
    editingPassword,
    setEditingPassword,
    isSidebarOpen,
    setIsSidebarOpen,
    handleCreatePassword,
    handleEdit,
    handleDelete,
    handleLogout,
    toggleSidebar,
  };
};
