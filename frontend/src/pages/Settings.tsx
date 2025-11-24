import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Building, Bell, Shield, Users, HardDrive } from "lucide-react";
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

interface SecuritySettings {
  two_factor_auth: boolean;
  audit_logging: boolean;
  auto_logout: boolean;
}

interface DataSettings {
  auto_backup: boolean;
  last_backup: string;
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
  
  const [security, setSecurity] = useState<SecuritySettings>({
    two_factor_auth: false,
    audit_logging: true,
    auto_logout: true
  });
  
  const [dataSettings, setDataSettings] = useState<DataSettings>({
    auto_backup: true,
    last_backup: new Date().toISOString()
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
        setSecurity(data.security);
        setDataSettings({
          auto_backup: data.data_management.auto_backup,
          last_backup: data.data_management.last_backup
        });
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

  const handleSecurityToggle = async (key: keyof SecuritySettings) => {
    const newSecurity = { ...security, [key]: !security[key] };
    setSecurity(newSecurity);
    
    try {
      const token = getAuthToken();
      const response = await axios.put(
        `${API_URL}/settings/security`,
        newSecurity,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        toast.success("Security settings updated");
      }
    } catch (error: any) {
      toast.error("Failed to update security settings");
      setSecurity(security);
    }
  };

  const handleDataToggle = async () => {
    const newSettings = { ...dataSettings, auto_backup: !dataSettings.auto_backup };
    setDataSettings(newSettings);
    
    try {
      const token = getAuthToken();
      const response = await axios.put(
        `${API_URL}/settings/data-management`,
        { auto_backup: newSettings.auto_backup },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        toast.success("Data settings updated");
      }
    } catch (error: any) {
      toast.error("Failed to update data settings");
      setDataSettings(dataSettings);
    }
  };

  const handleBackupNow = async () => {
    try {
      const token = getAuthToken();
      const response = await axios.post(
        `${API_URL}/settings/backup`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setDataSettings(prev => ({ ...prev, last_backup: response.data.data.last_backup }));
        toast.success("Backup completed successfully");
      }
    } catch (error: any) {
      toast.error("Failed to create backup");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
                                      <Shield className="h-4 w-4 text-primary" />
                                      Admin
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="accountant">
                                    <div className="flex items-center gap-2">
                                      <Users className="h-4 w-4 text-green-500" />
                                      Accountant
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="teacher">
                                    <div className="flex items-center gap-2">
                                      <Users className="h-4 w-4 text-blue-500" />
                                      Teacher
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="principal">
                                    <div className="flex items-center gap-2">
                                      <Users className="h-4 w-4 text-purple-500" />
                                      Principal
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
                <Switch 
                  checked={security.two_factor_auth}
                  onCheckedChange={() => handleSecurityToggle('two_factor_auth')}
                  disabled={!isAdmin}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Audit Logging</p>
                  <p className="text-sm text-muted-foreground">Track all system changes</p>
                </div>
                <Switch 
                  checked={security.audit_logging}
                  onCheckedChange={() => handleSecurityToggle('audit_logging')}
                  disabled={!isAdmin}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Auto Logout</p>
                  <p className="text-sm text-muted-foreground">After 30 min inactivity</p>
                </div>
                <Switch 
                  checked={security.auto_logout}
                  onCheckedChange={() => handleSecurityToggle('auto_logout')}
                  disabled={!isAdmin}
                />
              </div>
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
                <Switch 
                  checked={dataSettings.auto_backup}
                  onCheckedChange={handleDataToggle}
                  disabled={!isAdmin}
                />
              </div>
              <div className="space-y-2">
                <Label>Last Backup</Label>
                <p className="text-sm text-muted-foreground">{formatDate(dataSettings.last_backup)}</p>
              </div>
              {isAdmin && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" onClick={handleBackupNow}>Backup Now</Button>
                    <Button variant="outline">Restore Data</Button>
                  </div>
                  <Button variant="destructive" className="w-full">
                    Export All Data
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;