'use client';

import { useState } from 'react';
import { Turn } from '@/lib/api';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ActivityFeed } from '@/components/activity/ActivityFeed';
import { TurnDetail } from '@/components/activity/TurnDetail';
import { Search, Wrench, User } from 'lucide-react';

// Tool names for filter - these are common tools, will be augmented from actual data
const COMMON_TOOLS = [
  'execute_code',
  'shell',
  'write_file',
  'edit_file',
  'delete',
  'http_request',
  'browser',
  'read_file',
  'search',
];

const SOURCE_OPTIONS = [
  { value: 'all', label: 'All Sources' },
  { value: 'self', label: 'Self' },
  { value: 'creator', label: 'Creator' },
  { value: 'peer', label: 'Peer' },
];

export default function ActivityPage() {
  const [search, setSearch] = useState('');
  const [toolFilter, setToolFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [selectedTurn, setSelectedTurn] = useState<Turn | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const handleTurnSelect = (turn: Turn) => {
    setSelectedTurn(turn);
    setDetailOpen(true);
  };

  // Debounce search input
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const handleSearchChange = (value: string) => {
    setSearch(value);
    // Simple debounce
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(value);
    }, 300);
    return () => clearTimeout(timeoutId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Activity</h1>
        <p className="text-muted-foreground mt-1">
          View turn history, tool calls, and agent activity in real-time
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search thinking text..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9 bg-card border-border"
          />
        </div>

        {/* Tool Filter */}
        <div className="flex items-center gap-2">
          <Wrench className="w-4 h-4 text-muted-foreground" />
          <Select value={toolFilter} onValueChange={setToolFilter}>
            <SelectTrigger className="w-[160px] bg-card border-border">
              <SelectValue placeholder="Filter by tool" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="all">All Tools</SelectItem>
              {COMMON_TOOLS.map((tool) => (
                <SelectItem key={tool} value={tool}>
                  {tool}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Source Filter */}
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-muted-foreground" />
          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="w-[160px] bg-card border-border">
              <SelectValue placeholder="Filter by source" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              {SOURCE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Activity Feed */}
      <ActivityFeed
        search={debouncedSearch}
        toolFilter={toolFilter}
        sourceFilter={sourceFilter}
        onTurnSelect={handleTurnSelect}
      />

      {/* Turn Detail Dialog */}
      <TurnDetail
        turn={selectedTurn}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  );
}
