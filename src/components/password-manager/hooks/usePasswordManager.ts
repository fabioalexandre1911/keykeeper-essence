
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

  // Função para exportar senhas
  const handleExport = () => {
    if (!passwords || passwords.length === 0) {
      toast({
        title: "Nenhuma senha para exportar",
        description: "Adicione senhas primeiro antes de exportar.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Formata os dados como texto
      let txtContent = "GERENCIADOR DE SENHAS - EXPORTAÇÃO\n";
      txtContent += "==============================\n\n";

      passwords.forEach((entry, index) => {
        txtContent += `Senha ${index + 1}:\n`;
        txtContent += `Título: ${entry.title}\n`;
        txtContent += `Login: ${entry.login}\n`;
        txtContent += `Senha: ${entry.password}\n`;
        txtContent += `URL: ${entry.url}\n`;
        txtContent += `Modificado: ${entry.modified}\n`;
        txtContent += "------------------------------\n\n";
      });

      // Cria um blob com o conteúdo
      const blob = new Blob([txtContent], { type: "text/plain;charset=utf-8" });
      
      // Cria um link para download e simula um clique
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `senhas_exportadas_${new Date().toLocaleDateString().replace(/\//g, "-")}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Exportação concluída",
        description: "Suas senhas foram exportadas com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao exportar senhas:", error);
      toast({
        title: "Erro na exportação",
        description: "Não foi possível exportar suas senhas.",
        variant: "destructive",
      });
    }
  };

  // Função para importar senhas
  const handleImport = () => {
    try {
      // Cria um input de arquivo oculto
      const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.accept = ".txt";
      
      fileInput.onchange = async (e) => {
        const target = e.target as HTMLInputElement;
        const file = target.files?.[0];
        
        if (!file) {
          return;
        }
        
        const reader = new FileReader();
        
        reader.onload = async (event) => {
          try {
            const content = event.target?.result as string;
            const entries = parseImportedText(content);
            
            if (entries.length === 0) {
              throw new Error("Nenhuma senha encontrada no arquivo");
            }
            
            // Importa as senhas uma a uma
            for (const entry of entries) {
              await passwordService.create(entry);
            }
            
            // Atualiza os dados
            queryClient.invalidateQueries({ queryKey: ['passwords'] });
            
            toast({
              title: "Importação concluída",
              description: `${entries.length} senhas foram importadas com sucesso.`,
            });
          } catch (error) {
            console.error("Erro ao processar arquivo:", error);
            toast({
              title: "Erro na importação",
              description: "O formato do arquivo não é válido.",
              variant: "destructive",
            });
          }
        };
        
        reader.readAsText(file);
      };
      
      // Simula clique no input de arquivo
      fileInput.click();
    } catch (error) {
      console.error("Erro ao importar senhas:", error);
      toast({
        title: "Erro na importação",
        description: "Não foi possível importar suas senhas.",
        variant: "destructive",
      });
    }
  };

  // Função para parsear o arquivo de texto importado
  const parseImportedText = (text: string): Array<Omit<PasswordEntry, 'id' | 'modified'>> => {
    const entries: Array<Omit<PasswordEntry, 'id' | 'modified'>> = [];
    
    // Divide o conteúdo pelas linhas de separação
    const blocks = text.split("------------------------------");
    
    for (const block of blocks) {
      // Busca por padrões nos dados
      const titleMatch = block.match(/Título:\s*(.+)/);
      const loginMatch = block.match(/Login:\s*(.+)/);
      const passwordMatch = block.match(/Senha:\s*(.+)/);
      const urlMatch = block.match(/URL:\s*(.+)/);
      
      // Se encontrou pelo menos título, login e senha, considera um entrada válida
      if (titleMatch && loginMatch && passwordMatch) {
        entries.push({
          title: titleMatch[1].trim(),
          login: loginMatch[1].trim(),
          password: passwordMatch[1].trim(),
          url: urlMatch ? urlMatch[1].trim() : '',
        });
      }
    }
    
    return entries;
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
    handleExport,
    handleImport,
  };
};
