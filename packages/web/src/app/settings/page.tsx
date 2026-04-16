'use client';

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { ChevronDown, ChevronUp } from 'lucide-react';
import {
  getSettings,
  getConstitution,
  getTreasuryPolicy,
  getSkills,
  getTools,
  getModels,
  AgentSettings,
  Constitution,
  TreasuryPolicy,
  Skill,
  Tool,
  Model,
} from '@/lib/api';
import { formatCredits, formatAddress } from '@/lib/formatters';

// Helper to mask API keys
function maskApiKey(key: string): string {
  if (!key || key.length < 6) return key || '';
  return `${key.slice(0, 3)}...****`;
}

// Agent Configuration Card Component
function AgentConfigCard({
  data,
  loading,
  error,
}: {
  data: AgentSettings | null;
  loading: boolean;
  error: string | null;
}) {
  const [isOpen, setIsOpen] = useState(false);

  if (loading) {
    return (
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className="bg-card/80 backdrop-blur-sm border-destructive/50">
        <CardHeader>
          <CardTitle>Agent Configuration</CardTitle>
          <CardDescription>Could not load agent configuration</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {error || 'No data available'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Agent Configuration</CardTitle>
        <CardDescription>Core agent identity and settings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Name</p>
            <p className="font-medium">{data.name}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Version</p>
            <Badge variant="secondary">{data.version}</Badge>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Address</p>
            <p className="font-mono text-sm" title={data.address}>
              {formatAddress(data.address)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Creator</p>
            <p className="font-mono text-sm">{formatAddress(data.creator)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Sandbox ID</p>
            <p className="font-mono text-sm">{data.sandbox_id}</p>
          </div>
        </div>

        <Separator />

        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger className="flex items-center justify-between w-full text-sm font-medium hover:text-primary transition-colors">
            <span>Genesis Prompt</span>
            {isOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2">
            <pre className="bg-black/30 p-4 rounded-lg font-mono text-sm text-muted-foreground overflow-x-auto whitespace-pre-wrap">
              {data.genesis_prompt}
            </pre>
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        <div>
          <p className="text-sm text-muted-foreground mb-2">API Keys</p>
          {Object.entries(data.api_keys || {}).length === 0 ? (
            <p className="text-sm text-muted-foreground">No API keys configured</p>
          ) : (
            <div className="space-y-1">
              {Object.entries(data.api_keys).map(([name, key]) => (
                <div key={name} className="flex items-center gap-2">
                  <span className="text-sm">{name}:</span>
                  <code className="font-mono text-sm text-muted-foreground">
                    {maskApiKey(key)}
                  </code>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Constitution Card Component
function ConstitutionCard({
  data,
  loading,
  error,
}: {
  data: Constitution | null;
  loading: boolean;
  error: string | null;
}) {
  if (loading) {
    return (
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-56" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className="bg-card/80 backdrop-blur-sm border-destructive/50">
        <CardHeader>
          <CardTitle>Constitution</CardTitle>
          <CardDescription>Could not load constitution</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {error || 'No data available'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Constitution</CardTitle>
        <CardDescription>Agent governing principles and laws</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="prose prose-invert prose-sm max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {data.content}
          </ReactMarkdown>
        </div>

        {data.laws && data.laws.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium">The Three Laws</h4>
            {data.laws.map((law, index) => (
              <div
                key={index}
                className="bg-indigo-500/10 border-l-4 border-indigo-500 p-4 rounded"
              >
                <p className="text-sm">
                  <span className="font-semibold text-indigo-400">
                    Law {index + 1}:
                  </span>{' '}
                  {law}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Treasury Policy Card Component
function TreasuryPolicyCard({
  data,
  loading,
  error,
}: {
  data: TreasuryPolicy | null;
  loading: boolean;
  error: string | null;
}) {
  if (loading) {
    return (
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-40 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className="bg-card/80 backdrop-blur-sm border-destructive/50">
        <CardHeader>
          <CardTitle>Treasury Policy</CardTitle>
          <CardDescription>Could not load treasury policy</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {error || 'No data available'}
          </p>
        </CardContent>
      </Card>
    );
  }

  const policies = [
    { name: 'Max Per Transfer', value: data.max_per_transfer },
    { name: 'Max Hourly', value: data.max_hourly },
    { name: 'Max Daily', value: data.max_daily },
    { name: 'Confirmation Threshold', value: data.confirmation_threshold },
    { name: 'Minimum Reserve', value: data.minimum_reserve },
  ];

  return (
    <Card className="bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Treasury Policy</CardTitle>
        <CardDescription>Spending limits and safeguards</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Setting</TableHead>
              <TableHead className="text-right">Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {policies.map((policy) => (
              <TableRow key={policy.name}>
                <TableCell className="text-muted-foreground">
                  {policy.name}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {formatCredits(policy.value)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// Skills Card Component
function SkillsCard({
  data,
  loading,
  error,
}: {
  data: Skill[];
  loading: boolean;
  error: string | null;
}) {
  if (loading) {
    return (
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-40 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-card/80 backdrop-blur-sm border-destructive/50">
        <CardHeader>
          <CardTitle>Installed Skills</CardTitle>
          <CardDescription>Could not load skills</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Installed Skills</CardTitle>
        <CardDescription>Active agent capabilities</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No skills installed
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((skill) => (
                <TableRow key={skill.name}>
                  <TableCell className="font-medium">{skill.name}</TableCell>
                  <TableCell className="text-muted-foreground max-w-xs truncate">
                    {skill.description}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {skill.source}
                  </TableCell>
                  <TableCell>
                    {skill.active ? (
                      <Badge
                        variant="default"
                        className="bg-green-500/20 text-green-400 hover:bg-green-500/30"
                      >
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

// Tools Card Component
function ToolsCard({
  data,
  loading,
  error,
}: {
  data: Tool[];
  loading: boolean;
  error: string | null;
}) {
  if (loading) {
    return (
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-40 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-card/80 backdrop-blur-sm border-destructive/50">
        <CardHeader>
          <CardTitle>Installed Tools</CardTitle>
          <CardDescription>Could not load tools</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Installed Tools</CardTitle>
        <CardDescription>External tool integrations</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No tools installed
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Package</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((tool) => (
                <TableRow key={tool.name}>
                  <TableCell className="font-medium">{tool.name}</TableCell>
                  <TableCell>
                    {tool.type === 'npm' ? (
                      <Badge
                        variant="default"
                        className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                      >
                        npm
                      </Badge>
                    ) : (
                      <Badge
                        variant="default"
                        className="bg-purple-500/20 text-purple-400 hover:bg-purple-500/30"
                      >
                        mcp
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {tool.package_name}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

// Models Card Component
function ModelsCard({
  data,
  loading,
  error,
}: {
  data: Model[];
  loading: boolean;
  error: string | null;
}) {
  if (loading) {
    return (
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-40 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-card/80 backdrop-blur-sm border-destructive/50">
        <CardHeader>
          <CardTitle>Available Models</CardTitle>
          <CardDescription>Could not load models</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Available Models</CardTitle>
        <CardDescription>LLM providers and pricing</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No models configured
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Model</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead className="text-right">Input $/1M</TableHead>
                <TableHead className="text-right">Output $/1M</TableHead>
                <TableHead className="text-right">Max Tokens</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((model) => (
                <TableRow key={model.name}>
                  <TableCell className="font-medium">{model.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {model.provider}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    ${model.input_price.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    ${model.output_price.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {model.max_tokens.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

// Main Settings Page
export default function SettingsPage() {
  const [settings, setSettings] = useState<AgentSettings | null>(null);
  const [constitution, setConstitution] = useState<Constitution | null>(null);
  const [treasuryPolicy, setTreasuryPolicy] = useState<TreasuryPolicy | null>(
    null
  );
  const [skills, setSkills] = useState<Skill[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [models, setModels] = useState<Model[]>([]);

  const [loading, setLoading] = useState({
    settings: true,
    constitution: true,
    treasury: true,
    skills: true,
    tools: true,
    models: true,
  });

  const [errors, setErrors] = useState<Record<string, string | null>>({
    settings: null,
    constitution: null,
    treasury: null,
    skills: null,
    tools: null,
    models: null,
  });

  useEffect(() => {
    // Fetch all settings data in parallel
    const fetchData = async () => {
      // Agent Settings
      try {
        const settingsData = await getSettings();
        setSettings(settingsData);
      } catch (err) {
        setErrors((prev) => ({
          ...prev,
          settings: err instanceof Error ? err.message : 'Failed to load',
        }));
      } finally {
        setLoading((prev) => ({ ...prev, settings: false }));
      }

      // Constitution
      try {
        const constitutionData = await getConstitution();
        setConstitution(constitutionData);
      } catch (err) {
        setErrors((prev) => ({
          ...prev,
          constitution: err instanceof Error ? err.message : 'Failed to load',
        }));
      } finally {
        setLoading((prev) => ({ ...prev, constitution: false }));
      }

      // Treasury Policy
      try {
        const treasuryData = await getTreasuryPolicy();
        setTreasuryPolicy(treasuryData);
      } catch (err) {
        setErrors((prev) => ({
          ...prev,
          treasury: err instanceof Error ? err.message : 'Failed to load',
        }));
      } finally {
        setLoading((prev) => ({ ...prev, treasury: false }));
      }

      // Skills
      try {
        const skillsData = await getSkills();
        setSkills(skillsData || []);
      } catch (err) {
        setErrors((prev) => ({
          ...prev,
          skills: err instanceof Error ? err.message : 'Failed to load',
        }));
        setSkills([]);
      } finally {
        setLoading((prev) => ({ ...prev, skills: false }));
      }

      // Tools
      try {
        const toolsData = await getTools();
        setTools(toolsData || []);
      } catch (err) {
        setErrors((prev) => ({
          ...prev,
          tools: err instanceof Error ? err.message : 'Failed to load',
        }));
        setTools([]);
      } finally {
        setLoading((prev) => ({ ...prev, tools: false }));
      }

      // Models
      try {
        const modelsData = await getModels();
        setModels(modelsData || []);
      } catch (err) {
        setErrors((prev) => ({
          ...prev,
          models: err instanceof Error ? err.message : 'Failed to load',
        }));
        setModels([]);
      } finally {
        setLoading((prev) => ({ ...prev, models: false }));
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Agent configuration and system settings
          </p>
        </div>
        <Badge variant="secondary" className="text-muted-foreground">
          Read-only
        </Badge>
      </div>

      {/* Agent Configuration - Full Width */}
      <AgentConfigCard
        data={settings}
        loading={loading.settings}
        error={errors.settings}
      />

      {/* Constitution - Full Width */}
      <ConstitutionCard
        data={constitution}
        loading={loading.constitution}
        error={errors.constitution}
      />

      {/* Two Column Layout: Treasury + Skills */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TreasuryPolicyCard
          data={treasuryPolicy}
          loading={loading.treasury}
          error={errors.treasury}
        />
        <SkillsCard
          data={skills}
          loading={loading.skills}
          error={errors.skills}
        />
      </div>

      {/* Two Column Layout: Tools + Models */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ToolsCard data={tools} loading={loading.tools} error={errors.tools} />
        <ModelsCard
          data={models}
          loading={loading.models}
          error={errors.models}
        />
      </div>
    </div>
  );
}
