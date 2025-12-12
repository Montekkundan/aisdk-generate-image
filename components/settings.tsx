import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function Settings() {
  const getInitial = () => {
    if (typeof window === "undefined")
      return {
        gatewayKey: "",
        openaiKey: "",
        storage: "local" as const,
      };
    try {
      const sessionGateway = sessionStorage.getItem("AI_GATEWAY_API_KEY");
      const localGateway = localStorage.getItem("AI_GATEWAY_API_KEY");
      const sessionOpenAI = sessionStorage.getItem("OPENAI_API_KEY");
      const localOpenAI = localStorage.getItem("OPENAI_API_KEY");

      return {
        gatewayKey: sessionGateway || localGateway || "",
        openaiKey: sessionOpenAI || localOpenAI || "",
        storage: (sessionGateway || sessionOpenAI ? "session" : "local") as
          | "local"
          | "session",
      };
    } catch {
      // ignore
    }
    return {
      gatewayKey: "",
      openaiKey: "",
      storage: "local" as const,
    };
  };

  const initial = getInitial();
  const [gatewayKey, setGatewayKey] = useState<string>(initial.gatewayKey);
  const [openaiKey, setOpenaiKey] = useState<string>(initial.openaiKey);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle"
  );
  const [storage, setStorage] = useState<"local" | "session">(initial.storage);

  async function saveKey() {
    setStatus("saving");
    try {
      try {
        if (storage === "local") {
          localStorage.setItem("AI_GATEWAY_API_KEY", gatewayKey);
          localStorage.setItem("OPENAI_API_KEY", openaiKey);
          sessionStorage.removeItem("AI_GATEWAY_API_KEY");
          sessionStorage.removeItem("OPENAI_API_KEY");
        } else {
          sessionStorage.setItem("AI_GATEWAY_API_KEY", gatewayKey);
          sessionStorage.setItem("OPENAI_API_KEY", openaiKey);
          localStorage.removeItem("AI_GATEWAY_API_KEY");
          localStorage.removeItem("OPENAI_API_KEY");
        }
      } catch {
        // ignore storage errors
      }
      setStatus("saved");
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
    setTimeout(() => setStatus("idle"), 2000);
  }

  function clearKey() {
    try {
      localStorage.removeItem("AI_GATEWAY_API_KEY");
      localStorage.removeItem("OPENAI_API_KEY");
      sessionStorage.removeItem("AI_GATEWAY_API_KEY");
      sessionStorage.removeItem("OPENAI_API_KEY");
      setGatewayKey("");
      setOpenaiKey("");
      setStorage("local");
      setStatus("idle");
    } catch {}
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Settings</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Add your keys</SheetTitle>
          <SheetDescription>
            Add your API keys to use the AI services.
          </SheetDescription>
        </SheetHeader>
        <div className="grid flex-1 auto-rows-min gap-6 px-4 py-4">
          <div className="grid gap-3">
            <Label htmlFor="gateway-key">AI_GATEWAY_API_KEY</Label>
            <Input
              id="gateway-key"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setGatewayKey(e.target.value)
              }
              type="password"
              value={gatewayKey}
            />
          </div>
          <div className="grid gap-3">
            <Label htmlFor="openai-key">OPENAI_API_KEY</Label>
            <Input
              id="openai-key"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setOpenaiKey(e.target.value)
              }
              type="password"
              value={openaiKey}
            />
          </div>
        </div>
        <SheetFooter>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <label className="text-sm">Store in:</label>
              <Select
                onValueChange={(v) => setStorage(v as "local" | "session")}
                value={storage}
              >
                <SelectTrigger className="w-56">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="local">Local Storage (persist)</SelectItem>
                  <SelectItem value="session">
                    Session Storage (current tab)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              disabled={status === "saving"}
              onClick={saveKey}
              type="button"
            >
              {status === "saving"
                ? "Saving..."
                : status === "saved"
                  ? "Saved"
                  : "Save changes"}
            </Button>

            <Button onClick={clearKey} type="button" variant="outline">
              Clear
            </Button>

            <SheetClose asChild>
              <Button variant="outline">Close</Button>
            </SheetClose>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
