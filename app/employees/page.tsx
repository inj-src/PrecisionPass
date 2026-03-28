"use client";

import * as React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

import { EmployeeDirectoryHeader } from "@/components/employees/employee-directory-header";
import { EmployeeTable, Employee } from "@/components/employees/employee-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { deleteEmployee, getEmployees, updateEmployee } from "@/lib/cv-api";

export default function EmployeesPage() {
  const [employees, setEmployees] = React.useState<Employee[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [savingEmployeeId, setSavingEmployeeId] = React.useState<number | null>(null);
  const [deletingEmployeeId, setDeletingEmployeeId] = React.useState<number | null>(null);

  const loadEmployees = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setEmployees(await getEmployees());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load employees.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadEmployees();
  }, [loadEmployees]);

  async function handleSaveSchedule(id: number, schedule: Employee["schedule"]) {
    try {
      setSavingEmployeeId(id);
      const updatedEmployee = await updateEmployee(id, { schedule });
      setEmployees((currentEmployees) =>
        currentEmployees.map((employee) => (employee.id === id ? updatedEmployee : employee))
      );
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to save employee.");
    } finally {
      setSavingEmployeeId(null);
    }
  }

  async function handleDeleteEmployee(employee: Employee) {
    const confirmed = window.confirm(
      `Delete ${employee.fullName}? This also removes saved face samples and attendance records.`,
    );
    if (!confirmed) {
      return;
    }

    try {
      setDeletingEmployeeId(employee.id);
      setError(null);
      await deleteEmployee(employee.id);
      setEmployees((currentEmployees) =>
        currentEmployees.filter((currentEmployee) => currentEmployee.id !== employee.id),
      );
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Failed to delete employee.");
    } finally {
      setDeletingEmployeeId(null);
    }
  }

  return (
    <>
      <EmployeeDirectoryHeader />

      <main className="flex-1 space-y-4 overflow-auto p-4 md:space-y-6 md:p-6">
        <div className="flex items-center justify-end">
          <Button variant="outline" onClick={() => void loadEmployees()} disabled={loading}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>

        {error && (
          <Card className="border-destructive/30 bg-destructive/5 py-4">
            <CardContent className="flex items-center gap-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              {error}
            </CardContent>
          </Card>
        )}

        {loading ? (
          <Card className="py-10">
            <CardContent className="text-center text-sm text-muted-foreground">
              Loading employees...
            </CardContent>
          </Card>
        ) : (
          <EmployeeTable
            employees={employees}
            isSavingEmployeeId={savingEmployeeId}
            isDeletingEmployeeId={deletingEmployeeId}
            onSaveSchedule={handleSaveSchedule}
            onDeleteEmployee={handleDeleteEmployee}
          />
        )}
      </main>
    </>
  );
}
