'use client';

import { useState } from 'react';
import { useApi } from '@/hooks/useApi';
import { getSoulCurrent, getSoulHistory, SoulVersion } from '@/lib/api';
import { formatTimeAgo } from '@/lib/formatters';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlignmentGauge } from '@/components/soul/AlignmentGauge';
import { SoulDiff } from '@/components/soul/SoulDiff';
import { SoulSectionCard } from '@/components/soul/SoulSectionCard';
import { GitCompare, History, FileText, Clock } from 'lucide-react';

interface ParsedSoul {
  frontmatter: Record<string, string>;
  sections: Array<{ title: string; content: string }>;
}

function parseSoulContent(content: string): ParsedSoul {
  const frontmatter: Record<string, string> = {};
  let body = content;

  // Parse YAML frontmatter
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (frontmatterMatch) {
    const yamlContent = frontmatterMatch[1];
    body = frontmatterMatch[2];

    yamlContent.split('\n').forEach((line) => {
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        const key = line.slice(0, colonIndex).trim();
        const value = line.slice(colonIndex + 1).trim();
        frontmatter[key] = value;
      }
    });
  }

  // Parse sections by ## headings
  const sections: Array<{ title: string; content: string }> = [];
  const sectionRegex = /##\s+(.+?)\n([\s\S]*?)(?=##\s|$)/g;
  let match;

  while ((match = sectionRegex.exec(body)) !== null) {
    sections.push({
      title: match[1].trim(),
      content: match[2].trim(),
    });
  }

  return { frontmatter, sections };
}

export default function SoulPage() {
  const [activeTab, setActiveTab] = useState('current');
  const [compareVersions, setCompareVersions] = useState<{ from: SoulVersion; to: SoulVersion } | null>(null);
  const [viewVersion, setViewVersion] = useState<SoulVersion | null>(null);

  const { data: currentSoul, loading: currentLoading, error: currentError } = useApi(getSoulCurrent);
  const { data: history, loading: historyLoading, error: historyError } = useApi(getSoulHistory);

  const parsedSoul = currentSoul ? parseSoulContent(currentSoul.content) : null;

  if (currentError || historyError) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          Error loading soul data: {currentError || historyError}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Soul</h1>
          <p className="text-muted-foreground mt-1">
            Agent identity, purpose, and evolution
          </p>
        </div>
        <div className="flex items-center gap-4">
          {currentSoul && (
            <div className="flex items-center gap-3">
              <div className="text-right">
                <Badge variant="secondary" className="font-mono">
                  v{currentSoul.version}
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">
                  <Clock className="inline w-3 h-3 mr-1" />
                  {formatTimeAgo(currentSoul.last_modified)}
                </p>
              </div>
              <AlignmentGauge value={currentSoul.genesis_alignment} />
            </div>
          )}
          {currentLoading && (
            <div className="flex items-center gap-3">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-20 w-20 rounded-full" />
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="current">
            <FileText className="w-4 h-4 mr-2" />
            Current
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="w-4 h-4 mr-2" />
            History
          </TabsTrigger>
        </TabsList>

        {/* Current Tab */}
        <TabsContent value="current" className="space-y-6">
          {currentLoading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-48" />
              ))}
            </div>
          ) : parsedSoul ? (
            <div className="grid gap-4 md:grid-cols-2">
              {parsedSoul.sections.map((section) => (
                <SoulSectionCard
                  key={section.title}
                  title={section.title}
                  content={section.content}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No soul content available
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          {historyLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-20" />
              ))}
            </div>
          ) : history && history.length > 0 ? (
            <div className="space-y-3">
              {history.map((version) => (
                <Card key={version.version} className="bg-card/80 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Badge variant="outline" className="font-mono">
                          v{version.version}
                        </Badge>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {version.trigger}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatTimeAgo(version.timestamp)} · {version.changes_summary}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* View Button */}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setViewVersion(version)}
                            >
                              <FileText className="w-4 h-4 mr-1" />
                              View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl max-h-[80vh]">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                <Badge variant="outline">v{version.version}</Badge>
                                <span className="text-muted-foreground text-sm font-normal">
                                  {formatTimeAgo(version.timestamp)}
                                </span>
                              </DialogTitle>
                            </DialogHeader>
                            <ScrollArea className="h-[60vh]">
                              <div className="space-y-4 p-2">
                                {parseSoulContent(version.content).sections.map((section) => (
                                  <SoulSectionCard
                                    key={section.title}
                                    title={section.title}
                                    content={section.content}
                                  />
                                ))}
                              </div>
                            </ScrollArea>
                          </DialogContent>
                        </Dialog>

                        {/* Compare Button */}
                        {currentSoul && version.version !== currentSoul.version && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  setCompareVersions({
                                    from: version,
                                    to: {
                                      version: currentSoul.version,
                                      timestamp: currentSoul.last_modified,
                                      trigger: 'Current',
                                      changes_summary: '',
                                      content: currentSoul.content,
                                    },
                                  })
                                }
                              >
                                <GitCompare className="w-4 h-4 mr-1" />
                                Compare
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[80vh]">
                              <DialogHeader>
                                <DialogTitle>Version Comparison</DialogTitle>
                              </DialogHeader>
                              <SoulDiff
                                fromContent={version.content}
                                toContent={currentSoul?.content || ''}
                                fromVersion={version.version}
                                toVersion={currentSoul?.version || 0}
                              />
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No version history available
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
