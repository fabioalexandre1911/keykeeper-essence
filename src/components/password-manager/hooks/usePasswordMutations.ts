
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { passwordService } from "../../../services/api";
import { PasswordEntry } from "../../../types";

export const usePasswordMutations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  return {
    createMutation,
    updateMutation,
    deleteMutation
  };
};
