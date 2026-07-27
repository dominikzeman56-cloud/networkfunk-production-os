import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const API = "http://localhost:3099";

interface Track {
  name: string;
  type?: string;
  index?: number;
}

interface SongInfo {
  tempo?: number;
  time_signature?: string;
  root_note?: string;
  scale?: string;
}

export function AbletonLiveControl() {
  const [connected, setConnected] = useState(false);
  const [song, setSong] = useState<SongInfo | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState("");

  const fetchSong = useCallback(async () => {
    try {
      const r = await fetch(`${API}/api/ableton/song`);
      if (!r.ok) throw new Error("Not connected");
      const d = await r.json();
      if (d.ok) {
        const info = typeof d.data === "string" ? JSON.parse(d.data) : d.data;
        setSong(info);
        setConnected(true);
      }
    } catch {
      setConnected(false);
    }
  }, []);

  const fetchTracks = useCallback(async () => {
    try {
      const r = await fetch(`${API}/api/ableton/tracks`);
      if (!r.ok) return;
      const d = await r.json();
      if (d.ok) {
        const list = typeof d.data === "string" ? JSON.parse(d.data) : d.data;
        setTracks(Array.isArray(list) ? list : []);
      }
    } catch {}
  }, []);

  const refresh = useCallback(async () => {
    setLoading("Refreshing…");
    await Promise.all([fetchSong(), fetchTracks()]);
    setLoading("");
  }, [fetchSong, fetchTracks]);

  const sendCommand = useCallback(async (endpoint: string, body = {}) => {
    try {
      setLoading("…");
      await fetch(`${API}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      await refresh();
    } catch (err) {
      console.error(err);
      setLoading("Error");
    }
  }, [refresh]);

  useEffect(() => { refresh(); }, [refresh]);

  return (
    <div className="space-y-4">
      {/* Status bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`inline-block w-2 h-2 rounded-full ${connected ? "bg-green-500" : "bg-red-500"}`} />
          <span className="text-xs text-muted-foreground">
            {connected ? "Ableton Live Connected" : "Disconnected — start Ableton with AbletonJS"}
          </span>
        </div>
        <div className="flex gap-2">
          {loading && <span className="text-xs text-muted-foreground">{loading}</span>}
          <Button variant="outline" size="sm" onClick={refresh}>Refresh</Button>
        </div>
      </div>

      {/* Transport */}
      <div className="flex items-center gap-2 p-3 bg-card border rounded-lg">
        <Button variant="default" size="sm" onClick={() => sendCommand("/api/ableton/play")} disabled={!connected}>
          ▶ Play
        </Button>
        <Button variant="secondary" size="sm" onClick={() => sendCommand("/api/ableton/stop")} disabled={!connected}>
          ■ Stop
        </Button>
        <span className="text-xs text-muted-foreground ml-2">
          BPM: {song?.tempo || "—"}
        </span>
        <span className="text-xs text-muted-foreground">
          Key: {song?.root_note || "—"} {song?.scale || ""}
        </span>
      </div>

      {/* Content tabs */}
      <Tabs defaultValue="tracks">
        <TabsList>
          <TabsTrigger value="tracks">Tracks</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
        </TabsList>

        <TabsContent value="tracks" className="mt-2">
          <div className="space-y-1 max-h-[400px] overflow-y-auto">
            {tracks.length === 0 && (
              <p className="text-sm text-muted-foreground py-8 text-center">No tracks loaded</p>
            )}
            {tracks.map((t, i) => (
              <div key={i} className="flex items-center justify-between p-2 bg-card border rounded text-sm">
                <span>{t.name || `Track ${i + 1}`}</span>
                <span className="text-xs text-muted-foreground">{t.type || "unknown"}</span>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="devices" className="mt-2">
          <p className="text-sm text-muted-foreground py-8 text-center">Select a track in Live to view its devices</p>
        </TabsContent>
      </Tabs>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" disabled={!connected}
          onClick={() => sendCommand("/api/ableton/tracks/create-midi", { name: "New MIDI" })}>
          + MIDI Track
        </Button>
        <Button variant="outline" size="sm" disabled={!connected}
          onClick={() => sendCommand("/api/ableton/tracks/create-audio", { name: "New Audio" })}>
          + Audio Track
        </Button>
      </div>
    </div>
  );
}
