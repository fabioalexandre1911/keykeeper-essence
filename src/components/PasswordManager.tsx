
import React, { useState, useEffect } from "react";
import { Folder, Key, Lock, Edit, Trash, Plus, Import, ArrowUpFromLine } from "lucide-react";
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
    // Inicializa o estado com os dados do localStorage ou com o valor padrão
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
  const { toast } = useToast();

  // Salva no localStorage sempre que passwords mudar
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(passwords));
  }, [passwords]);

  const handleCreatePassword = (data: { title: string; login: string; password: string; url: string }) => {
    const newPassword: PasswordEntry = {
      id: Date.now().toString(),
      ...data,
      modified: new Date().toLocaleString(),
    };

    setPasswords([...passwords, newPassword]);
    setIsCreateModalOpen(false);
    
    toast({
      title: "Senha adicionada",
      description: "A nova senha foi salva com sucesso!",
    });
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-primary p-4 flex items-center justify-between">
        <h1 className="text-white text-2xl font-bold">GESTÃO DE SENHAS</h1>
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
        {/* Sidebar */}
        <div className="w-64 bg-secondary border-r border-gray-200 p-4">
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

          <div className="absolute bottom-4 left-4 space-x-2">
            <Button size="sm" variant="outline" className="w-full mb-2">
              <Import className="h-4 w-4 mr-2" />
              Import
            </Button>
            <Button size="sm" variant="outline" className="w-full">
              <ArrowUpFromLine className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 p-4">
          <div className="mb-4">
            <Button 
              className="bg-green-500 hover:bg-green-600"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Password Safe
            </Button>
          </div>

          <div className="bg-white rounded-lg shadow">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Login/Password
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    URL
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Modified
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {passwords.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Key className="h-4 w-4 text-gray-400 mr-2" />
                        {entry.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div>{entry.login}</div>
                        <div>{entry.password}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <a href={entry.url} className="text-blue-600 hover:text-blue-800">
                        {entry.url}
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {entry.modified}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Button variant="ghost" size="sm" className="mr-2">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-800">
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

      <CreatePasswordModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreatePassword}
      />
    </div>
  );
};

export default PasswordManager;
