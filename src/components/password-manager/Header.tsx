
import React from "react";
import { Menu, Lock, Key, LogOut } from "lucide-react";
import { Button } from "../ui/button";

interface HeaderProps {
  toggleSidebar: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ toggleSidebar, onLogout }) => {
  return (
    <header className="bg-primary p-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Button 
          variant="ghost" 
          className="text-white lg:hidden" 
          onClick={toggleSidebar}
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
        <Button variant="ghost" className="text-white" onClick={onLogout}>
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
};
