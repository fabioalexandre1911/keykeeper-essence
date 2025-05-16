
import React from "react";
import { Plus } from "lucide-react";
import { Button } from "../ui/button";

interface ActionBarProps {
  onCreatePassword: () => void;
}

export const ActionBar: React.FC<ActionBarProps> = ({ onCreatePassword }) => {
  return (
    <div className="mb-4">
      <Button 
        className="bg-green-500 hover:bg-green-600"
        onClick={onCreatePassword}
      >
        <Plus className="h-4 w-4 mr-2" />
        <span className="hidden sm:inline">New Password Safe</span>
        <span className="sm:hidden">New</span>
      </Button>
    </div>
  );
};
