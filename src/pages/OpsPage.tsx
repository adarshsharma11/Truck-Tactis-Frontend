import { useDateStore } from '@/lib/store/dateStore';
import { useJobs, useTrucks, useMark3Complete, useSendNext3 } from '@/lib/api/hooks';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle2, Send, AlertCircle } from 'lucide-react';
import { env } from '@/config/env';

export default function OpsPage() {
  const { selectedDate } = useDateStore();
  const { data: jobs } = useJobs(selectedDate);
  const { data: trucks } = useTrucks();
  const mark3Complete = useMark3Complete();
  const sendNext3 = useSendNext3();

  // Group jobs by truck and into groups of 3
  const truckStops = trucks?.map(truck => {
    const truckJobs = jobs
      ?.filter(j => j.truck_id === truck.id)
      .sort((a, b) => (a.sequence || 0) - (b.sequence || 0)) || [];
    
    const groups: { group_number: number; stops: typeof truckJobs; is_completed: boolean }[] = [];
    for (let i = 0; i < truckJobs.length; i += 3) {
      const groupStops = truckJobs.slice(i, i + 3);
      groups.push({
        group_number: Math.floor(i / 3) + 1,
        stops: groupStops,
        is_completed: groupStops.every(s => s.status === 'completed'),
      });
    }
    
    return { truck, groups };
  }) || [];

  const handleMark3Complete = (truckId: string) => {
    mark3Complete.mutate(truckId);
  };

  const handleSendNext3 = (truckId: string) => {
    sendNext3.mutate({ truck_id: truckId, webhook: env.webhookNext3Url });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Midday Operations</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor and control 3-stop cadence per truck
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {truckStops.map(({ truck, groups }) => {
          const currentGroup = groups.find(g => !g.is_completed);
          const hasGroups = groups.length > 0;
          
          return (
            <Card key={truck.id} className="p-6 space-y-4">
              {/* Truck Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{truck.name}</h3>
                  <p className={`text-sm font-medium mt-1 ${
                    truck.status === 'on_route' 
                      ? 'text-primary'
                      : truck.status === 'idle'
                      ? 'text-warning'
                      : 'text-muted-foreground'
                  }`}>
                    {truck.status.replace('_', ' ').toUpperCase()}
                  </p>
                </div>
                {truck.curfew_flags && truck.curfew_flags.length > 0 && (
                  <div className="flex items-center gap-1 text-warning">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-xs">Curfew</span>
                  </div>
                )}
              </div>

              {/* Stop Groups */}
              {!hasGroups ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No stops assigned
                </div>
              ) : (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-muted-foreground">Today's Stops</h4>
                  {groups.map((group) => (
                    <div
                      key={group.group_number}
                      className={`p-3 rounded-md border ${
                        group.is_completed
                          ? 'bg-success/10 border-success/30'
                          : group === currentGroup
                          ? 'bg-primary/10 border-primary'
                          : 'bg-muted/30 border-border'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold">
                          Group {group.group_number}
                        </span>
                        {group.is_completed && (
                          <CheckCircle2 className="w-4 h-4 text-success" />
                        )}
                      </div>
                      <div className="space-y-1">
                        {group.stops.map((stop, idx) => (
                          <div key={stop.id} className="text-xs flex items-center gap-2">
                            <span className="text-muted-foreground">{idx + 1}.</span>
                            <span className="flex-1 truncate">{stop.location_name}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                              stop.action === 'pickup'
                                ? 'bg-accent/20 text-accent'
                                : 'bg-warning/20 text-warning'
                            }`}>
                              {stop.action}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Actions */}
              {hasGroups && currentGroup && (
                <div className="space-y-2 pt-2 border-t border-border">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => handleMark3Complete(truck.id)}
                    disabled={mark3Complete.isPending}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Mark 3 Complete
                  </Button>
                  
                  {env.featureFlags.whatsappStub && (
                    <Button
                      size="sm"
                      variant="secondary"
                      className="w-full"
                      onClick={() => handleSendNext3(truck.id)}
                      disabled={sendNext3.isPending}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Send Next 3 (WhatsApp)
                    </Button>
                  )}
                </div>
              )}

              {/* ETA (mocked) */}
              {hasGroups && !groups.every(g => g.is_completed) && (
                <div className="pt-2 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    Est. completion: ~2.5 hours
                  </p>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
