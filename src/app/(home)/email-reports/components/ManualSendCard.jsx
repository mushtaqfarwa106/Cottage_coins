import { Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

export function ManualSendCard({ period, onPeriodChange, onSendNow, isSending }) {
  return (
    <Card className="bg-linear-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 border-amber-200/80 dark:border-amber-900/50">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <div className="rounded-lg bg-amber-100 dark:bg-amber-900/50 p-1.5">
            <Send className="size-4 text-amber-600 dark:text-amber-400" />
          </div>
          Manual Send
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium">Period</p>
          <Tabs value={period} onValueChange={onPeriodChange}>
            <TabsList className="w-full sm:w-auto">
              <TabsTrigger value="monthly" className="flex-1 sm:flex-none">
                Monthly
              </TabsTrigger>
              <TabsTrigger value="yearly" className="flex-1 sm:flex-none">
                Yearly
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <Button type="button" onClick={onSendNow} disabled={isSending}>
          {isSending ? "Sending..." : "Send Report Now"}
        </Button>
      </CardContent>
    </Card>
  );
}
