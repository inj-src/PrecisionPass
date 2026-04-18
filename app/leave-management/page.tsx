"use client";

import * as React from "react";
import { AlertCircle, Plus, Trash2 } from "lucide-react";

import { PageHeader } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  createLeave,
  deleteLeave,
  getEmployees,
  getLeaves,
  type EmployeeRecord,
  type LeaveRecord,
} from "@/lib/cv-api";

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function LeaveManagementPage() {
  const [employees, setEmployees] = React.useState<EmployeeRecord[]>([]);
  const [leaves, setLeaves] = React.useState<LeaveRecord[]>([]);
  const [employeeId, setEmployeeId] = React.useState("");
  const [startDate, setStartDate] = React.useState(today());
  const [endDate, setEndDate] = React.useState(today());
  const [reason, setReason] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [employeeRows, leaveRows] = await Promise.all([getEmployees(), getLeaves()]);
      setEmployees(employeeRows);
      setLeaves(leaveRows);
      setEmployeeId(String(employeeRows[0]?.id ?? ""));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load leave data.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadData();
  }, [loadData]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!employeeId) {
      setError("Please select an employee.");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      const newLeave = await createLeave({
        employeeId: Number(employeeId),
        startDate,
        endDate,
        reason: reason.trim(),
      });
      setLeaves((currentLeaves) => [newLeave, ...currentLeaves]);
      setReason("");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to save leave.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(leave: LeaveRecord) {
    const confirmed = window.confirm(`Delete leave for ${leave.employeeName}?`);
    if (!confirmed) {
      return;
    }

    try {
      setError(null);
      await deleteLeave(leave.id);
      setLeaves((currentLeaves) => currentLeaves.filter((currentLeave) => currentLeave.id !== leave.id));
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Failed to delete leave.");
    }
  }

  return (
    <>
      <PageHeader
        title="Leave Management"
        description="Add approved employee leave for payroll calculation"
      />

      <main className="flex-1 space-y-4 overflow-auto p-4 md:space-y-6 md:p-6">
        {error && (
          <Card className="border-destructive/30 bg-destructive/5 py-4">
            <CardContent className="flex items-center gap-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              {error}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Add Approved Leave</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <Field>
                <FieldLabel>Employee</FieldLabel>
                <select
                  value={employeeId}
                  onChange={(event) => setEmployeeId(event.target.value)}
                  className="h-9 rounded-md border bg-background px-3 text-sm"
                  required
                >
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.fullName}
                    </option>
                  ))}
                </select>
              </Field>

              <Field>
                <FieldLabel>Start Date</FieldLabel>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                  required
                />
              </Field>

              <Field>
                <FieldLabel>End Date</FieldLabel>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                  required
                />
              </Field>

              <Field>
                <FieldLabel>Reason</FieldLabel>
                <Input
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  placeholder="Sick leave"
                  required
                />
              </Field>

              <div className="flex items-end">
                <Button type="submit" disabled={saving || loading} className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  {saving ? "Saving" : "Add Leave"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Approved Leaves</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase text-muted-foreground">
                  <th className="py-3">Employee</th>
                  <th className="py-3">Dates</th>
                  <th className="py-3">Reason</th>
                  <th className="py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {leaves.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-muted-foreground">
                      No leave records found.
                    </td>
                  </tr>
                )}
                {leaves.map((leave) => (
                  <tr key={leave.id} className="border-b last:border-b-0">
                    <td className="py-3 font-medium">{leave.employeeName}</td>
                    <td className="py-3">
                      {leave.startDate} to {leave.endDate}
                    </td>
                    <td className="py-3 text-muted-foreground">{leave.reason}</td>
                    <td className="py-3 text-right">
                      <Button variant="destructive" size="icon" onClick={() => void handleDelete(leave)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
