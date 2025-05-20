
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { passwordService } from "../../../services/api";
import { PasswordEntry } from "../../../types";

export const usePasswordImportExport = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Function to parse the imported text file
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

  // Função para exportar senhas
  const handleExport = (passwords: PasswordEntry[]) => {
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

  return {
    handleExport,
    handleImport
  };
};
