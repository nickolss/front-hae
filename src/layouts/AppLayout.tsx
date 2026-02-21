import { useState, ReactNode } from "react";
import Drawer from "@mui/material/Drawer";
import { Sidebar } from "@/components/Sidebar/Sidebar";
import { Header } from "@components/Header";
import { MobileHeader } from "@components/MobileHeader";

interface AppLayoutProps {
  children: ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="h-screen flex flex-col md:grid md:grid-cols-[22%_78%] md:grid-rows-[auto_1fr]">
      {/* Sidebar Desktop */}
      <div className="hidden md:block row-span-2">
        <Sidebar />
      </div>

      {/* Mobile Header */}
      <div className="md:hidden">
        <MobileHeader onMenuClick={() => setDrawerOpen(true)} />
      </div>

      {/* Drawer Mobile */}
      <Drawer open={isDrawerOpen} onClose={() => setDrawerOpen(false)}>
        <div className="w-64 h-full bg-gray-fatec">
          <Sidebar />
        </div>
      </Drawer>

      {/* Header Desktop */}
      <div className="hidden md:block col-start-2 row-start-1">
        <Header />
      </div>

      {/* Main Content */}
      <main className="col-start-2 row-start-2 overflow-auto bg-background h-full">
        {children}
      </main>
    </div>
  );
};
