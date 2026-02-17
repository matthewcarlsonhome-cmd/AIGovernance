'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { getDemoExceptions, checkExpirations, createRiskException } from '@/lib/exceptions';
import type { RiskException, ExceptionStatus } from '@/types';
import { Shield, Clock, AlertTriangle, CheckCircle, XCircle, Plus } from 'lucide-react';

const STATUS_CONFIG: Record<ExceptionStatus, { label: string; color: string }> = {
  requested: { label: 'Pending Review', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  approved: { label: 'Approved', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  denied: { label: 'Denied', color: 'bg-red-100 text-red-800 border-red-200' },
  expired: { label: 'Expired', color: 'bg-slate-100 text-slate-600 border-slate-200' },
  revoked: { label: 'Revoked', color: 'bg-orange-100 text-orange-800 border-orange-200' },
};

function daysUntilExpiry(expiresAt: string): number {
  return Math.ceil((new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

export default function ExceptionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = React.use(params);
  const [exceptions, setExceptions] = useState<RiskException[]>(() => getDemoExceptions(projectId));
  const [showNewForm, setShowNewForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newJustification, setNewJustification] = useState('');
  const [newControls, setNewControls] = useState('');
  const [newDuration, setNewDuration] = useState('30');

  const { expired, expiring_soon } = checkExpirations(exceptions);

  function handleApprove(id: string) {
    setExceptions((prev) =>
      prev.map((e) =>
        e.id === id
          ? { ...e, status: 'approved' as ExceptionStatus, approved_by: 'user-admin', approved_at: new Date().toISOString(), updated_at: new Date().toISOString() }
          : e,
      ),
    );
  }

  function handleDeny(id: string) {
    setExceptions((prev) =>
      prev.map((e) =>
        e.id === id
          ? { ...e, status: 'denied' as ExceptionStatus, approved_by: 'user-admin', approved_at: new Date().toISOString(), notes: 'Insufficient compensating controls', updated_at: new Date().toISOString() }
          : e,
      ),
    );
  }

  function handleCreate() {
    const exc = createRiskException({
      project_id: projectId,
      organization_id: 'org-demo-001',
      title: newTitle,
      justification: newJustification,
      compensating_controls: newControls.split('\n').filter(Boolean),
      requested_by: 'current-user',
      duration_days: parseInt(newDuration) || 30,
    });
    setExceptions((prev) => [exc, ...prev]);
    setShowNewForm(false);
    setNewTitle('');
    setNewJustification('');
    setNewControls('');
    setNewDuration('30');
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Risk Exceptions</h1>
          <p className="text-slate-500 mt-1">Manage time-bound exceptions with compensating controls and expiry tracking.</p>
        </div>
        <Button onClick={() => setShowNewForm(!showNewForm)} className="bg-slate-900 text-white hover:bg-slate-800">
          <Plus className="h-4 w-4 mr-2" /> Request Exception
        </Button>
      </div>

      {(expired.length > 0 || expiring_soon.length > 0) && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">
                {expired.length > 0 && `${expired.length} expired exception(s). `}
                {expiring_soon.length > 0 && `${expiring_soon.length} expiring within 7 days.`}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {showNewForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-slate-900">New Exception Request</CardTitle>
            <CardDescription className="text-slate-500">Document the risk or control exception with justification and compensating controls.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-slate-700">Exception Title</Label>
              <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Brief description of the exception" className="mt-1" />
            </div>
            <div>
              <Label className="text-slate-700">Justification</Label>
              <Textarea value={newJustification} onChange={(e) => setNewJustification(e.target.value)} placeholder="Why is this exception needed?" className="mt-1" rows={3} />
            </div>
            <div>
              <Label className="text-slate-700">Compensating Controls (one per line)</Label>
              <Textarea value={newControls} onChange={(e) => setNewControls(e.target.value)} placeholder="List compensating controls..." className="mt-1" rows={3} />
            </div>
            <div>
              <Label className="text-slate-700">Duration (days)</Label>
              <Input type="number" value={newDuration} onChange={(e) => setNewDuration(e.target.value)} className="mt-1 w-32" />
            </div>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button onClick={handleCreate} disabled={!newTitle || !newJustification} className="bg-slate-900 text-white hover:bg-slate-800">Submit Request</Button>
            <Button variant="outline" onClick={() => setShowNewForm(false)}>Cancel</Button>
          </CardFooter>
        </Card>
      )}

      <div className="space-y-4">
        {exceptions.map((exc) => {
          const days = daysUntilExpiry(exc.expires_at);
          const isExpired = days <= 0 && exc.status === 'approved';
          const statusConfig = STATUS_CONFIG[isExpired ? 'expired' : exc.status];

          return (
            <Card key={exc.id} className={isExpired ? 'border-red-200' : ''}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-4 w-4 text-slate-400" />
                      <h3 className="font-medium text-slate-900">{exc.title}</h3>
                      <Badge className={statusConfig.color} variant="outline">{statusConfig.label}</Badge>
                      {exc.status === 'approved' && !isExpired && (
                        <Badge variant="outline" className={days <= 7 ? 'text-orange-700 border-orange-200' : 'text-slate-500 border-slate-200'}>
                          <Clock className="h-3 w-3 mr-1" /> {days} days remaining
                        </Badge>
                      )}
                      {isExpired && (
                        <Badge className="bg-red-100 text-red-800 border-red-200" variant="outline">
                          <AlertTriangle className="h-3 w-3 mr-1" /> Expired
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 mb-3">{exc.justification}</p>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-slate-500">Compensating Controls:</p>
                      <ul className="text-xs text-slate-500 space-y-1">
                        {exc.compensating_controls.map((ctrl, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <CheckCircle className="h-3 w-3 text-emerald-500 mt-0.5 flex-shrink-0" />
                            {ctrl}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  {exc.status === 'requested' && (
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleApprove(exc.id)} className="bg-emerald-600 text-white hover:bg-emerald-700">
                        <CheckCircle className="h-4 w-4 mr-1" /> Approve
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDeny(exc.id)} className="text-red-600 border-red-200 hover:bg-red-50">
                        <XCircle className="h-4 w-4 mr-1" /> Deny
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
