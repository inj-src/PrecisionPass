"use client";

import * as React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

import { PageHeader } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { getMonthlyPayroll, type PayrollResponse } from "@/lib/cv-api";

function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

function money(value: number) {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function PayrollPage() {
  const [month, setMonth] = React.useState(currentMonth());
  const [payroll, setPayroll] = React.useState<PayrollResponse | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const loadPayroll = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setPayroll(await getMonthlyPayroll(month));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load payroll.");
    } finally {
      setLoading(false);
    }
  }, [month]);

  React.useEffect(() => {
    void loadPayroll();
  }, [loadPayroll]);

  return (
    <>
      <PageHeader
        title="Payroll"
        description="Monthly salary calculation based on attendance and approved leave"
      />

      <main className="flex-1 space-y-4 overflow-auto p-4 md:space-y-6 md:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <Field className="max-w-xs">
            <FieldLabel>Payroll Month</FieldLabel>
            <Input type="month" value={month} onChange={(event) => setMonth(event.target.value)} />
          </Field>
          <Button variant="outline" onClick={() => void loadPayroll()} disabled={loading}>
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

        {payroll && (
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground">Gross Salary</p>
                <p className="mt-2 text-2xl font-semibold">{money(payroll.totalGross)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground">Total Deduction</p>
                <p className="mt-2 text-2xl font-semibold">{money(payroll.totalDeduction)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground">Net Pay</p>
                <p className="mt-2 text-2xl font-semibold">{money(payroll.totalNetPay)}</p>
              </CardContent>
            </Card>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Employee Payroll</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {loading ? (
              <div className="py-10 text-center text-sm text-muted-foreground">
                Loading payroll...
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs uppercase text-muted-foreground">
                    <th className="py-3">Employee</th>
                    <th className="py-3">Monthly Wage</th>
                    <th className="py-3">Present</th>
                    <th className="py-3">Paid Leave</th>
                    <th className="py-3">Absent</th>
                    <th className="py-3">Deduction</th>
                    <th className="py-3 text-right">Net Pay</th>
                  </tr>
                </thead>
                <tbody>
                  {payroll?.employees.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-muted-foreground">
                        No employees found.
                      </td>
                    </tr>
                  )}
                  {payroll?.employees.map((employee) => (
                    <tr key={employee.employeeId} className="border-b last:border-b-0">
                      <td className="py-3">
                        <p className="font-medium">{employee.fullName}</p>
                        <p className="text-xs text-muted-foreground">{employee.department}</p>
                      </td>
                      <td className="py-3">{money(employee.monthlyWage)}</td>
                      <td className="py-3">{employee.presentDays}</td>
                      <td className="py-3">{employee.paidLeaveDays}</td>
                      <td className="py-3">{employee.absentDays}</td>
                      <td className="py-3">{money(employee.deduction)}</td>
                      <td className="py-3 text-right font-semibold">{money(employee.netPay)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
}
