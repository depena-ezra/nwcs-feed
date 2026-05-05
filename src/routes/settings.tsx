import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, User as UserIcon, Database, Shield, Save, Download, Upload } from "lucide-react";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — FEED System" },
      { name: "description", content: "Configure school information, preferences, backup, and security." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <AppLayout title="Settings" subtitle="Configure system preferences and security">
      <Toaster richColors position="top-right" />

      <Tabs defaultValue="school" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="school" className="gap-2"><Building2 className="h-4 w-4" /> School</TabsTrigger>
          <TabsTrigger value="prefs" className="gap-2"><UserIcon className="h-4 w-4" /> Preferences</TabsTrigger>
          <TabsTrigger value="backup" className="gap-2"><Database className="h-4 w-4" /> Backup</TabsTrigger>
          <TabsTrigger value="security" className="gap-2"><Shield className="h-4 w-4" /> Security</TabsTrigger>
        </TabsList>

        <TabsContent value="school" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">School Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="School Name" defaultValue="San Isidro Elementary School" />
                <Field label="School ID" defaultValue="136521" />
                <Field label="Division" defaultValue="Division of Bulacan" />
                <Field label="Default School Year" defaultValue="2024-2025" />
              </div>
              <SaveBar />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prefs" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">User Preferences</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <ToggleRow label="Email Notifications" desc="Receive email updates for finalized reports" defaultOn />
              <ToggleRow label="Daily Summary" desc="Get a daily attendance recap at 5:00 PM" defaultOn />
              <ToggleRow label="Compact Tables" desc="Show more rows per page" />
              <SaveBar />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Backup & Restore</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-border bg-muted/40 p-4">
                <div className="text-sm font-medium">Last backup</div>
                <div className="text-xs text-muted-foreground">May 4, 2026 — 11:32 PM (automatic)</div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => toast.success("Backup created")} className="gap-2"><Download className="h-4 w-4" /> Create Backup</Button>
                <Button variant="outline" onClick={() => toast.success("Restore initiated")} className="gap-2"><Upload className="h-4 w-4" /> Restore from File</Button>
              </div>
              <ToggleRow label="Automatic nightly backup" desc="Run backup every day at 11:00 PM" defaultOn />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Security Settings</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Session Timeout</Label>
                  <Select defaultValue="30">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Minimum Password Length</Label>
                  <Select defaultValue="8">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6">6 characters</SelectItem>
                      <SelectItem value="8">8 characters</SelectItem>
                      <SelectItem value="12">12 characters</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <ToggleRow label="Require strong passwords" desc="Enforce uppercase, number, and symbol" defaultOn />
              <ToggleRow label="Lock account after 5 failed attempts" desc="Helps prevent brute force attacks" defaultOn />
              <ToggleRow label="Force password change every 90 days" desc="Periodic password rotation" />
              <SaveBar />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}

function Field({ label, defaultValue }: { label: string; defaultValue: string }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input defaultValue={defaultValue} />
    </div>
  );
}
function ToggleRow({ label, desc, defaultOn }: { label: string; desc: string; defaultOn?: boolean }) {
  const [on, setOn] = useState(!!defaultOn);
  return (
    <div className="flex items-center justify-between rounded-lg border border-border p-3">
      <div>
        <Label className="text-sm">{label}</Label>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <Switch checked={on} onCheckedChange={setOn} />
    </div>
  );
}
function SaveBar() {
  return (
    <div className="flex justify-end pt-2">
      <Button onClick={() => toast.success("Settings saved")} className="gap-2"><Save className="h-4 w-4" /> Save Changes</Button>
    </div>
  );
}
