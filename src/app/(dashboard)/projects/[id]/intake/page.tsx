'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { INTAKE_QUESTIONS, scoreIntake } from '@/lib/intake/scorecard';
import type { PilotIntakeResponse, PilotIntakeResult } from '@/types';
import { CheckCircle, ArrowRight, ArrowLeft, Zap, Shield, AlertTriangle, ClipboardCheck } from 'lucide-react';

export default function PilotIntakePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = React.use(params);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<PilotIntakeResponse[]>([]);
  const [result, setResult] = useState<PilotIntakeResult | null>(null);

  const currentQuestion = INTAKE_QUESTIONS[currentIndex];
  const progress = Math.round(((currentIndex) / INTAKE_QUESTIONS.length) * 100);
  const selectedResponse = responses.find((r) => r.question_id === currentQuestion?.id);

  function handleSelect(value: string, score: number) {
    setResponses((prev) => {
      const filtered = prev.filter((r) => r.question_id !== currentQuestion.id);
      return [...filtered, { question_id: currentQuestion.id, selected_value: value, score }];
    });
  }

  function handleNext() {
    if (currentIndex < INTAKE_QUESTIONS.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      const scored = scoreIntake(responses);
      scored.project_id = projectId;
      setResult(scored);
    }
  }

  function handleBack() {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  }

  function handleReset() {
    setCurrentIndex(0);
    setResponses([]);
    setResult(null);
  }

  const pathConfig = {
    fast_track: { label: 'Fast Track', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: Zap, bg: 'bg-emerald-50', border: 'border-emerald-200' },
    standard: { label: 'Standard', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Shield, bg: 'bg-blue-50', border: 'border-blue-200' },
    high_risk: { label: 'High Risk', color: 'bg-red-100 text-red-800 border-red-200', icon: AlertTriangle, bg: 'bg-red-50', border: 'border-red-200' },
  };

  if (result) {
    const config = pathConfig[result.risk_path];
    const PathIcon = config.icon;
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Intake Assessment Complete</h1>
            <p className="text-slate-500 mt-1">Your pilot has been classified based on risk and readiness.</p>
          </div>
          <Button variant="outline" onClick={handleReset}>Retake Assessment</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className={`${config.bg} ${config.border} border-2`}>
            <CardContent className="pt-6 text-center">
              <PathIcon className="h-12 w-12 mx-auto mb-3 text-slate-700" />
              <Badge className={config.color}>{config.label}</Badge>
              <p className="text-3xl font-bold mt-3 text-slate-900">{result.total_score}/100</p>
              <p className="text-sm text-slate-500 mt-1">Intake Score</p>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-slate-900">Recommended Governance Path</CardTitle>
              <CardDescription className="text-slate-500">Based on your responses, here is the recommended approach for this pilot.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {result.recommended_actions.map((action, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-700">{action}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-slate-900">Response Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {result.responses.map((resp) => {
                const q = INTAKE_QUESTIONS.find((qq) => qq.id === resp.question_id);
                const opt = q?.options.find((o) => o.value === resp.selected_value);
                return (
                  <div key={resp.question_id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                    <span className="text-sm text-slate-700">{q?.question}</span>
                    <Badge variant="outline" className="text-slate-600 border-slate-300">{opt?.label}</Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-blue-900">Next Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-blue-800 mb-4">
              Your pilot has been classified. Continue to the readiness assessment to score your organization across 5 domains.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href={`/projects/${projectId}/discovery/questionnaire`}>
                <Button className="bg-slate-900 text-white hover:bg-slate-800 gap-2">
                  Start Readiness Assessment <ArrowRight className="h-4 w-4" />
                </Button>
              </a>
              <a href={`/projects/${projectId}/my-tasks`}>
                <Button variant="outline" className="gap-2">
                  View My Tasks <ArrowRight className="h-4 w-4" />
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Pilot Intake Scorecard</h1>
        <p className="text-slate-500 mt-1">Answer 10 questions to determine the appropriate governance path for your AI pilot.</p>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm text-slate-500">
          <span>Question {currentIndex + 1} of {INTAKE_QUESTIONS.length}</span>
          <span>{progress}% complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-slate-400" />
            <CardTitle className="text-lg text-slate-900">{currentQuestion.question}</CardTitle>
          </div>
          <CardDescription className="text-slate-500">Weight: {currentQuestion.weight}x</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {currentQuestion.options.map((option) => {
              const isSelected = selectedResponse?.selected_value === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => handleSelect(option.value, option.score)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    isSelected
                      ? 'border-slate-900 bg-slate-50'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <span className={isSelected ? 'font-medium text-slate-900' : 'text-slate-700'}>{option.label}</span>
                </button>
              );
            })}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handleBack} disabled={currentIndex === 0}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <Button onClick={handleNext} disabled={!selectedResponse} className="bg-slate-900 text-white hover:bg-slate-800">
            {currentIndex === INTAKE_QUESTIONS.length - 1 ? 'Complete' : 'Next'} <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
