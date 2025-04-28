
import React from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AdminHeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole: 'admin' | 'super_admin';
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ activeTab, setActiveTab, userRole }) => {
  return (
    <div className="mb-6 space-y-4">
      <h1 className="text-3xl font-bold">Admin Panel</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full md:w-auto grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="venues">Venues</TabsTrigger>
          {userRole === 'super_admin' && (
            <>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </>
          )}
        </TabsList>
      </Tabs>
    </div>
  );
};

export default AdminHeader;
