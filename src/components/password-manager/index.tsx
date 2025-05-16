
import React from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { ActionBar } from "./ActionBar";
import { PasswordList } from "./PasswordList";
import { CreatePasswordModal } from "../CreatePasswordModal";
import { usePasswordManager } from "./hooks/usePasswordManager";

const PasswordManager = () => {
  const {
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
  } = usePasswordManager();

  return (
    <div className="min-h-screen bg-white">
      <Header 
        toggleSidebar={toggleSidebar}
        onLogout={handleLogout}
      />

      <div className="flex h-[calc(100vh-64px)]">
        <Sidebar
          selectedFolder={selectedFolder}
          setSelectedFolder={setSelectedFolder}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />

        {/* Main content - responsivo */}
        <div className="flex-1 p-4 overflow-x-auto w-full">
          <ActionBar 
            onCreatePassword={() => {
              setEditingPassword(null);
              setIsCreateModalOpen(true);
            }} 
          />

          <PasswordList
            passwords={passwords}
            isLoading={isLoading}
            error={error}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
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
