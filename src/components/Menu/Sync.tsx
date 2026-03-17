import { db, type SyncAction } from "../../db";
import { useLiveQuery } from "dexie-react-hooks";
import Header from "../Header/Header";
import { useNotifications } from "../../Notification/NotificationContext";
import { AlertCircle, CheckCircle2, CircleDashed, Database, RefreshCcw } from "lucide-react";

const Sync = () => {


const queue: SyncAction[] | undefined = useLiveQuery(()=>db.syncQueue.toArray());

    const {showNotification} = useNotifications();

    const handleResetQueue = async () => {
        try {
            await db.syncQueue.clear();
            showNotification("Sync Queue reset!","success")
        } catch (error) {
            console.error(error);
            showNotification("Failed to reset Sync Queue", "success")
        }
    }


return (
    <div className="w-full h-full grid grid-rows-[auto_auto_1fr] gap-2 p-2">
        <Header title="Sync" />
        <div className="flex flex-col gap-2">
            <button 
                onClick={handleResetQueue}
                className="group rounded-xl bg-zinc-900 w-full p-4 grid grid-cols-[50px_1fr_20px] items-center hover:bg-red-950/30 transition-all active:scale-[0.98] text-left"
            >
                <div className="size-[40px] rounded-xl bg-zinc-700 flex items-center justify-center group-hover:bg-red-900/50 transition-colors">
                    <RefreshCcw className="size-5 text-white group-hover:text-red-200" />
                </div>
                <div className='flex flex-col'>
                    <p className="font-medium text-white group-hover:text-red-100">Reset Sync Queue</p>
                    <p className='text-sm text-white/50'>Clear all pending synchronization tasks</p>
                </div>
            </button>
        </div>
        <div className="flex flex-col gap-2 overflow-y-auto w-full h-full">
            {queue && queue.length > 0 ? queue.map(item=><SyncActionCard action={item} key={item.createdAt} />) : <p className="text-sm text-white/60">No items in queue</p>}
        </div>
    </div>
)

}


export default Sync;

const SyncActionCard = ({ action }: { action: SyncAction }) => {
  const statusColors = {
    pending: "text-zinc-500 bg-zinc-800/50 border-zinc-700/50",
    processing: "text-blue-400 bg-blue-500/10 border-blue-500/20 animate-pulse",
    failed: "text-red-400 bg-red-500/10 border-red-500/20",
    completed: "text-green-400 bg-green-500/10 border-green-500/20"
  };

  return (
    <div className="group rounded-xl bg-zinc-900 border border-white/5 p-4 flex flex-col gap-4 hover:border-white/10 transition-all">
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400">
            <Database className="size-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              {action.type.replace('_', ' ')}
            </h4>
            <p className="text-xs text-zinc-500">
              {new Date(action.createdAt).toLocaleTimeString()}
            </p>
          </div>
        </div>

        <div className={`px-2 py-1 rounded-md border text-[10px] font-black uppercase flex items-center gap-1.5 ${statusColors[action.status]}`}>
          {action.status === 'pending' && <CircleDashed className="size-3" />}
          {action.status === 'completed' && <CheckCircle2 className="size-3" />}
          {action.status === 'failed' && <AlertCircle className="size-3" />}
          {action.status}
        </div>
      </div>

      <div className="relative overflow-hidden rounded-lg bg-black/40 border border-white/5 p-3">
        <p className="text-[10px] text-zinc-500 uppercase font-bold mb-2 tracking-widest">Payload Data</p>
        <pre className="text-[11px] font-mono text-zinc-300 overflow-x-auto whitespace-pre-wrap">
          {typeof action.payload === 'object' 
            ? JSON.stringify(action.payload, null, 2) 
            : String(action.payload)}
        </pre>
      </div>

      {action.status === 'failed' && (
        <div className="flex items-center gap-2 text-red-400/80 text-xs bg-red-400/5 p-2 rounded-md border border-red-400/10">
          <RefreshCcw className="size-3" />
          <span>Retry attempt #{action.retryCount}</span>
        </div>
      )}
    </div>
  );
};