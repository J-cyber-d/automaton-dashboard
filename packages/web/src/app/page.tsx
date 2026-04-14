import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 min-h-screen bg-background p-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">Automaton Dashboard</h1>
        <p className="text-muted-foreground">System monitoring and control center</p>
      </header>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="processes">Processes</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Active Processes</CardDescription>
                <CardTitle className="text-3xl text-tier-high">24</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tier-high opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-tier-high"></span>
                  </span>
                  <span className="text-sm text-muted-foreground">All systems operational</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Queue Length</CardDescription>
                <CardTitle className="text-3xl text-tier-normal">142</CardTitle>
              </CardHeader>
              <CardContent>
                <span className="text-sm text-muted-foreground">Normal load</span>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Warnings</CardDescription>
                <CardTitle className="text-3xl text-tier-low">3</CardTitle>
              </CardHeader>
              <CardContent>
                <span className="text-sm text-muted-foreground">Requires attention</span>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Errors</CardDescription>
                <CardTitle className="text-3xl text-tier-critical">0</CardTitle>
              </CardHeader>
              <CardContent>
                <span className="text-sm text-muted-foreground">No critical issues</span>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Component Showcase</CardTitle>
              <CardDescription>Testing shadcn/ui components with dark theme</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="destructive">Destructive</Badge>
                <Badge variant="outline">Outline</Badge>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button>Primary Button</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-tier-high/20 text-tier-high text-sm">
                  <span className="w-2 h-2 rounded-full bg-tier-high animate-pulse-live"></span>
                  High Tier
                </span>
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-tier-normal/20 text-tier-normal text-sm">
                  <span className="w-2 h-2 rounded-full bg-tier-normal"></span>
                  Normal Tier
                </span>
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-tier-low/20 text-tier-low text-sm">
                  <span className="w-2 h-2 rounded-full bg-tier-low"></span>
                  Low Tier
                </span>
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-tier-critical/20 text-tier-critical text-sm">
                  <span className="w-2 h-2 rounded-full bg-tier-critical"></span>
                  Critical
                </span>
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-tier-dead/20 text-tier-dead text-sm">
                  <span className="w-2 h-2 rounded-full bg-tier-dead"></span>
                  Dead
                </span>
              </div>

              <div className="p-4 rounded-lg bg-card border border-border">
                <p className="font-mono text-sm text-muted-foreground">Font Test (JetBrains Mono):</p>
                <code className="font-mono text-foreground">const automaton = new Automaton();</code>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="processes">
          <Card>
            <CardHeader>
              <CardTitle>Active Processes</CardTitle>
              <CardDescription>Currently running automaton processes</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Process list will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>System Logs</CardTitle>
              <CardDescription>Recent system events and messages</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Log entries will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
