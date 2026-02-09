'use client';

import { useState } from 'react';
import { FileOutput, Download, Loader2, CheckCircle, Briefcase, Scale, Shield, Code, Megaphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ReportType {
  id: string;
  persona: string;
  icon: React.ElementType;
  format: string;
  pages: string;
  color: string;
  sections: string[];
  description: string;
}

const REPORT_TYPES: ReportType[] = [
  { id: 'executive', persona: 'Executive / Board', icon: Briefcase, format: 'PDF', pages: '3-5 pages', color: 'text-violet-600 bg-violet-50', sections: ['Feasibility Score Summary', 'ROI Projections', 'Risk Heat Map', 'Timeline Overview', 'Go/No-Go Recommendation'], description: 'Business-focused overview with data visualizations and strategic recommendations.' },
  { id: 'legal', persona: 'Legal / Compliance', icon: Scale, format: 'DOCX', pages: 'Editable', color: 'text-blue-600 bg-blue-50', sections: ['Vendor Contract Analysis', 'Data Processing Terms', 'Compliance Control Mapping', 'Regulatory Risk Assessment', 'AUP Review Status'], description: 'Detailed legal analysis with clause-by-clause review and regulatory references.' },
  { id: 'it_security', persona: 'IT / Security', icon: Shield, format: 'PDF + Configs', pages: '8-12 pages', color: 'text-emerald-600 bg-emerald-50', sections: ['Sandbox Architecture Diagram', 'Network Security Configuration', 'DLP Rules & Egress Filtering', 'SIEM Integration Plan', 'Managed Settings Detail'], description: 'Technical deep-dive with configuration details and security control specifications.' },
  { id: 'engineering', persona: 'Engineering / Dev', icon: Code, format: 'Markdown + PDF', pages: 'Setup Guide', color: 'text-amber-600 bg-amber-50', sections: ['Tool Comparison Results', 'Productivity Metrics', 'CI/CD Integration Guide', 'Prompt Playbook', 'CLAUDE.md Templates'], description: 'Developer-friendly guide with code examples, metrics, and practical setup instructions.' },
  { id: 'marketing', persona: 'Marketing / Comms', icon: Megaphone, format: 'DOCX', pages: 'Editable', color: 'text-rose-600 bg-rose-50', sections: ['AI Initiative Messaging Guide', 'Internal Communications Templates', 'Employee FAQ', 'Change Management Narrative', 'Success Metrics for Reporting'], description: 'Narrative-driven content for internal communications and change management.' },
];

type GenerateState = 'idle' | 'generating' | 'ready';

export default function ReportGeneratePage() {
  const [states, setStates] = useState<Record<string, GenerateState>>({});

  const handleGenerate = (id: string) => {
    setStates((prev) => ({ ...prev, [id]: 'generating' }));
    setTimeout(() => {
      setStates((prev) => ({ ...prev, [id]: 'ready' }));
    }, 3000);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileOutput className="h-6 w-6 text-primary" />
          Report Generator
        </h1>
        <p className="text-muted-foreground mt-1">Generate persona-specific reports from project data</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {REPORT_TYPES.map((report) => {
          const Icon = report.icon;
          const state = states[report.id] || 'idle';
          return (
            <Card key={report.id}>
              <CardHeader>
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-lg ${report.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-base flex items-center gap-2">
                      {report.persona}
                      <Badge variant="outline" className="text-xs">{report.format}</Badge>
                      <Badge variant="outline" className="text-xs">{report.pages}</Badge>
                    </CardTitle>
                    <CardDescription className="mt-1">{report.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-3">
                  <p className="text-xs font-medium text-muted-foreground mb-1.5">Included Sections:</p>
                  <div className="flex flex-wrap gap-1">
                    {report.sections.map((s) => (
                      <Badge key={s} variant="outline" className="text-[10px]">{s}</Badge>
                    ))}
                  </div>
                </div>
                {state === 'idle' && (
                  <Button className="w-full" onClick={() => handleGenerate(report.id)}>
                    <FileOutput className="h-4 w-4 mr-2" /> Generate Report
                  </Button>
                )}
                {state === 'generating' && (
                  <Button className="w-full" disabled>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating...
                  </Button>
                )}
                {state === 'ready' && (
                  <div className="flex gap-2">
                    <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                      <Download className="h-4 w-4 mr-2" /> Download
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <CheckCircle className="h-4 w-4 mr-2 text-emerald-600" /> Preview
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
