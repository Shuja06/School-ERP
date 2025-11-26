import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Building, Bell, Users } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000/api/v1";

interface User {
  id: string;
  full_name: string;
  email: string;
  role: "admin" | "accountant" | "teacher" | "principal";
}

interface SchoolSettings {
  school_name: string;
  school_code: string;
  address: string;
  phone: string;
  email: string;
}

interface NotificationSettings {
  email_enabled: boolean;
  sms_enabled: boolean;
  whatsapp_enabled: boolean;
  payment_reminders: boolean;
}

const Settings = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [updatingUser, setUpdatingUser] = useState<string | null>(null);
  
  const [schoolSettings, setSchoolSettings] = useState<SchoolSettings>({
    school_name: "",
    school_code: "",
    address: "",
    phone: "",
    email: ""
  });
  
  const [notifications, setNotifications] = useState<NotificationSettings>({
    email_enabled: true,
    sms_enabled: true,
    whatsapp_enabled: false,
    payment_reminders: true
  });

  const getAuthToken = () => localStorage.getItem("token");

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      toast.error("Please login first");
      return;
    }
    
    fetchCurrentUser();
    fetchUsers();
    fetchSettings();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const token = getAuthToken();
      const response = await axios.get(`${API_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setCurrentUserRole(response.data.data.role);
        console.log("Current user role:", response.data.data.role);
      }
    } catch (error: any) {
      console.error("Error fetching current user:", error);
      toast.error("Failed to fetch user info");
    }
  };

  const fetchUsers = async () => {
    try {
      const token = getAuthToken();
      const response = await axios.get(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setUsers(response.data.data);
      }
    } catch (error: any) {
      console.error("Error fetching users:", error);
      if (error.response?.status !== 403) {
        toast.error("Failed to fetch users");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const token = getAuthToken();
      const response = await axios.get(`${API_URL}/settings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        const data = response.data.data;
        
        setSchoolSettings({
          school_name: data.school_name,
          school_code: data.school_code,
          address: data.address,
          phone: data.phone,
          email: data.email
        });
        
        setNotifications(data.notifications);
      }
    } catch (error: any) {
      console.error("Error fetching settings:", error);
      toast.error("Failed to fetch settings");
    }
  };

  const handleRoleChange = async (userId: string, newRole: "admin" | "accountant" | "teacher" | "principal") => {
    setUpdatingUser(userId);
    try {
      const token = getAuthToken();
      const response = await axios.put(
        `${API_URL}/users/${userId}/role`,
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        toast.success("Role updated successfully");
        fetchUsers();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update role");
    } finally {
      setUpdatingUser(null);
    }
  };

  const handleSchoolUpdate = async () => {
    try {
      const token = getAuthToken();
      const response = await axios.put(
        `${API_URL}/settings/school`,
        schoolSettings,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        toast.success("School information updated successfully");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update school info");
    }
  };

  const handleNotificationToggle = async (key: keyof NotificationSettings) => {
    const newNotifications = { ...notifications, [key]: !notifications[key] };
    setNotifications(newNotifications);
    
    try {
      const token = getAuthToken();
      const response = await axios.put(
        `${API_URL}/settings/notifications`,
        newNotifications,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        toast.success("Notification settings updated");
      }
    } catch (error: any) {
      toast.error("Failed to update notifications");
      setNotifications(notifications);
    }
  };

  const isAdmin = currentUserRole === "admin";

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Manage system preferences & configuration</p>
        </div>

        {isAdmin && (
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
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {users.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        No users found. Users will appear here after they sign up.
                      </p>
                    ) : (
                      users.map((user) => {
                        const isUpdating = updatingUser === user.id;
                        
                        return (
                          <div
                            key={user.id}
                            className="flex items-center justify-between p-4 border rounded-lg"
                          >
                            <div className="flex-1">
                              <p className="font-medium">{user.full_name || "No name"}</p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Select
                                value={user.role}
                                onValueChange={(value) => {
                                  if (value === "admin" || value === "accountant" || value === "teacher" || value === "principal") {
                                    handleRoleChange(user.id, value);
                                  }
                                }}
                                disabled={isUpdating}
                              >
                                <SelectTrigger className="w-[180px]">
                                  <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="admin">
                                    <div className="flex items-center gap-2">
                                      <Users className="h-4 w-4 text-primary" />
                                      Admin
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="accountant">
                                    <div className="flex items-center gap-2">
                                      <Users className="h-4 w-4 text-green-500" />
                                      Accountant
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="principal">
                                    <div className="flex items-center gap-2">
                                      <Users className="h-4 w-4 text-purple-500" />
                                      Principal
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="teacher">
                                    <div className="flex items-center gap-2">
                                      <Users className="h-4 w-4 text-blue-500" />
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
        )}

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
                <Input 
                  id="school-name" 
                  value={schoolSettings.school_name}
                  onChange={(e) => setSchoolSettings({...schoolSettings, school_name: e.target.value})}
                  disabled={!isAdmin}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="school-code">School Code</Label>
                <Input 
                  id="school-code" 
                  value={schoolSettings.school_code}
                  onChange={(e) => setSchoolSettings({...schoolSettings, school_code: e.target.value})}
                  disabled={!isAdmin}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input 
                  id="address" 
                  value={schoolSettings.address}
                  onChange={(e) => setSchoolSettings({...schoolSettings, address: e.target.value})}
                  disabled={!isAdmin}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input 
                    id="phone" 
                    value={schoolSettings.phone}
                    onChange={(e) => setSchoolSettings({...schoolSettings, phone: e.target.value})}
                    disabled={!isAdmin}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={schoolSettings.email}
                    onChange={(e) => setSchoolSettings({...schoolSettings, email: e.target.value})}
                    disabled={!isAdmin}
                  />
                </div>
              </div>
              {isAdmin && (
                <Button className="w-full" onClick={handleSchoolUpdate}>Save Changes</Button>
              )}
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
                <Switch 
                  checked={notifications.email_enabled} 
                  onCheckedChange={() => handleNotificationToggle('email_enabled')}
                  disabled={!isAdmin}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">SMS Alerts</p>
                  <p className="text-sm text-muted-foreground">Fee reminders via SMS</p>
                </div>
                <Switch 
                  checked={notifications.sms_enabled}
                  onCheckedChange={() => handleNotificationToggle('sms_enabled')}
                  disabled={!isAdmin}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">WhatsApp Updates</p>
                  <p className="text-sm text-muted-foreground">Send receipts on WhatsApp</p>
                </div>
                <Switch 
                  checked={notifications.whatsapp_enabled}
                  onCheckedChange={() => handleNotificationToggle('whatsapp_enabled')}
                  disabled={!isAdmin}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Payment Reminders</p>
                  <p className="text-sm text-muted-foreground">Auto reminders for due fees</p>
                </div>
                <Switch 
                  checked={notifications.payment_reminders}
                  onCheckedChange={() => handleNotificationToggle('payment_reminders')}
                  disabled={!isAdmin}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;