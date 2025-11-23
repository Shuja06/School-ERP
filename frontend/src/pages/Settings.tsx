import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Building, Bell, Shield, Users, HardDrive } from "lucide-react";
import { useProfiles } from "@/hooks/useProfiles";
import { useUserRoles } from "@/hooks/useUserRoles";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

const Settings = () => {
  const { data: profiles = [], isLoading: profilesLoading } = useProfiles();
  const { data: userRoles = [], isLoading: rolesLoading } = useUserRoles();
  const queryClient = useQueryClient();
  const [updatingUser, setUpdatingUser] = useState<string | null>(null);

  const getUserRole = (userId: string) => {
    const userRole = userRoles.find(r => r.user_id === userId);
    return userRole?.role || null;
  };

  const handleRoleChange = async (userId: string, newRole: "admin" | "accountant" | "teacher") => {
    setUpdatingUser(userId);
    try {
      const existingRole = userRoles.find(r => r.user_id === userId);
      
      if (existingRole) {
        const { error } = await supabase
          .from("user_roles")
          .update({ role: newRole })
          .eq("user_id", userId);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("user_roles")
          .insert([{ user_id: userId, role: newRole }]);
        
        if (error) throw error;
      }
      
      toast.success("Role updated successfully");
      queryClient.invalidateQueries({ queryKey: ["user_roles"] });
    } catch (error: any) {
      toast.error(error.message || "Failed to update role");
    } finally {
      setUpdatingUser(null);
    }
  };

  const handleRemoveRole = async (userId: string) => {
    if (!confirm("Are you sure you want to remove this user's role?")) return;
    
    setUpdatingUser(userId);
    try {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId);
      
      if (error) throw error;
      toast.success("Role removed successfully");
      queryClient.invalidateQueries({ queryKey: ["user_roles"] });
    } catch (error: any) {
      toast.error(error.message || "Failed to remove role");
    } finally {
      setUpdatingUser(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Manage system preferences & configuration</p>
        </div>

        <div className="grid grid-cols-1 gap-6 mb-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>User Role Management</CardTitle>
                  <CardDescription>Assign roles to users to control their access</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {profilesLoading || rolesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {profiles.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No users found. Users will appear here after they sign up.
                    </p>
                  ) : (
                    profiles.map((profile) => {
                      const currentRole = getUserRole(profile.id);
                      const isUpdating = updatingUser === profile.id;
                      
                      return (
                        <div
                          key={profile.id}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex-1">
                            <p className="font-medium">{profile.full_name || "No name"}</p>
                            <p className="text-sm text-muted-foreground">{profile.email}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Select
                              value={currentRole || "none"}
                              onValueChange={(value) => {
                                if (value === "none") {
                                  handleRemoveRole(profile.id);
                                } else if (value === "admin" || value === "accountant" || value === "teacher") {
                                  handleRoleChange(profile.id, value);
                                }
                              }}
                              disabled={isUpdating}
                            >
                              <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select role" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">
                                  <span className="text-muted-foreground">No Role</span>
                                </SelectItem>
                                <SelectItem value="admin">
                                  <div className="flex items-center gap-2">
                                    <Shield className="h-4 w-4 text-primary" />
                                    Admin
                                  </div>
                                </SelectItem>
                                <SelectItem value="accountant">
                                  <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-success" />
                                    Accountant
                                  </div>
                                </SelectItem>
                                <SelectItem value="teacher">
                                  <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-accent" />
                                    Teacher
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            {isUpdating && (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Building className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>School Information</CardTitle>
                  <CardDescription>Update school details</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="school-name">School Name</Label>
                <Input id="school-name" defaultValue="Greenwood High School" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="school-code">School Code</Label>
                <Input id="school-code" defaultValue="GHS-2024" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" defaultValue="123 Education Street, City" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" defaultValue="+91 98765 43210" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue="admin@greenwood.edu" />
                </div>
              </div>
              <Button className="w-full">Save Changes</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-success/10 rounded-lg">
                  <Bell className="h-5 w-5 text-success" />
                </div>
                <div>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>Configure alert preferences</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive updates via email</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">SMS Alerts</p>
                  <p className="text-sm text-muted-foreground">Fee reminders via SMS</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">WhatsApp Updates</p>
                  <p className="text-sm text-muted-foreground">Send receipts on WhatsApp</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Payment Reminders</p>
                  <p className="text-sm text-muted-foreground">Auto reminders for due fees</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-warning/10 rounded-lg">
                  <Shield className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <CardTitle>Security</CardTitle>
                  <CardDescription>Manage access & permissions</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">Add extra security layer</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Audit Logging</p>
                  <p className="text-sm text-muted-foreground">Track all system changes</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Auto Logout</p>
                  <p className="text-sm text-muted-foreground">After 30 min inactivity</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Button variant="outline" className="w-full">
                Manage User Roles
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-destructive/10 rounded-lg">
                  <HardDrive className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <CardTitle>Data Management</CardTitle>
                  <CardDescription>Backup & data operations</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Auto Backup</p>
                  <p className="text-sm text-muted-foreground">Daily database backup</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="space-y-2">
                <Label>Last Backup</Label>
                <p className="text-sm text-muted-foreground">Today at 02:00 AM</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline">Backup Now</Button>
                <Button variant="outline">Restore Data</Button>
              </div>
              <Button variant="destructive" className="w-full">
                Export All Data
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
