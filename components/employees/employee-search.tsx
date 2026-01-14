"use client";

import * as React from "react";
import { Search, SlidersHorizontal, Download, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

interface EmployeeSearchProps {
  onSearch: (query: string) => void;
  onFilter: () => void;
  onExport: () => void;
  onAddEmployee: () => void;
}

export function EmployeeSearch({
  onSearch,
  onAddEmployee,
}: EmployeeSearchProps) {
  const [searchQuery, setSearchQuery] = React.useState("");

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSearchQuery(e.target.value);
    onSearch(e.target.value);
  }

  return (
    <Card>
      <CardContent className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, ID, or department..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-9"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button onClick={onAddEmployee}>
            <UserPlus className="h-4 w-4" data-icon="inline-start" />
            Add New Employee
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
