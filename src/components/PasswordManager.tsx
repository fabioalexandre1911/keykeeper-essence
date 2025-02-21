
import React, { useState, useEffect } from "react";
import { Folder, Key, Lock, Edit, Trash, Plus, Import, ArrowUpFromLine, Menu } from "lucide-react";
import { Button } from "./ui/button";
import { CreatePasswordModal } from "./CreatePasswordModal";
import { useToast } from "./ui/use-toast";

interface PasswordEntry {
  id: string;
  title: string;
  login: string;
  password: string;
  url: string;
  modified: string;
}

interface Folder {
  id: string;
  name: string;
  type: "folder";
  items: (Folder | PasswordEntry)[];
}

const STORAGE_KEY = 'password-manager-data';

const PasswordManager = () => {
  const [passwords, setPasswords] = useState<PasswordEntry[]>(() => {
    const savedPasswords = localStorage.getItem(STORAGE_KEY);
    return savedPasswords ? JSON.parse(savedPasswords) : [
      {
        id: "1",
        title: "ccloud.com",
        login: "user@email.com",
        password: "********",
        url: "https://app.ccloud.com",
        modified: "6/13/2019, 9:44:00 AM",
      },
    ];
  });

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState("Example Safe");
  const [editingPassword, setEditingPassword] = useState<PasswordEntry | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(passwords));
  }, [passwords]);

  const handleCreatePassword = (data: { title: string; login: string; password: string; url: string }) => {
    if (editingPassword) {
      // Modo edição
      const updatedPasswords = passwords.map(p => 
        p.id === editingPassword.id 
          ? { ...p, ...data, modified: new Date().toLocaleString() }
          : p
      );
      setPasswords(updatedPasswords);
      setEditingPassword(null);
      toast({
        title: "Senha atualizada",
        description: "A senha foi atualizada com sucesso!",
      });
    } else {
      // Modo criação
      const newPassword: PasswordEntry = {
        id: Date.now().toString(),
        ...data,
        modified: new Date().toLocaleString(),
      };
      setPasswords([...passwords, newPassword]);
      toast({
        title: "Senha adicionada",
        description: "A nova senha foi salva com sucesso!",
      });
    }
    setIsCreateModalOpen(false);
  };

  const handleEdit = (password: PasswordEntry) => {
    setEditingPassword(password);
    setIsCreateModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setPasswords(passwords.filter(p => p.id !== id));
    toast({
      title: "Senha excluída",
      description: "A senha foi excluída com sucesso!",
    });
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

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Login/Password
                    </th>
                    <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      URL
                    </th>
                    <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Modified
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {passwords.map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50">
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Key className="h-4 w-4 text-gray-400 mr-2" />
                          {entry.title}
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="truncate max-w-[150px] sm:max-w-none">{entry.login}</div>
                          <div className="truncate max-w-[150px] sm:max-w-none">{entry.password}</div>
                        </div>
                      </td>
                      <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                        <a href={entry.url} className="text-blue-600 hover:text-blue-800 truncate block max-w-[200px]">
                          {entry.url}
                        </a>
                      </td>
                      <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {entry.modified}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
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
