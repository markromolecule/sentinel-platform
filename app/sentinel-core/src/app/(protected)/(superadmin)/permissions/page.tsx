"use client";

import { PageHeader } from "@/components/common";
import { MOCK_ROLES, MOCK_PERMISSIONS } from "@sentinel/shared/mock-data";
import { 
    Tabs, 
    TabsContent, 
    TabsList, 
    TabsTrigger, 
    DataTable, 
    Button 
} from "@sentinel/ui";
import { Plus } from "lucide-react";
import { columns } from "./_components/columns";
import { roleColumns } from "./_components/role-columns";

export default function SuperadminPermissionsPage() {
    return (
        <div className="flex flex-col gap-6 md:p-6 p-4">
            <PageHeader
                title="Permissions & Roles"
                description="Manage user roles and define granular system permissions."
            >
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Create Role
                </Button>
            </PageHeader>

            <Tabs defaultValue="roles" className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="roles">Roles</TabsTrigger>
                    <TabsTrigger value="permissions">Permissions Index</TabsTrigger>
                </TabsList>
                
                <TabsContent value="roles" className="space-y-4">
                    <DataTable
                        columns={roleColumns}
                        data={MOCK_ROLES}
                        searchKey="name"
                        searchPlaceholder="Search roles..."
                        facets={[]}
                    />
                </TabsContent>
                
                <TabsContent value="permissions" className="space-y-4">
                    <DataTable
                        columns={columns}
                        data={MOCK_PERMISSIONS}
                        searchKey="name"
                        searchPlaceholder="Search permissions..."
                        facets={[]}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}
