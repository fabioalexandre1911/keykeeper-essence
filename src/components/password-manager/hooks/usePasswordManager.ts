
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { passwordService } from "../../../services/api";
import { PasswordEntry } from "../../../types";
import { usePasswordMutations } from "./usePasswordMutations";
import { usePasswordImportExport } from "./usePasswordImportExport";

export const usePasswordManager = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState("Example Safe");
  const [editingPassword, setEditingPassword] = useState<PasswordEntry | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const navigate = useNavigate();
  const { createMutation, updateMutation, deleteMutation } = usePasswordMutations();
  const { handleExport, handleImport } = usePasswordImportExport();

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
    navigate("/");
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Export function that uses the passwords from the current state
  const handleExportPasswords = () => {
    handleExport(passwords);
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
    handleExport: handleExportPasswords,
    handleImport,
  };
};
