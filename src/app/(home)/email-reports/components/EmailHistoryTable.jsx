import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function EmailHistoryTable({ history, onResend, resendId }) {
  const rows = history ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Send History</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        {!rows.length ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No emails have been sent yet.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date Sent</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{formatDate(row.date)}</TableCell>
                  <TableCell className="capitalize">{row.period}</TableCell>
                  <TableCell>
                    <Badge
                      className={row.status === "sent" ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"}
                    >
                      {row.status === "sent" ? "Sent" : "Failed"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => onResend(row)}
                      disabled={resendId === row.id}
                    >
                      {resendId === row.id ? "Resending..." : "Resend"}
                    </Button>
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
