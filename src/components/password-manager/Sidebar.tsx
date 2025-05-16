
import React from "react";
import { Folder, Import, ArrowUpFromLine } from "lucide-react";
import { Button } from "../ui/button";

interface SidebarProps {
  selectedFolder: string;
  setSelectedFolder: (folder: string) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  selectedFolder,
  setSelectedFolder,
  isSidebarOpen,
  setIsSidebarOpen,
}) => {
  return (
    <>
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
    </>
  );
};
