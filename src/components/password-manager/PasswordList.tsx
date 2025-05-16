
import React from "react";
import { Edit, Trash } from "lucide-react";
import { Button } from "../ui/button";
import { PasswordEntry } from "../../types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface PasswordListProps {
  passwords: PasswordEntry[];
  isLoading: boolean;
  error: Error | null;
  onEdit: (password: PasswordEntry) => void;
  onDelete: (id: string) => void;
}

export const PasswordList: React.FC<PasswordListProps> = ({
  passwords,
  isLoading,
  error,
  onEdit,
  onDelete,
}) => {
  if (isLoading) {
    return <div className="text-center py-10">Carregando senhas...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-10 text-red-500">
        Erro ao carregar senhas. Verifique a conexão com o servidor.
      </div>
    );
  }

  return (
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
                      <span className="h-4 w-4 text-gray-400 mr-2">🔑</span>
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
                    <Button variant="ghost" size="sm" className="mr-2" onClick={() => onEdit(entry)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-600 hover:text-red-800"
                      onClick={() => onDelete(entry.id)}
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
  );
};
