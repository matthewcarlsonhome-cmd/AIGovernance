'use client';

import { useState } from 'react';
import { Users, Plus, Mail, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  roleLabel: string;
  initials: string;
  tasks: number;
  color: string;
}

const TEAM: TeamMember[] = [
  { id: 'u1', name: 'Sarah Chen', email: 'sarah.chen@corp.com', role: 'admin', roleLabel: 'Project Lead', initials: 'SC', tasks: 12, color: 'bg-violet-500' },
  { id: 'u2', name: 'James Wilson', email: 'james.wilson@corp.com', role: 'it', roleLabel: 'IT Security Lead', initials: 'JW', tasks: 8, color: 'bg-blue-500' },
  { id: 'u3', name: 'Maria Garcia', email: 'maria.garcia@corp.com', role: 'legal', roleLabel: 'Legal Counsel', initials: 'MG', tasks: 5, color: 'bg-amber-500' },
  { id: 'u4', name: 'Alex Kim', email: 'alex.kim@corp.com', role: 'engineering', roleLabel: 'Engineering Lead', initials: 'AK', tasks: 15, color: 'bg-emerald-500' },
  { id: 'u5', name: 'David Park', email: 'david.park@corp.com', role: 'executive', roleLabel: 'Executive Sponsor', initials: 'DP', tasks: 3, color: 'bg-rose-500' },
  { id: 'u6', name: 'Lisa Zhang', email: 'lisa.zhang@corp.com', role: 'marketing', roleLabel: 'Marketing Director', initials: 'LZ', tasks: 4, color: 'bg-cyan-500' },
];

const roleColors: Record<string, string> = { admin: 'bg-violet-100 text-violet-800', it: 'bg-blue-100 text-blue-800', legal: 'bg-amber-100 text-amber-800', engineering: 'bg-emerald-100 text-emerald-800', executive: 'bg-rose-100 text-rose-800', marketing: 'bg-cyan-100 text-cyan-800' };

export default function TeamPage() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            Project Team
          </h1>
          <p className="text-muted-foreground mt-1">{TEAM.length} members assigned to this project</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" /> Add Team Member
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle className="text-base">Add New Team Member</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label>Full Name</Label>
                <Input placeholder="Enter name" className="mt-1" />
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" placeholder="Enter email" className="mt-1" />
              </div>
              <div>
                <Label>Role</Label>
                <select className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="">Select role...</option>
                  <option value="admin">Admin</option>
                  <option value="consultant">Consultant</option>
                  <option value="executive">Executive</option>
                  <option value="it">IT / Security</option>
                  <option value="legal">Legal</option>
                  <option value="engineering">Engineering</option>
                  <option value="marketing">Marketing</option>
                </select>
              </div>
              <div className="flex items-end">
                <Button className="w-full">Add Member</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {TEAM.map((member) => (
          <Card key={member.id}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className={`w-12 h-12 rounded-full ${member.color} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                  {member.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold">{member.name}</h3>
                  <Badge className={`${roleColors[member.role]} mt-1`}>{member.roleLabel}</Badge>
                  <div className="flex items-center gap-1.5 mt-2 text-sm text-muted-foreground">
                    <Mail className="h-3.5 w-3.5" />
                    <span className="truncate">{member.email}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
                    <ClipboardList className="h-3.5 w-3.5" />
                    <span>{member.tasks} tasks assigned</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm" className="flex-1">View Tasks</Button>
                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">Remove</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
